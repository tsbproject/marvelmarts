import { NextResponse } from "next/server";
import { NotificationContext } from "@prisma/client";

import {
  handleApiError,
  requireAuth,
  requireManageMessages,
} from "@/app/lib/auth/api";
import { verifyOrigin } from "@/app/lib/auth/csrf";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";
import { badRequest, forbidden } from "@/app/lib/auth/errors";
import { prisma } from "@/app/lib/prisma";

import {
  getUserBroadcasts,
  markAllBroadcastsRead,
  markBroadcastRead,
  deleteBroadcasts,
  sendBroadcast,
  type BroadcastAudience,
} from "@/app/lib/services/broadcast.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseContext(
  value: string | null
): NotificationContext | null {
  if (value === "CUSTOMER") {
    return NotificationContext.CUSTOMER;
  }

  if (value === "VENDOR") {
    return NotificationContext.VENDOR;
  }

  return null;
}

async function hasContextAccess(
  userId: string,
  context: NotificationContext
) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      roles: true,
      vendorProfile: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!user) {
    return false;
  }

  if (context === NotificationContext.CUSTOMER) {
    return user.roles.includes("CUSTOMER");
  }

  if (context === NotificationContext.VENDOR) {
    return (
      user.roles.includes("VENDOR") &&
      user.vendorProfile !== null
    );
  }

  return false;
}

async function requireContextAccess(
  contextValue: string | null
) {
  const session = await requireAuth();

  const context = parseContext(contextValue);

  if (!context) {
    throw badRequest(
      "A valid communication context is required."
    );
  }

  const allowed = await hasContextAccess(
    session.user.id,
    context
  );

  if (!allowed) {
    throw forbidden(
      "Communication context access denied."
    );
  }

  return {
    session,
    context,
  };
}

export const GET = withApiLogging(
  async (req: Request) => {
    try {
      const url = new URL(req.url);

      const contextValue =
        url.searchParams.get("context");

      const { session, context } =
        await requireContextAccess(
          contextValue
        );

      const page = Math.max(
        1,
        Number(
          url.searchParams.get("page") ?? "1"
        ) || 1
      );

      const pageSize = Math.min(
        100,
        Math.max(
          1,
          Number(
            url.searchParams.get("pageSize") ?? "20"
          ) || 20
        )
      );

      const search =
        url.searchParams.get("search")?.trim() ||
        undefined;

      const result = await getUserBroadcasts({
        userId: session.user.id,
        context,
        page,
        pageSize,
        search,
      });

      return NextResponse.json(result);
    } catch (error) {
      return handleApiError(error);
    }
  }
);

export const POST = withApiLogging(
  async (req: Request) => {
    try {
      await verifyOrigin(req);

      await requireManageMessages();

      const body = await req.json();

      const title =
        typeof body.title === "string"
          ? body.title.trim()
          : "";

      const message =
        typeof body.message === "string"
          ? body.message.trim()
          : "";

      const audience =
        body.audience === "CUSTOMERS" ||
        body.audience === "VENDORS"
          ? (body.audience as BroadcastAudience)
          : null;

      if (!title || !message || !audience) {
        return NextResponse.json(
          {
            error:
              "Title, message, and a valid audience are required.",
          },
          {
            status: 400,
          }
        );
      }

      if (title.length > 200) {
        return NextResponse.json(
          {
            error:
              "Communication title must not exceed 200 characters.",
          },
          {
            status: 400,
          }
        );
      }

      if (message.length > 10000) {
        return NextResponse.json(
          {
            error:
              "Communication message must not exceed 10,000 characters.",
          },
          {
            status: 400,
          }
        );
      }

      const result = await sendBroadcast({
        title,
        message,
        audience,
      });

      return NextResponse.json(result);
    } catch (error) {
      return handleApiError(error);
    }
  }
);

export const PATCH = withApiLogging(
  async (req: Request) => {
    try {
      await verifyOrigin(req);

      const body = await req.json();

      const contextValue =
        typeof body.context === "string"
          ? body.context
          : null;

      const { session, context } =
        await requireContextAccess(
          contextValue
        );

      if (
        body.markAll === true ||
        body.all === true
      ) {
        await markAllBroadcastsRead(
          session.user.id,
          context
        );

        return NextResponse.json({
          success: true,
        });
      }

      const id =
        typeof body.id === "string"
          ? body.id.trim()
          : typeof body.notificationId === "string"
            ? body.notificationId.trim()
            : "";

      if (!id) {
        return NextResponse.json(
          {
            error:
              "Notification ID is required.",
          },
          {
            status: 400,
          }
        );
      }

      await markBroadcastRead(
        session.user.id,
        id,
        context
      );

      return NextResponse.json({
        success: true,
      });
    } catch (error) {
      return handleApiError(error);
    }
  }
);

export const DELETE = withApiLogging(
  async (req: Request) => {
    try {
      await verifyOrigin(req);

      const body = await req.json();

      const contextValue =
        typeof body.context === "string"
          ? body.context
          : null;

      const { session, context } =
        await requireContextAccess(
          contextValue
        );

      const rawIds = Array.isArray(body.ids)
        ? body.ids
        : Array.isArray(body.notificationIds)
          ? body.notificationIds
          : typeof body.notificationId === "string"
            ? [body.notificationId]
            : [];

      const ids = rawIds.filter(
        (id: unknown): id is string =>
          typeof id === "string" &&
          id.trim().length > 0
      );

      if (ids.length === 0) {
        return NextResponse.json(
          {
            error:
              "At least one notification ID is required.",
          },
          {
            status: 400,
          }
        );
      }

      if (ids.length > 100) {
        return NextResponse.json(
          {
            error:
              "You can delete at most 100 notifications at once.",
          },
          {
            status: 400,
          }
        );
      }

      await deleteBroadcasts(
        session.user.id,
        ids,
        context
      );

      return NextResponse.json({
        success: true,
      });
    } catch (error) {
      return handleApiError(error);
    }
  }
);
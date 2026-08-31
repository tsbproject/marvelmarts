import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma, UserRole } from "@prisma/client";
import prisma from "@/app/lib/prisma";
import { notFound } from "@/app/lib/auth/errors";
import { ZodError } from "zod";
import type { Session } from "next-auth";
import { logger } from "@/app/lib/logger";
import { SecurityLogService } from "@/app/lib/services/logging/security-log.service";


import { authOptions } from "@/app/lib/auth";
import { handleAuthError } from "./handlers";
import type { AdminPermissions } from "./types";
import {
  hasPermission,
  isSuperAdmin,
} from "./authorization";
import {
  unauthorized,
  forbidden,
} from "./errors";

/* -------------------------------------------------------------------------- */
/*                          API ERROR HANDLER                                 */
/* -------------------------------------------------------------------------- */

export function handleApiError(error: unknown) {
  const authResponse = handleAuthError(error);

  if (authResponse) {
    return authResponse;
  }

  /* ---------------------------------------------------------------------- */
  /* ZOD VALIDATION                                                         */
  /* ---------------------------------------------------------------------- */

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: "Validation failed.",
        errors: error.flatten().fieldErrors,
      },
      {
        status: 400,
      }
    );
  }

  /* ---------------------------------------------------------------------- */
  /* PRISMA ERRORS                                                          */
  /* ---------------------------------------------------------------------- */

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        return NextResponse.json(
          {
            success: false,
            error: "A record with this value already exists.",
            code: error.code,
          },
          {
            status: 409,
          }
        );

      case "P2025":
        return NextResponse.json(
          {
            success: false,
            error: "Requested resource was not found.",
            code: error.code,
          },
          {
            status: 404,
          }
        );

      case "P2003":
        return NextResponse.json(
          {
            success: false,
            error: "Operation failed because related data exists.",
            code: error.code,
          },
          {
            status: 400,
          }
        );

      default:
       logger.error("PRISMA_ERROR", error);

        return NextResponse.json(
          {
            success: false,
            error: "Database operation failed.",
            code: error.code,
          },
          {
            status: 400,
          }
        );
    }
  }

  /* ---------------------------------------------------------------------- */
  /* NORMAL ERRORS                                                          */
  /* ---------------------------------------------------------------------- */

  if (error instanceof Error) {
  logger.error("AUTH_ERROR", error);

  return NextResponse.json(
    {
      success: false,
      error: "Internal server error.",
    },
    {
      status: 500,
    }
  );
}

  /* ---------------------------------------------------------------------- */
  /* UNKNOWN                                                                */
  /* ---------------------------------------------------------------------- */

    logger.error("UNHANDLED_API_ERROR", error);

  return NextResponse.json(
    {
      success: false,
      error: "Internal server error.",
    },
    {
      status: 500,
    }
  );
}

/* -------------------------------------------------------------------------- */
/*                              AUTH HELPERS                                  */
/* -------------------------------------------------------------------------- */

async function logPermissionDenied(
  session: Session | null,
  reason: string
) {
  await SecurityLogService.permissionDenied({
    userId: session?.user?.id,
    metadata: {
      reason,
      role: session?.user?.role,
    },
  });
}

export async function requireAuth(): Promise<Session> {
  const session = await getServerSession(authOptions);

 if (!session?.user?.id) {
  await logPermissionDenied(
    session,
    "Unauthenticated request"
  );

  throw unauthorized();
}

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      isSuspended: true,
    },
  });

  if (!user) {
    await logPermissionDenied(
      session,
      "Account no longer exists"
    );

    throw unauthorized(
      "Your account no longer exists."
    );
  }

  if (user.isSuspended) {
    await logPermissionDenied(
      session,
      "Suspended account"
    );

    throw forbidden(
      "Your account has been suspended."
    );
  }

  return session;
}

export async function requireRole(
  ...requiredRoles: UserRole[]
): Promise<Session> {
  const session = await requireAuth();

  const userRoles: UserRole[] =
    session.user.roles?.length
      ? (session.user.roles as UserRole[])
      : session.user.role
        ? [session.user.role as UserRole]
        : [];

  const hasRequiredRole =
    requiredRoles.some((role) =>
      userRoles.includes(role)
    );

  if (!hasRequiredRole) {
      await logPermissionDenied(
        session,
        `Missing role: ${requiredRoles.join(", ")}`
      );

      throw forbidden(
        "You do not have permission to perform this action."
      );
    }

  return session;
}

export async function requireAdmin() {
  return requireRole(
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN
  );
}

export async function requireVendor() {
  return requireRole(UserRole.VENDOR);
}

export async function requireCustomer() {
  return requireRole(UserRole.CUSTOMER);
}



export async function requireVendorProfile() {
    const session = await requireVendor();

    const vendor = await prisma.vendorProfile.findUnique({
        where: {
            userId: session.user.id,
        },
        select: {
            id: true,
        },
    });

    if (!vendor) {
        throw notFound("Vendor profile not found.");
    }

    return {
        session,
        vendor,
    };
}




export async function requireSuperAdmin() {
  const session = await requireAuth();

  if (!isSuperAdmin(session)) {
    await logPermissionDenied(
      session,
      "Super Administrator required"
    );

    throw forbidden(
      "Super Administrator access required."
    );
  }

  return session;
}

export async function requirePermission(
  permission: keyof AdminPermissions
) {
  const session =
    await requireAdmin();

  if (
    !hasPermission(
      session,
      permission
    )
  ) {
    await logPermissionDenied(
      session,
      `Missing permission: ${permission}`
    );

    throw forbidden(
      "Insufficient permissions."
    );
  }

  return session;
}





export async function getOptionalSession(): Promise<Session | null> {
  return getServerSession(authOptions);
}




export const requireManageAdmins = () =>
  requirePermission("manageAdmins");

export const requireManageUsers = () =>
  requirePermission("manageUsers");

export const requireManageProducts = () =>
  requirePermission("manageProducts");

export const requireManageOrders = () =>
  requirePermission("manageOrders");

export const requireManageMessages = () =>
  requirePermission("manageMessages");

export const requireManageSettings = () =>
  requirePermission("manageSettings");

export const requireManageCategories = () =>
  requirePermission("manageCategories");

export const requireManageVendors = () =>
  requirePermission("manageVendors");

export const requireManageVerifications = () =>
  requirePermission("manageVerifications");

export const requireManageSubscribers = () =>
  requirePermission("manageSubscribers");

export const requireManageReviews = () =>
  requirePermission("manageReviews");

export const requireManageActivity = () =>
  requirePermission("manageActivity");

export const requireManageTrending = () =>
  requirePermission("manageTrending");

export const requireManageSupport = () =>
  requirePermission("manageSupport");

export const requireManagePayout = () =>
  requirePermission("managePayout");
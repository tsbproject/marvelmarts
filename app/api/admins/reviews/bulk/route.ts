import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/app/lib/prisma";

import { requireManageReviews } from "@/app/lib/auth/guards";
import { handleApiError } from "@/app/lib/auth/api";
import { badRequest } from "@/app/lib/auth/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* -------------------------------------------------------------------------- */
/*                           BULK APPROVE / REJECT                            */
/* -------------------------------------------------------------------------- */

export async function PATCH(req: NextRequest) {
  try {
    await requireManageReviews();

    const body = await req.json();

    const ids = body.ids;
    const approved = body.approved;

    if (!Array.isArray(ids) || ids.length === 0) {
      throw badRequest(
        "At least one review must be selected."
      );
    }

    if (typeof approved !== "boolean") {
      throw badRequest(
        "Approved flag is required."
      );
    }

    const result = await prisma.review.updateMany({
      where: {
        id: {
          in: ids,
        },
      },
      data: {
        approved,
      },
    });

    return NextResponse.json(
      {
        success: true,
        updated: result.count,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

/* -------------------------------------------------------------------------- */
/*                           BULK DELETE                                      */
/* -------------------------------------------------------------------------- */

export async function DELETE(req: NextRequest) {
  try {
    await requireManageReviews();

    const body = await req.json();

    const ids = body.ids;

    if (!Array.isArray(ids) || ids.length === 0) {
      throw badRequest(
        "At least one review must be selected."
      );
    }

    const result = await prisma.review.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        deleted: result.count,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
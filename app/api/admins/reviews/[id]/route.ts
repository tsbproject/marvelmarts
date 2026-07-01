import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/app/lib/prisma";

import { requireManageReviews } from "@/app/lib/auth/guards";
import { handleApiError } from "@/app/lib/auth/api";
import {
  badRequest,
  notFound,
} from "@/app/lib/auth/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* -------------------------------------------------------------------------- */
/*                           UPDATE REVIEW                                    */
/* -------------------------------------------------------------------------- */

export async function PATCH(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    await requireManageReviews();

    const { id } = await params;

    const body = await req.json();

    if (typeof body.approved !== "boolean") {
      throw badRequest(
        "Approved status is required."
      );
    }

    const existingReview =
      await prisma.review.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
        },
      });

    if (!existingReview) {
      throw notFound(
        "Review not found."
      );
    }

    const review =
      await prisma.review.update({
        where: {
          id,
        },
        data: {
          approved: body.approved,
        },
      });

    return NextResponse.json(
      {
        success: true,
        review,
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
/*                           DELETE REVIEW                                    */
/* -------------------------------------------------------------------------- */

export async function DELETE(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    await requireManageReviews();

    const { id } = await params;

    const existingReview =
      await prisma.review.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
        },
      });

    if (!existingReview) {
      throw notFound(
        "Review not found."
      );
    }

    await prisma.review.delete({
      where: {
        id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Review deleted successfully.",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
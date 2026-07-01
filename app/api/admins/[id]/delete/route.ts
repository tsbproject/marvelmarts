import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/app/lib/prisma";

import { requireSuperAdmin } from "@/app/lib/auth/guards";
import { handleApiError } from "@/app/lib/auth/api";
import {
  badRequest,
  forbidden,
  notFound,
} from "@/app/lib/auth/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
    const session =
      await requireSuperAdmin();

    const { id } = await params;

    if (session.user.id === id) {
      throw badRequest(
        "You cannot delete your own account."
      );
    }

    const target =
      await prisma.user.findUnique({
        where: {
          id,
        },
        include: {
          adminProfile: true,
        },
      });

    if (!target) {
      throw notFound(
        "Administrator not found."
      );
    }

    if (target.role === "SUPER_ADMIN") {
      throw forbidden(
        "Super Administrators cannot be deleted."
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.adminProfile.deleteMany({
        where: {
          userId: id,
        },
      });

      await tx.user.delete({
        where: {
          id,
        },
      });
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Administrator deleted successfully.",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
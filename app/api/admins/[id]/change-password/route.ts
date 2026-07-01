import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/app/lib/prisma";

import { requireSuperAdmin } from "@/app/lib/auth/guards";
import { handleApiError } from "@/app/lib/auth/api";
import {
  badRequest,
  notFound,
} from "@/app/lib/auth/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
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
    await requireSuperAdmin();

    const { id } = await params;

    const { newPassword } =
      await req.json();

    if (
      !newPassword ||
      newPassword.length < 8
    ) {
      throw badRequest(
        "Password must be at least 8 characters."
      );
    }

    const user =
      await prisma.user.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
        },
      });

    if (!user) {
      throw notFound(
        "User not found."
      );
    }

    const passwordHash =
      await bcrypt.hash(
        newPassword,
        10
      );

    await prisma.user.update({
      where: {
        id,
      },
      data: {
        passwordHash,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Password updated successfully.",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
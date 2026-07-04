// app/api/wishlist/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

import {
  requireAuth,
  handleApiError,
} from "@/app/lib/auth/api";

import {
  badRequest,
} from "@/app/lib/auth/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = {
  params: Promise<{ id: string }>;
};

export async function DELETE(
  request: NextRequest,
  { params }: Context
) {
  try {
    const session = await requireAuth();

    const { id } = await params;

    if (!id) {
      throw badRequest("Wishlist item ID is required.");
    }

    let deletion = await prisma.wishlist.deleteMany({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (deletion.count === 0) {
      deletion = await prisma.wishlist.deleteMany({
        where: {
          productId: id,
          userId: session.user.id,
        },
      });
    }

    return NextResponse.json({
      success: true,
      removed: deletion.count > 0,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
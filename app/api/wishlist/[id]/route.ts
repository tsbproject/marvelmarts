import { NextRequest, NextResponse } from "next/server";

import { WishlistService } from "@/app/lib/services/wishlist.service";

import {
  requireAuth,
  handleApiError,
} from "@/app/lib/auth/api";

import { badRequest } from "@/app/lib/auth/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(
  request: NextRequest,
  { params }: Context
) {
  try {
    const session =
      await requireAuth();

    const { id } =
      await params;

    if (!id) {
      throw badRequest(
        "Wishlist item ID is required."
      );
    }

    const removed =
      await WishlistService.removeWishlistItem(
        session.user.id,
        id
      );

    return NextResponse.json({
      success: true,
      removed,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
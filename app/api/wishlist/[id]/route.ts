import { NextRequest, NextResponse } from "next/server";

import { WishlistService } from "@/app/lib/services/wishlist.service";

import {
  requireAuth,
  handleApiError,
} from "@/app/lib/auth/api";

import { verifyOrigin } from "@/app/lib/auth/csrf";
import { badRequest } from "@/app/lib/auth/errors";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

export const DELETE = withApiLogging(
  async (
    request: NextRequest,
    { params }: Context
  ) => {
    try {
      verifyOrigin(request);

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
);
import { NextResponse } from "next/server";

import { WishlistService } from "@/app/lib/services/wishlist.service";

import {
  requireAuth,
  handleApiError,
} from "@/app/lib/auth/api";

import { badRequest } from "@/app/lib/auth/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session =
      await requireAuth();

    const wishlistItems =
      await WishlistService.getWishlist(
        session.user.id
      );

    return NextResponse.json({
      success: true,
      items: wishlistItems.map(
        (item) => ({
          id: item.id,
          productId:
            item.product.id,
          name:
            item.product.title,
          slug:
            item.product.slug,
          price: Number(
            item.product.price
          ),
          image:
            item.product.images[0]
              ?.url ??
            "/placeholder-product.png",
        })
      ),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  req: Request
) {
  try {
    const session =
      await requireAuth();

    const { productId } =
      await req.json();

    if (!productId) {
      throw badRequest(
        "Product ID is required."
      );
    }

    const action =
      await WishlistService.toggleWishlist(
        session.user.id,
        productId
      );

    return NextResponse.json({
      success: true,
      action,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
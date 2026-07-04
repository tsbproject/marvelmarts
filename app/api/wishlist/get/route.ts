import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

import {
  requireAuth,
  handleApiError,
} from "@/app/lib/auth/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireAuth();

    const wishlistItems = await prisma.wishlist.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        product: {
          include: {
            images: {
              take: 1,
              orderBy: {
                order: "asc",
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      wishlistItems.map((item) => ({
        id: item.id,
        productId: item.product.id,
        name: item.product.title,
        slug: item.product.slug,
        price: Number(item.product.price),
        image:
          item.product.images[0]?.url ??
          "/placeholder-product.png",
      }))
    );
  } catch (error) {
    /**
     * Keep existing frontend behaviour.
     * Wishlist page expects an array.
     */
    if (
      error instanceof Error &&
      error.name === "ApiError"
    ) {
      return NextResponse.json([], {
        status: 200,
      });
    }

    return handleApiError(error);
  }
}
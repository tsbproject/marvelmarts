import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

import {
  requireAuth,
  handleApiError,
} from "@/app/lib/auth/api";

import {
  badRequest,
} from "@/app/lib/auth/errors";

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

    return NextResponse.json({
      success: true,
      items: wishlistItems.map((item) => ({
        id: item.id,
        productId: item.product.id,
        name: item.product.title,
        slug: item.product.slug,
        price: Number(item.product.price),
        image:
          item.product.images[0]?.url ??
          "/placeholder-product.png",
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireAuth();

    const { productId } = await req.json();

    if (!productId) {
      throw badRequest("Product ID is required.");
    }

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
      select: {
        id: true,
      },
    });

    if (!product) {
      throw badRequest("Product not found.");
    }

    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
    });

    if (existing) {
      await prisma.wishlist.delete({
        where: {
          id: existing.id,
        },
      });

      return NextResponse.json({
        success: true,
        action: "removed",
      });
    }

    await prisma.wishlist.create({
      data: {
        userId: session.user.id,
        productId,
      },
    });

    return NextResponse.json({
      success: true,
      action: "added",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
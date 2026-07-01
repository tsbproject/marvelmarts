import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/app/lib/prisma";

import { requireAuth } from "@/app/lib/auth/guards";
import { handleApiError } from "@/app/lib/auth/api";
import {
  badRequest,
  notFound,
} from "@/app/lib/auth/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest
) {
  try {
    const session =
      await requireAuth();

    const body = await req.json();

    const {
      productId,
      rating,
      body: reviewBody,
    } = body;

    if (!productId) {
      throw badRequest(
        "Product is required."
      );
    }

    if (
      !rating ||
      Number(rating) < 1 ||
      Number(rating) > 5
    ) {
      throw badRequest(
        "Rating must be between 1 and 5."
      );
    }

    const product =
      await prisma.product.findUnique({
        where: {
          id: productId,
        },
        select: {
          id: true,
        },
      });

    if (!product) {
      throw notFound(
        "Product not found."
      );
    }

    const purchased =
      await prisma.order.findFirst({
        where: {
          userId: session.user.id,
          status: "DELIVERED",
          items: {
            some: {
              productId,
            },
          },
        },
        select: {
          id: true,
        },
      });

    const review =
      await prisma.review.create({
        data: {
          productId,
          userId: session.user.id,
          rating: Number(rating),
          body: reviewBody,
          isVerified: !!purchased,
          approved: true,
        },
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      });

    return NextResponse.json(
      {
        success: true,
        review,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
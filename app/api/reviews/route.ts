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

export async function POST(req: Request) {
  try {
    const session = await requireAuth();

    const { productId, rating, body } = await req.json();

    if (!productId) {
      throw badRequest("Product ID is required.");
    }

    const numericRating = Number(rating);

    if (
      !Number.isFinite(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      throw badRequest("Rating must be between 1 and 5.");
    }

    if (!body || typeof body !== "string" || body.trim().length < 5) {
      throw badRequest("Review must contain at least 5 characters.");
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

    const existingReview = await prisma.review.findFirst({
      where: {
        userId: session.user.id,
        productId,
      },
      select: {
        id: true,
      },
    });

    if (existingReview) {
      throw badRequest("You have already reviewed this product.");
    }

    const purchased = await prisma.order.findFirst({
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

    const review = await prisma.review.create({
      data: {
        productId,
        userId: session.user.id,
        rating: numericRating,
        body: body.trim(),
        isVerified: Boolean(purchased),
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

    return NextResponse.json(review);
  } catch (error) {
    return handleApiError(error);
  }
}
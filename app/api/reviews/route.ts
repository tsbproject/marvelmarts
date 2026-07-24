import { NextResponse } from "next/server";

import { requireAuth, handleApiError,} from "@/app/lib/auth/api";

import {badRequest } from "@/app/lib/auth/errors";

import { ProductService } from "@/app/lib/services/product.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: Request
) {
  try {
    const session =
      await requireAuth();

    const {
      productId,
      rating,
      body,
    } = await req.json();

    if (!productId) {
      throw badRequest(
        "Product ID is required."
      );
    }

    const numericRating =
      Number(rating);

    if (
      !Number.isFinite(
        numericRating
      ) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      throw badRequest(
        "Rating must be between 1 and 5."
      );
    }

    if (
      !body ||
      typeof body !== "string" ||
      body.trim().length < 5
    ) {
      throw badRequest(
        "Review must contain at least 5 characters."
      );
    }

    const review =
      await ProductService.createProductReview(
        session.user.id,
        {
          productId,
          rating: numericRating,
          body: body.trim(),
        }
      );

    return NextResponse.json(
      review
    );
  } catch (error) {
    return handleApiError(
      error
    );
  }
}
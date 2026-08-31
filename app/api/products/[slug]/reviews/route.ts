import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { ProductService } from "@/app/lib/services/product.service";
import { verifyOrigin } from "@/app/lib/auth/csrf";

import {
  handleApiError,
  requireCustomer,
} from "@/app/lib/auth/api";

import { badRequest } from "@/app/lib/auth/errors";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* -------------------------------------------------------------------------- */
/* REVIEW SCHEMA                                                              */
/* -------------------------------------------------------------------------- */

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().optional(),
  body: z.string().optional(),
  pros: z.string().optional(),
  cons: z.string().optional(),
});

/* -------------------------------------------------------------------------- */
/* GET REVIEWS                                                                */
/* -------------------------------------------------------------------------- */

export const GET = withApiLogging(
  async (
    request: NextRequest,
    {
      params,
    }: {
      params: Promise<{
        slug: string;
      }>;
    }
  ) => {
    try {
      const { slug } =
        await params;

      const { searchParams } =
        new URL(request.url);

      const page = Math.max(
        Number(searchParams.get("page") ?? 1),
        1
      );

      const limit = Math.min(
        Math.max(
          Number(
            searchParams.get("limit") ?? 10
          ),
          1
        ),
        50
      );

      const {
        reviews,
        total,
      } =
        await ProductService.getProductReviews(
          slug,
          page,
          limit
        );

      return NextResponse.json({
        success: true,
        reviews,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(
            total / limit
          ),
        },
      });
    } catch (error) {
      return handleApiError(error);
    }
  }
);

/* -------------------------------------------------------------------------- */
/* POST REVIEW                                                                */
/* -------------------------------------------------------------------------- */

export const POST = withApiLogging(
  async (
    request: NextRequest,
    {
      params,
    }: {
      params: Promise<{
        slug: string;
      }>;
    }
  ) => {
    try {
      verifyOrigin(request);

      const session =
        await requireCustomer();

      const { slug } =
        await params;

      const body =
        await request.json();

      const parsed =
        reviewSchema.parse(body);

      const review =
        await ProductService.createReview(
          slug,
          session.user.id,
          parsed
        );

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
);

/* -------------------------------------------------------------------------- */
/* DELETE REVIEW                                                              */
/* -------------------------------------------------------------------------- */

export const DELETE = withApiLogging(
  async (
    request: NextRequest,
    {
      params,
    }: {
      params: Promise<{
        slug: string;
      }>;
    }
  ) => {
    try {
      const session =
        await requireCustomer();

      const { slug } =
        await params;

      const { searchParams } =
        new URL(request.url);

      const reviewId =
        searchParams.get("id");

      if (!reviewId) {
        throw badRequest(
          "Review ID is required."
        );
      }

      await ProductService.deleteReviewBySlug(
        slug,
        reviewId,
        session.user.id,
        session.user.role
      );

      return NextResponse.json({
        success: true,
        message:
          "Review deleted successfully.",
      });
    } catch (error) {
      return handleApiError(error);
    }
  }
);
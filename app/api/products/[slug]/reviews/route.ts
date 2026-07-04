import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/app/lib/prisma";

import {
  handleApiError,
  requireCustomer,
} from "@/app/lib/auth/api";

import {
  badRequest,
  forbidden,
  notFound,
} from "@/app/lib/auth/errors";

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

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      slug: string;
    }>;
  }
) {
  try {
    const { slug } = await params;

    const { searchParams } =
      new URL(request.url);

    const page = Math.max(
      Number(searchParams.get("page") ?? 1),
      1
    );

    const limit = Math.min(
      Math.max(
        Number(searchParams.get("limit") ?? 10),
        1
      ),
      50
    );

    const product =
      await prisma.product.findUnique({
        where: {
          slug,
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

    const reviews =
      await prisma.review.findMany({
        where: {
          productId: product.id,
        },

        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },

        skip: (page - 1) * limit,

        take: limit,
      });

    const total =
      await prisma.review.count({
        where: {
          productId: product.id,
        },
      });

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

// POST /api/products/[slug]/reviews
/* -------------------------------------------------------------------------- */
/* POST REVIEW                                                                */
/* -------------------------------------------------------------------------- */

export async function POST(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      slug: string;
    }>;
  }
) {
  try {
    const session = await requireCustomer();

    const { slug } = await params;

    const body = await request.json();

    const parsed = reviewSchema.parse(body);

    const product = await prisma.product.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
      },
    });

    if (!product) {
      throw notFound("Product not found.");
    }

    const existingReview = await prisma.review.findFirst({
      where: {
        productId: product.id,
        userId: session.user.id,
      },
    });

    if (existingReview) {
      throw badRequest(
        "You have already reviewed this product."
      );
    }

    const purchased = await prisma.order.findFirst({
      where: {
        userId: session.user.id,
        status: "DELIVERED",
        items: {
          some: {
            productId: product.id,
          },
        },
      },
      select: {
        id: true,
      },
    });

    const review = await prisma.review.create({
      data: {
        rating: parsed.rating,
        title: parsed.title,
        body: parsed.body,
        pros: parsed.pros,
        cons: parsed.cons,

        userId: session.user.id,

        productId: product.id,

        isVerified: !!purchased,

        approved: true,
      },

      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
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

/* -------------------------------------------------------------------------- */
/* DELETE REVIEW                                                              */
/* -------------------------------------------------------------------------- */

export async function DELETE(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      slug: string;
    }>;
  }
) {
  try {
    const session = await requireCustomer();

    const { slug } = await params;

    const { searchParams } = new URL(request.url);

    const reviewId = searchParams.get("id");

    if (!reviewId) {
      throw badRequest(
        "Review ID is required."
      );
    }

    const product = await prisma.product.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
      },
    });

    if (!product) {
      throw notFound("Product not found.");
    }

    const review = await prisma.review.findUnique({
      where: {
        id: reviewId,
      },
      select: {
        id: true,
        userId: true,
        productId: true,
      },
    });

    if (!review || review.productId !== product.id) {
      throw notFound("Review not found.");
    }

    const isAdmin =
      session.user.role === "ADMIN" ||
      session.user.role === "SUPER_ADMIN";

    if (
      !isAdmin &&
      review.userId !== session.user.id
    ) {
        throw forbidden(
      "You do not have permission to delete this review."
  );
    }

    await prisma.review.delete({
      where: {
        id: review.id,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "Review deleted successfully.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}


import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Zod schema for review input
const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5, "Rating must be between 1 and 5"),
  title: z.string().optional(),
  body: z.string().optional(),
  pros: z.string().optional(),
  cons: z.string().optional(),
  userId: z.string().min(1, "User ID is required"),
});

// GET /api/products/[slug]/reviews
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") ?? 1);
    const limit = Number(searchParams.get("limit") ?? 10);

    const product = await prisma.product.findUnique({
      where: { slug: params.slug },
    });

    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    const reviews = await prisma.review.findMany({
      where: { productId: product.id },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { user: true },
    });

    return NextResponse.json(reviews);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("GET /api/products/[slug]/reviews error:", err);
    return NextResponse.json({ message }, { status: 500 });
  }
}

// POST /api/products/[slug]/reviews
export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const body = await request.json();
    const parsed = reviewSchema.parse(body);

    const product = await prisma.product.findUnique({
      where: { slug: params.slug },
    });

    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    const review = await prisma.review.create({
      data: {
        rating: parsed.rating,
        title: parsed.title,
        body: parsed.body,
        pros: parsed.pros,
        cons: parsed.cons,
        userId: parsed.userId,
        productId: product.id,
      },
      include: { user: true },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ errors: err.flatten() }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("POST /api/products/[slug]/reviews error:", err);
    return NextResponse.json({ message }, { status: 500 });
  }
}

// DELETE /api/products/[slug]/reviews
export async function DELETE(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get("id");

    if (!reviewId) {
      return NextResponse.json({ message: "Review ID required" }, { status: 400 });
    }

    await prisma.review.delete({
      where: { id: reviewId },
    });

    return NextResponse.json({ message: "Review deleted successfully" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("DELETE /api/products/[slug]/reviews error:", err);
    return NextResponse.json({ message }, { status: 500 });
  }
}

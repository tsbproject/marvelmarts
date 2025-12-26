import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Zod schema for image input
const imageSchema = z.object({
  url: z.string().url("Image URL must be valid"),
  alt: z.string().optional(),
  order: z.number().optional(),
});

// GET /api/products/[slug]/images
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: params.slug },
      include: { images: true },
    });

    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product.images);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("GET /api/products/[slug]/images error:", err);
    return NextResponse.json({ message }, { status: 500 });
  }
}

// POST /api/products/[slug]/images
export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const body = await request.json();
    const parsed = imageSchema.parse(body);

    const product = await prisma.product.findUnique({
      where: { slug: params.slug },
    });

    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    const image = await prisma.productImage.create({
      data: {
        url: parsed.url,
        alt: parsed.alt,
        order: parsed.order ?? 0,
        productId: product.id,
      },
    });

    return NextResponse.json(image, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ errors: err.flatten() }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("POST /api/products/[slug]/images error:", err);
    return NextResponse.json({ message }, { status: 500 });
  }
}

// DELETE /api/products/[slug]/images
export async function DELETE(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get("id");

    if (!imageId) {
      return NextResponse.json({ message: "Image ID required" }, { status: 400 });
    }

    await prisma.productImage.delete({
      where: { id: imageId },
    });

    return NextResponse.json({ message: "Image deleted successfully" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("DELETE /api/products/[slug]/images error:", err);
    return NextResponse.json({ message }, { status: 500 });
  }
}

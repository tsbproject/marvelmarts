import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Define attributes as a record of string → string
const attributesSchema = z.record(z.string(), z.string());

// Variant schema
export const variantSchema = z.object({
  name: z.string().min(1, "Variant name is required"),
  price: z.number().nonnegative().optional(),
  stock: z.number().int().nonnegative().optional(),
  attributes: attributesSchema.optional(),
});

// GET /api/products/[slug]/variants
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params; // 👈 await params

    const product = await prisma.product.findUnique({
      where: { slug },
      include: { variants: true },
    });

    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    const safeVariants = product.variants.map((v) => ({
      ...v,
      price: v.price ? Number(v.price) : null,
    }));

    return NextResponse.json(safeVariants);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("GET /api/products/[slug]/variants error:", err);
    return NextResponse.json({ message }, { status: 500 });
  }
}

// POST /api/products/[slug]/variants
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params; // 👈 await params
    const body = await request.json();
    const parsed = variantSchema.parse(body);

    const product = await prisma.product.findUnique({ where: { slug } });
    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    const variant = await prisma.variant.create({
      data: {
        name: parsed.name,
        price: parsed.price ?? 0,
        stock: parsed.stock ?? 0,
        attributes: parsed.attributes ?? {},
        productId: product.id,
      },
    });

    return NextResponse.json(
      { ...variant, price: variant.price ? Number(variant.price) : null },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ errors: err.flatten() }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("POST /api/products/[slug]/variants error:", err);
    return NextResponse.json({ message }, { status: 500 });
  }
}

// DELETE /api/products/[slug]/variants?id=VARIANT_ID
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params; // 👈 await params
    const { searchParams } = new URL(request.url);
    const variantId = searchParams.get("id");

    if (!variantId) {
      return NextResponse.json({ message: "Variant ID required" }, { status: 400 });
    }

    await prisma.variant.delete({ where: { id: variantId } });

    return NextResponse.json({ message: "Variant deleted successfully" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("DELETE /api/products/[slug]/variants error:", err);
    return NextResponse.json({ message }, { status: 500 });
  }
}

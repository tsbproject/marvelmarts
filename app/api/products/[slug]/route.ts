import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { productSchema } from "@/app/lib/validations/product"; // Zod schema

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/products/[slug]
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params; // 👈 await params

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        images: true,
        category: true,
        variants: true,
        reviews: true,
      },
    });

    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    const safeProduct = {
      ...product,
      price: Number(product.price),
      discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
      variants: product.variants.map((v) => ({ ...v, price: Number(v.price) })),
    };

    return NextResponse.json(safeProduct);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("GET /api/products/[slug] error:", err);
    return NextResponse.json({ message }, { status: 500 });
  }
}

// PUT /api/products/[slug]
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params; // 👈 await params
    const body = await request.json();
    const parsed = productSchema.parse(body); // validate with Zod

    const product = await prisma.product.update({
      where: { slug },
      data: {
        title: parsed.title,
        description: parsed.description,
        brand: parsed.brand,
        price: parsed.price,
        discountPrice: parsed.discountPrice,
        categoryId: parsed.categoryId,
        status: parsed.status,
        isFeatured: parsed.isFeatured,
        isPublished: parsed.isPublished,
        metaTitle: parsed.metaTitle,
        metaDescription: parsed.metaDescription,
      },
      include: { images: true, category: true, variants: true },
    });

    const safeProduct = {
      ...product,
      price: Number(product.price),
      discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
      variants: product.variants.map((v) => ({ ...v, price: Number(v.price) })),
    };

    return NextResponse.json(safeProduct);
  } catch (err: unknown) {
    if (err instanceof Error && "errors" in err) {
      return NextResponse.json({ errors: (err as any).errors }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("PUT /api/products/[slug] error:", err);
    return NextResponse.json({ message }, { status: 500 });
  }
}

// DELETE /api/products/[slug]
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params; // 👈 await params

    await prisma.product.delete({
      where: { slug },
    });

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("DELETE /api/products/[slug] error:", err);
    return NextResponse.json({ message }, { status: 500 });
  }
}

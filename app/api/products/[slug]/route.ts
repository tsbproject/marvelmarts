// app/api/products/[slug]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/app/_lib/prisma";
import type { ProductUpdate } from "@/app/types/product";

// GET /api/products/[slug]
export async function GET(
  _: Request,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: true,
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
      variants: product.variants.map(v => ({ ...v, price: Number(v.price) })),
    };

    return NextResponse.json(safeProduct);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("GET /api/products/[slug] error:", err);
    return NextResponse.json({ message }, { status: 500 });
  }
}

// PATCH /api/products/[slug]
export async function PATCH(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  try {
    const data: ProductUpdate = await request.json();

    const product = await prisma.product.update({
      where: { slug },
      data: {
        title: data.title ?? undefined,
        description: data.description ?? undefined,
        price: data.price ?? undefined,
        discountPrice: data.discountPrice ?? undefined,
        categoryId: data.categoryId ?? undefined,
        images: data.images ? { deleteMany: {}, create: data.images } : undefined,
        variants: data.variants ? { deleteMany: {}, create: data.variants } : undefined,
      },
      include: { images: true, variants: true, category: true },
    });

    const safeProduct = {
      ...product,
      price: Number(product.price),
      discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
      variants: product.variants.map(v => ({ ...v, price: Number(v.price) })),
    };

    return NextResponse.json(safeProduct);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("PATCH /api/products/[slug] error:", err);
    return NextResponse.json({ message }, { status: 500 });
  }
}

// DELETE /api/products/[slug]
export async function DELETE(
  _: Request,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  try {
    const product = await prisma.product.delete({
      where: { slug },
    });

    return NextResponse.json({ message: "Product deleted successfully", product });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("DELETE /api/products/[slug] error:", err);
    return NextResponse.json({ message }, { status: 500 });
  }
}

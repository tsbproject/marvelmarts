// app/api/products/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/app/_lib/prisma";
import type { ProductUpdate } from "@/app/types/product";

// GET /api/products
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        images: true,
        category: true,
        variants: true,
        reviews: true,
      },
    });

    // Convert decimals for frontend
    const safeProducts = products.map(p => ({
      ...p,
      price: Number(p.price),
      discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
      variants: p.variants.map(v => ({ ...v, price: Number(v.price) })),
    }));

    return NextResponse.json(safeProducts);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("GET /api/products error:", err);
    return NextResponse.json({ message }, { status: 500 });
  }
}

// POST /api/products
export async function POST(request: Request) {
  try {
    const data: ProductUpdate = await request.json();

    const product = await prisma.product.create({
      data: {
        title: data.title!,
        description: data.description || "",
        price: data.price!,
        discountPrice: data.discountPrice ?? null,
        categoryId: data.categoryId!,
        images: data.images ? { create: data.images } : undefined,
        variants: data.variants ? { create: data.variants } : undefined,
      },
      include: { images: true, category: true, variants: true },
    });

    // Convert decimals for frontend
    const safeProduct = {
      ...product,
      price: Number(product.price),
      discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
      variants: product.variants.map(v => ({ ...v, price: Number(v.price) })),
    };

    return NextResponse.json(safeProduct, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("POST /api/products error:", err);
    return NextResponse.json({ message }, { status: 500 });
  }
}

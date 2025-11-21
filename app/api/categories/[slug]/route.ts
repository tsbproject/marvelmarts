// app/api/categories/[slug]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/app/_lib/prisma";

export async function GET(
  _: Request,
  context: { params: { slug: string } }
) {
  const { slug } = context.params;

  try {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        products: {
          include: {
            images: true,
            variants: true,
          },
        },
        children: true,
      },
    });

    if (!category) {
      return NextResponse.json({ message: "Category not found" }, { status: 404 });
    }

    // Convert decimals in products
    const safeCategory = {
      ...category,
      products: category.products.map(product => ({
        ...product,
        price: Number(product.price),
        discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
        variants: product.variants.map(v => ({ ...v, price: Number(v.price) })),
      })),
    };

    return NextResponse.json(safeCategory);
  } catch (err: unknown) {
    let message = "Unknown error";
    if (err instanceof Error) message = err.message;
    console.error("GET /api/categories/[slug] error:", err);
    return NextResponse.json({ message }, { status: 500 });
  }
}

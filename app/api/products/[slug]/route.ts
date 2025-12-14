import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> } // ✅ Promise type
) {
  const { slug } = await params; // ✅ await the promise

  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        images: true,
        variants: true,
      },
    });

    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    const safeProduct = {
      ...product,
      price: Number(product.price),
      discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
      variants: product.variants.map((v) => ({
        ...v,
        price: Number(v.price),
      })),
    };

    return NextResponse.json(safeProduct);
  } catch (err: unknown) {
    let message = "Unknown error";
    if (err instanceof Error) message = err.message;
    console.error("GET /api/products/[slug] error:", err);
    return NextResponse.json({ message }, { status: 500 });
  }
}
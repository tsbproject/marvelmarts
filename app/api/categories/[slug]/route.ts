import { NextRequest, NextResponse } from "next/server";
import  prisma  from "@/app/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params; // await the promise

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
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    const safeCategory = {
      ...category,
      products: category.products.map((product) => ({
        ...product,
        price: Number(product.price),
        discountPrice: product.discountPrice
          ? Number(product.discountPrice)
          : null,
        variants: product.variants.map((v) => ({
          ...v,
          price: Number(v.price),
        })),
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
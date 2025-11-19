import { NextResponse } from "next/server";
import { getPrisma } from "@/app/_lib/prisma";

export async function GET(
  req: Request,
  context: { params: { slug: string } }
) {
  const { slug } = context.params; // ✅ synchronous, not a Promise

  try {
    const prisma = await getPrisma();

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

    return NextResponse.json(category);
  } catch (err) {
    console.error("GET /api/categories/[slug] error", err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
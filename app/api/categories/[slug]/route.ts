import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/app/_lib/prisma";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params; // 👈 REQUIRED in Next.js 15+

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

    return NextResponse.json(category);
  } catch (err) {
    console.error("GET /api/categories/[slug] error", err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

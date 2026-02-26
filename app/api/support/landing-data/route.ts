import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect();

    // 1. Get Categories and counts using your 'category' field
    const categoryData = await prisma.helpArticle.groupBy({
      by: ['category'],
      _count: { _all: true }
    });

    // 2. Get Top 4 Featured Articles based on your model fields
    const featuredArticles = await prisma.helpArticle.findMany({
      take: 4,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        category: true,
      },
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json({
      categoryData,
      featuredArticles
    }, { status: 200 });

  } catch (error: any) {
    console.error("CRITICAL DATABASE ERROR:", error.message);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
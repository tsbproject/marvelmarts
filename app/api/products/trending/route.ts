// app/api/products/trending/route.ts
import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET() {
  try {
    const trendingProducts = await prisma.product.findMany({
      where: { isTrending: true },
      take: 10, // Tactical limit for homepage performance
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        imageUrl: true,
      }
    });
    return NextResponse.json(trendingProducts);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch trending" }, { status: 500 });
  }
}
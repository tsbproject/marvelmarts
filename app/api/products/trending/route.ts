import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const trendingProducts = await prisma.product.findMany({
      where: {
        isTrending: true,
      },
      select: {
        id: true,
        title: true, 
        slug: true,
        price: true,
        images: true, // Use the correct field name 'images'
        category: {
          select: {
            name: true 
          }
        }
      },
      take: 10,
    });

    // Map the array of images to a single imageUrl for the frontend
    const serializedProducts = trendingProducts.map(product => ({
      ...product,
      // Pick the first image in the array, or null if empty
      imageUrl: Array.isArray(product.images) && product.images.length > 0 
        ? product.images[0] 
        : null
    }));

    return NextResponse.json(serializedProducts);
  } catch (error) {
    console.error("Trending API Error:", error);
    return NextResponse.json({ error: "Tactical Data Retrieval Failed" }, { status: 500 });
  }
}
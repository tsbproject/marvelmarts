// // app/api/products/trending/route.ts
// import { NextResponse } from "next/server";
// import prisma from "@/app/lib/prisma";

// export async function GET() {
//   try {
//     const trendingProducts = await prisma.product.findMany({
//       where: { isTrending: true },
//       take: 10, // Tactical limit for homepage performance
//       select: {
//         id: true,
//         name: true,
//         slug: true,
//         price: true,
//         imageUrl: true,
//       }
//     });
//     return NextResponse.json(trendingProducts);
//   } catch (error) {
//     return NextResponse.json({ error: "Failed to fetch trending" }, { status: 500 });
//   }
// }




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
        // TACTICAL ADJUSTMENT: 
        // Check your schema.prisma. if it's 'image', use 'image: true'. 
        // If it's 'images', use 'images: true'.
        image: true, 
        category: {
          select: {
            name: true 
          }
        }
      },
      take: 10,
    });

    // If your frontend specifically expects 'imageUrl', we map it here:
    const serializedProducts = trendingProducts.map(product => ({
      ...product,
      imageUrl: (product as any).image || (product as any).images?.[0] || null
    }));

    return NextResponse.json(serializedProducts);
  } catch (error) {
    console.error("Trending API Error:", error);
    return NextResponse.json({ error: "Failed to fetch tactical gear" }, { status: 500 });
  }
}
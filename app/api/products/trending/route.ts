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
        title: true,  // Use 'title' instead of 'name'
        slug: true,
        price: true,
        imageUrl: true,
        category: {
          select: {
            name: true // Categories usually have 'name', Products usually have 'title'
          }
        }
      },
      take: 10, // Keep the homepage lean
    });

    return NextResponse.json(trendingProducts);
  } catch (error) {
    console.error("Trending API Error:", error);
    return NextResponse.json({ error: "Failed to fetch tactical gear" }, { status: 500 });
  }
}
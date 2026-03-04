// import prisma from "@/app/lib/prisma";
// import { NextResponse } from "next/server";

// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const query = searchParams.get("q");

//   if (!query || query.length < 2) {
//     return NextResponse.json({ products: [], categories: [] });
//   }

//   const [products, categories] = await Promise.all([
//     // 1. Search Products (by Title or ID)
//     prisma.product.findMany({
//       where: {
//         status: "ACTIVE",
//         OR: [
//           { title: { contains: query, mode: "insensitive" } },
//           { id: { contains: query, mode: "insensitive" } },
//         ],
//       },
//       select: {
//         id: true,
//         title: true,
//         slug: true,
//         price: true,
//         images: { take: 1, select: { url: true } },
//       },
//       take: 5,
//     }),
//     // 2. Search Categories
//     prisma.category.findMany({
//       where: {
//         name: { contains: query, mode: "insensitive" },
//       },
//       select: { id: true, name: true, slug: true },
//       take: 4,
//     }),
//   ]);

//   return NextResponse.json({ products, categories });
// }






import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";

  if (query.length < 2) return NextResponse.json({ products: [], categories: [], vendors: [] });

  try {
    const [products, categories, vendors] = await Promise.all([
      // 1. SEARCH PRODUCTS (with Boost Priority)
      prisma.product.findMany({
        where: {
          isPublished: true,
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { sku: { contains: query, mode: "insensitive" } },
          ],
        },
        include: { images: { take: 1 }, vendorProfile: true },
        orderBy: [
          { boostUntil: { sort: "desc", nulls: "last" } }, // Boosted first
          { createdAt: "desc" },
        ],
        take: 10,
      }),

      // 2. SEARCH CATEGORIES
      prisma.category.findMany({
        where: { name: { contains: query, mode: "insensitive" } },
        take: 4,
      }),

      // 3. SEARCH VENDORS (by Name or Profile ID)
      prisma.vendorProfile.findMany({
        where: {
          OR: [
            { storeName: { contains: query, mode: "insensitive" } },
            { id: { equals: query } }, // Direct ID match
          ],
        },
        take: 3,
      }),
    ]);

    return NextResponse.json({ products, categories, vendors });
  } catch (error) {
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
// app/services/categoryService.ts
import prisma from "@/app/lib/prisma";

export async function getFeaturedCategories() {
  try {
    return await prisma.category.findMany({
      where: {
        isFeatured: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        imageUrl: true,
        _count: {
          select: { products: true }
        }
      },
      orderBy: {
        position: 'asc'
      },
      take: 6 // Optimize for a grid of 3 or 6
    });
  } catch (error) {
    console.error("Tactical Fetch Error:", error);
    return [];
  }
}
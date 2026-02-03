import { prisma } from "@/app/lib/prisma";

export async function updateProductRating(productId: string) {
  // 1. Fetch all approved reviews for this product
  const reviews = await prisma.review.findMany({
    where: {
      productId: productId,
    },
    select: {
      rating: true,
    },
  });

  const ratingCount = reviews.length;
  
  // 2. Calculate average (Default to 5.0 if no reviews exist)
  const averageRating = ratingCount > 0 
    ? reviews.reduce((acc, curr) => acc + curr.rating, 0) / ratingCount 
    : 5.0;

  // 3. Update the Product model with the fresh intel
  await prisma.product.update({
    where: { id: productId },
    data: {
      rating: parseFloat(averageRating.toFixed(1)), // e.g., 4.7
      ratingCount: ratingCount,
    },
  });

  return { averageRating, ratingCount };
}
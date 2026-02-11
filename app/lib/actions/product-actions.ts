// import { prisma } from "@/app/lib/prisma";

// export async function updateProductRating(productId: string) {
//   // 1. Fetch all approved reviews for this product
//   const reviews = await prisma.review.findMany({
//     where: {
//       productId: productId,
//     },
//     select: {
//       rating: true,
//     },
//   });

//   const ratingCount = reviews.length;
  
//   // 2. Calculate average (Default to 5.0 if no reviews exist)
//   const averageRating = ratingCount > 0 
//     ? reviews.reduce((acc, curr) => acc + curr.rating, 0) / ratingCount 
//     : 5.0;

//   // 3. Update the Product model with the fresh intel
//   await prisma.product.update({
//     where: { id: productId },
//     data: {
//       rating: parseFloat(averageRating.toFixed(1)), // e.g., 4.7
//       ratingCount: ratingCount,
//     },
//   });

//   return { averageRating, ratingCount };
// }





"use server"

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * PHASE 6 & 11: Create Product & Graduation Logic
 * This handles the first product upload, finishes onboarding, 
 * and grants the initial Phase 8 Boost Credits.
 */
export async function createProduct(vendorProfileId: string, data: any) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the new product
      const newProduct = await tx.product.create({
        data: {
          ...data,
          vendorProfileId: vendorProfileId,
        },
      });

      // 2. Check Onboarding Status (Phase 4 Logic)
      const onboarding = await tx.vendorOnboarding.findUnique({
        where: { vendorProfileId }
      });

      // If this is their first product, graduate them
      if (onboarding && !onboarding.productDone) {
        await tx.vendorOnboarding.update({
          where: { vendorProfileId },
          data: { 
            productDone: true,
            completed: true // Graduation: This hides the checklist on the dashboard
          }
        });

        // 3. Grant Phase 8 Welcome Bonus (100 Credits)
        // Upsert ensures the record exists before we try to increment
        await tx.vendorBoost.upsert({
          where: { vendorProfileId },
          update: { credits: { increment: 100 } },
          create: { vendorProfileId, credits: 100 }
        });
      }

      return newProduct;
    });

    revalidatePath("/account/vendor");
    return { success: true, product: result };
  } catch (error: any) {
    console.error("Product Creation Error:", error);
    return { success: false, error: error.message || "Failed to list product" };
  }
}

/**
 * PHASE 11: Reputation Sync Logic
 * Recalculates product ratings based on reviews.
 */
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
  const updatedProduct = await prisma.product.update({
    where: { id: productId },
    data: {
      rating: parseFloat(averageRating.toFixed(1)), // e.g., 4.7
      ratingCount: ratingCount,
    },
  });

  revalidatePath(`/product/${productId}`);
  return { averageRating, ratingCount, updatedProduct };
}



export async function toggleProductStatus(productId: string, currentStatus: boolean) {
  try {
    const updated = await prisma.product.update({
      where: { id: productId },
      data: { isPublished: !currentStatus }
    });

    revalidatePath("/account/vendor");
    revalidatePath(`/product/${updated.id}`);
    
    return { success: true, newState: updated.isPublished };
  } catch (error) {
    return { success: false, error: "Failed to update product status" };
  }
}
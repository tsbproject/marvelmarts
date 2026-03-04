"use server";

import prisma from "@/app/lib/prisma";

export async function cleanupExpiredBoosts() {
  const now = new Date();

  try {
    const result = await prisma.product.updateMany({
      where: {
        boostUntil: {
          lt: now, // "Less Than" now means it has expired
        },
        isTrending: true, // Only update if it's currently trending
      },
      data: {
        isTrending: false,
      },
    });

    return { 
      success: true, 
      count: result.count, 
      message: `Cleaned up ${result.count} expired boosts.` 
    };
  } catch (error) {
    console.error("Cleanup Error:", error);
    return { success: false, error: "Failed to cleanup boosts" };
  }
}
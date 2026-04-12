// lib/vendor-logic.ts

  import  prisma  from "@/app/lib/prisma";

const TIER_CONFIG = {
  BRONZE: { minSales: 0, minRating: 0, rate: 0.05 },
  SILVER: { minSales: 100, minRating: 4.0, rate: 0.1 },
  GOLD: { minSales: 500, minRating: 4.5, rate: 0.15 }
};

export async function updateVendorStanding(vendorId: string) {
  const stats = await prisma.vendorProfile.findUnique({
    where: { id: vendorId },
    include: { products: true, score: true }
  });

  // 1. ADD THIS CHECK: Exit if no vendor is found
  if (!stats) {
    console.error(`Vendor with ID ${vendorId} not found.`);
    return;
  }

  // Now TypeScript knows 'stats' is NOT null
  const totalSales = stats.products.reduce((acc, p) => acc + (p.salesCount || 0), 0);
  const rating = stats.score?.rating || 0;

  let newTier: 'BRONZE' | 'SILVER' | 'GOLD' = 'BRONZE';
  
  if (totalSales >= TIER_CONFIG.GOLD.minSales && rating >= TIER_CONFIG.GOLD.minRating) {
    newTier = 'GOLD';
  } else if (totalSales >= TIER_CONFIG.SILVER.minSales && rating >= TIER_CONFIG.SILVER.minRating) {
    newTier = 'SILVER';
  }

  await prisma.vendorScore.update({
    where: { vendorProfileId: vendorId },
    data: { 
      tier: newTier,
      commissionRate: TIER_CONFIG[newTier].rate 
    }
  });
}
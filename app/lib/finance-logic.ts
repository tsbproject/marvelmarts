import { prisma } from "@/app/lib/prisma";

export async function finalizeOrderPayout(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { 
      vendorProfile: { 
        include: { 
          score: true 
        } 
      } 
    }
  });

  // Guard clause: Ensure we have the vendor and their commission data
  if (!order?.vendorProfile?.score) {
    throw new Error("Financial profile or score configuration missing for vendor");
  }

  const gross = Number(order.total);
  const rate = order.vendorProfile.score.commissionRate;
  
  // THE SUBTRACTION LOGIC
  const platformFee = gross * rate;
  const netAmount = gross - platformFee;

  return await prisma.$transaction([
    // 1. Log the marketplace transaction (your platform's ledger)
    prisma.marketplaceTransaction.create({
      data: {
        orderId: order.id,
        vendorProfileId: order.vendorProfileId,
        grossAmount: gross,
        platformFee: platformFee,
        netAmount: netAmount,
        commissionRate: rate,
        vendorTier: order.vendorProfile.score.tier,
        status: "SUCCESS", // Matches your existing TransactionStatus enum
        reference: `TRX-${order.id}-${Date.now()}`
      }
    }),

    // 2. Update the Vendor's internal balance directly on their profile
    prisma.vendorProfile.update({
      where: { id: order.vendorProfileId },
      data: { 
        balance: { 
          increment: netAmount 
        } 
      }
    })
  ]);
}
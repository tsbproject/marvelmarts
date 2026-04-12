import { prisma } from "@/app/lib/prisma";

/**
 * THE BRAIN: Purely calculates the numbers. 
 * Use this for UI previews (Order Details, Invoices).
 */
export async function calculateOrderPayout(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { 
      vendorProfile: { 
        include: { score: true } 
      } 
    }
  });

  if (!order || !order.vendorProfile?.score) {
    throw new Error("Order or Vendor Score configuration not found");
  }

  const totalAmount = Number(order.total);
  const commissionRate = order.vendorProfile.score.commissionRate; 
  
  const platformFee = totalAmount * commissionRate;
  const vendorNetPayout = totalAmount - platformFee;

  return {
    order,
    totalAmount,
    platformFee,
    vendorNetPayout,
    commissionRate,
    tier: order.vendorProfile.score.tier,
    vendorProfileId: order.vendorProfileId
  };
}

/**
 * THE MUSCLE: Executes the database transaction.
 * Use this ONLY when status changes to "DELIVERED".
 */
export async function finalizeOrderPayout(orderId: string) {
  // 1. Get the math from the "Brain"
  const { 
    totalAmount, 
    platformFee, 
    vendorNetPayout, 
    commissionRate, 
    tier, 
    vendorProfileId 
  } = await calculateOrderPayout(orderId);

  // 2. Execute the atomic transaction
  return await prisma.$transaction([
    // Log for Admin/Platform records
    prisma.marketplaceTransaction.create({
      data: {
        orderId,
        vendorProfileId,
        grossAmount: totalAmount,
        platformFee: platformFee,
        netAmount: vendorNetPayout,
        commissionRate: commissionRate,
        vendorTier: tier,
        status: "SUCCESS",
        reference: `TRX-${orderId}-${Date.now()}`
      }
    }),

    // Update Vendor's withdrawable balance
    prisma.vendorProfile.update({
      where: { id: vendorProfileId },
      data: { 
        balance: { increment: vendorNetPayout } 
      }
    })
  ]);
}
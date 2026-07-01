// app/actions/admin-orders.ts
"use server";

import { prisma } from "@/app/lib/prisma";
import { finalizeVendorPayout } from "@/app/lib/payouts-calculation";

export async function updateOrderStatus(orderId: string, status: string) {
  // 1. Update the order status first
  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: { status }
  });

  // 2. If it is DELIVERED, trigger the payout logic
  if (status === "DELIVERED") {
    try {
      await finalizeVendorPayout(orderId);
    } catch (error) {
      console.error("Critical: Order delivered but payout failed", error);
      // In production, you might want to log this to an error tracking service
    }
  }

  return updatedOrder;
}
// app/actions/orders.ts
"use server";

import { calculateVendorPayout } from "@/app/lib/payouts-calculation";

export async function getOrderFinancialBreakdown(orderId: string) {
  try {
    const breakdown = await calculateVendorPayout(orderId);
    return { success: true, data: breakdown };
  } catch (error) {
    return { success: false, error: "Could not calculate breakdown" };
  }
}
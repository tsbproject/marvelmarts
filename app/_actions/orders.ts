// app/actions/orders.ts
// "use server";

// import { PayoutService } from "@/app/lib/services/payout.service";


// export async function getOrderFinancialBreakdown(orderId: string) {
//   try {
//     const breakdown = await PayoutService.calculateVendorPayout(orderId);
//     return { success: true, data: breakdown };
//   } catch (error) {
//     return { success: false, error: "Could not calculate breakdown" };
//   }
// }



"use server";

import { requireOrderAccess } from "@/app/lib/auth/order";
import { PayoutService } from "@/app/lib/services/payout.service";

export async function getOrderFinancialBreakdown(
  orderId: string
) {
  try {
    await requireOrderAccess(orderId);

    const breakdown =
      await PayoutService.calculateVendorPayout(orderId);

    return {
      success: true,
      data: breakdown,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Could not calculate breakdown.",
    };
  }
}
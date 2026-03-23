// // app/services/adminOrderActions.ts
// "use server";

// import { prisma } from "@/app/lib/prisma";
// import { revalidatePath } from "next/cache";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/lib/auth";
// import { sendRefundStatusEmail } from "@/app/lib/mailer";

// export async function processRefundDecision(
//   orderId: string, 
//   action: "approved" | "rejected", 
//   reason: string
// ) {
//   const session = await getServerSession(authOptions);
  
//   // Security Check: Allowing both ADMIN and SUPER_ADMIN for flexibility 
//   // (unless you strictly want only SUPER_ADMIN to handle money)
//   const role = (session?.user as any)?.role;
//   if (role !== "SUPER_ADMIN" && role !== "ADMIN") {
//     return { success: false, message: "ERROR: Level 2 clearance required for financial protocols." };
//   }

//   console.log(`REFUND PROTOCOL INITIATED - [${action.toUpperCase()}] ID:`, orderId);

//   try {
//     // 1. Update Database based on Decision
//     const updated = await prisma.order.update({
//       where: { id: orderId },
//       data: {
//         // Only set status to 'refunded' if approved; otherwise keep original order status
//         status: action === "approved" ? "refunded" : undefined,
//         refundStatus: action, 
//         // Syncing both fields to ensure the reason is visible everywhere
//         refundReason: reason || "Administrative decision",
//         cancelReason: reason || "Administrative decision", 
//       },
//       include: { items: true }
//     });

//     // 2. Dispatch Email Notification
//     try {
//       await sendRefundStatusEmail(updated, action, reason);
//     } catch (mailError) {
//       console.error("SERVICE_MAIL_ERROR:", mailError);
//       // We don't return error here because the DB update was successful
//     }

//     revalidatePath(`/dashboard/admins/orders/${orderId}`);
//     revalidatePath(`/account/customer/orders`);

//     return { 
//       success: true, 
//       message: action === "approved" 
//         ? "Marvel Success: Funds Reversal Logged & Asset Deauthorized." 
//         : "Protocol Updated: Refund Request Declined." 
//     };

//   } catch (error: any) {
//     console.error("PRISMA EXECUTION ERROR:", error);
//     return { success: false, message: `System Failure: ${error.message}` };
//   }
// }




"use server";

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { sendRefundStatusEmail } from "@/app/lib/mailer";

/**
 * CORE LOGIC: Unified Refund Decision Handler
 * Handles database updates, security checks, and email dispatch.
 */
export async function processRefundDecision(
  orderId: string, 
  action: "approved" | "rejected", 
  reason: string
) {
  const session = await getServerSession(authOptions);
  
  // 1. Security Check
  const role = (session?.user as any)?.role?.toUpperCase();
  if (role !== "SUPER_ADMIN" && role !== "ADMIN") {
    return { 
      success: false, 
      message: "ERROR: Level 2 clearance required for financial protocols." 
    };
  }

  try {
    // 2. Fetch current order to preserve status on rejection
    const currentOrder = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!currentOrder) {
      return { success: false, message: "Order not found in MarvelMarts Vault." };
    }

    // 3. Database Update
    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        // If approved, set status to 'refunded'. If rejected, keep existing status.
        status: action === "approved" ? "refunded" : currentOrder.status,
        refundStatus: action, 
        refundReason: reason || "Administrative decision",
        cancelReason: reason || "Administrative decision", 
      },
      include: { items: true }
    });

    // 4. Dispatch Email Notification
    try {
      await sendRefundStatusEmail(updated, action, reason);
    } catch (mailError) {
      console.error("SERVICE_MAIL_ERROR:", mailError);
    }

    // 5. Cache Busting
    revalidatePath(`/dashboard/admins/orders/${orderId}`);
    revalidatePath(`/dashboard/admins/support/refunds`); // Revalidate the queue page
    revalidatePath(`/account/customer/orders`);

    return { 
      success: true, 
      message: action === "approved" 
        ? "Marvel Success: Funds Reversal Logged & Asset Deauthorized." 
        : "Protocol Updated: Refund Request Declined." 
    };

  } catch (error: any) {
    console.error("PRISMA EXECUTION ERROR:", error);
    return { success: false, message: `System Failure: ${error.message}` };
  }
}

/**
 * EXPORT: processRefund
 * Specifically for the Initiate Refund button
 */
export async function processRefund(orderId: string, reason: string) {
  return await processRefundDecision(orderId, "approved", reason);
}

/**
 * EXPORT: rejectRefund
 * Specifically for the Reject Request button
 */
export async function rejectRefund(orderId: string, reason: string) {
  return await processRefundDecision(orderId, "rejected", reason);
}
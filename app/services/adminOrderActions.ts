"use server";

import { revalidatePath } from "next/cache";
import { UserRole } from "@prisma/client";

import { requireAdmin } from "@/app/lib/auth/api";
import { sendRefundStatusEmail } from "@/app/lib/mailer";
import { OrderService } from "@/app/lib/services/order.service";

/**
 * CORE LOGIC: Unified Refund Decision Handler
 *
 * Handles:
 * - centralized administrator authorization
 * - order refund decision
 * - refund status email
 * - cache invalidation
 */
export async function processRefundDecision(
  orderId: string,
  action: "approved" | "rejected",
  reason: string
) {
  try {
    const session = await requireAdmin();

    const adminRole =
      session.user.roles?.includes(UserRole.SUPER_ADMIN)
        ? UserRole.SUPER_ADMIN
        : UserRole.ADMIN;

    const updated =
      await OrderService.processRefundDecision(
        orderId,
        action,
        reason,
        session.user.id,
        adminRole
      );

    try {
      await sendRefundStatusEmail(
        updated,
        action,
        reason
      );
    } catch (mailError) {
      console.error(
        "SERVICE_MAIL_ERROR:",
        mailError
      );
    }

    revalidatePath(
      `/dashboard/admins/orders/${orderId}`
    );

    revalidatePath(
      `/dashboard/admins/support/refunds`
    );

    revalidatePath(
      `/account/customer/orders`
    );

    return {
      success: true,
      message:
        action === "approved"
          ? "Marvel Success: Funds Reversal Logged & Asset Deauthorized."
          : "Protocol Updated: Refund Request Declined.",
    };
  } catch (error: any) {
    console.error(
      "PRISMA EXECUTION ERROR:",
      error
    );

    return {
      success: false,
      message:
        error.message ??
        "System Failure: Unable to process refund decision.",
    };
  }
}

/**
 * EXPORT: processRefund
 *
 * Specifically for the Initiate Refund button.
 */
export async function processRefund(
  orderId: string,
  reason: string
) {
  return await processRefundDecision(
    orderId,
    "approved",
    reason
  );
}

/**
 * EXPORT: rejectRefund
 *
 * Specifically for the Reject Request button.
 */
export async function rejectRefund(
  orderId: string,
  reason: string
) {
  return await processRefundDecision(
    orderId,
    "rejected",
    reason
  );
}
"use server";

import { revalidatePath } from "next/cache";

import { requireAuth } from "@/app/lib/auth/api";
import { PaymentService } from "@/app/lib/services/payment.service";
import { WalletService } from "@/app/lib/services/wallet.service";
import { OrderService } from "@/app/lib/services/order.service";

export async function topUpWallet(reference: string) {
  try {
    const session = await requireAuth();

    const transaction =
      await PaymentService.verifyTransaction(reference);

    const metadata = transaction.metadata ?? {};

    if (metadata.type !== "wallet") {
      throw new Error("Invalid payment type.");
    }

    if (metadata.userId !== session.user.id) {
      throw new Error(
        "Payment does not belong to this user."
      );
    }

    const result =
      await WalletService.completeWalletFunding(
        transaction
      );

    revalidatePath("/checkout");
    revalidatePath(
      "/account/customer/payment-methods"
    );

    return result;
  } catch (error) {
    console.error(
      "WALLET_TOPUP_ERROR:",
      error
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Wallet funding failed.",
    };
  }
}

export type PurchaseResponse =
  | {
      success: true;
      newBalance: number;
    }
  | {
      success: false;
      error: string;
    };

export async function processWalletPurchase(
  orderId: string
): Promise<PurchaseResponse> {
  try {
    const session = await requireAuth();

    const result =
      await WalletService.debitForOrder(
        session.user.id,
        orderId
      );

    if (!result.success) {
      return result;
    }

    await OrderService.completePaidOrder(
      orderId
    );

    revalidatePath("/checkout");
    revalidatePath("/account/customer/orders");
    revalidatePath("/account/vendor/orders");
    revalidatePath("/account/vendor");

    return result;
  } catch (error) {
    console.error(
      "PURCHASE_ERROR:",
      error
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to process wallet payment.",
    };
  }
}
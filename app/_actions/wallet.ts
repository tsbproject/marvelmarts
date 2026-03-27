"use server";

import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { revalidatePath } from "next/cache";



export async function topUpWallet(reference: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  if (!reference) {
    return { success: false, error: "Missing transaction reference" };
  }

  try {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      console.error("PAYSTACK_SECRET_KEY is missing");
      return { success: false, error: "Server payment configuration error" };
    }

    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("PAYSTACK_VERIFY_HTTP_ERROR:", errorText);
      return { success: false, error: "Failed to verify transaction" };
    }

    const resData = await response.json();

    if (!resData?.status || resData?.data?.status !== "success") {
      return { success: false, error: "Transaction verification failed" };
    }

    const amountInNaira = Number(resData?.data?.amount || 0) / 100;

    if (!amountInNaira || amountInNaira <= 0) {
      return { success: false, error: "Invalid transaction amount" };
    }

    const updatedWallet = await prisma.$transaction(async (tx) => {
      const existingTx = await tx.walletTransaction.findUnique({
        where: { reference },
      });

      if (existingTx) {
        const existingWallet = await tx.wallet.findUnique({
          where: { userId: session.user.id },
        });

        return existingWallet;
      }

      const wallet = await tx.wallet.upsert({
        where: { userId: session.user.id },
        update: {
          balance: {
            increment: amountInNaira,
          },
        },
        create: {
          userId: session.user.id,
          balance: amountInNaira,
        },
      });

      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          amount: amountInNaira,
          type: "TOPUP",
          status: "SUCCESS",
          reference,
          description: "Wallet Top-up via Paystack",
        },
      });

      return wallet;
    });

    revalidatePath("/checkout");
    revalidatePath("/account/customer/payment-methods");

    return {
      success: true,
      balance: updatedWallet?.balance?.toString() || "0",
    };
  } catch (error) {
    console.error("WALLET_TOPUP_ERROR:", error);
    return { success: false, error: "Failed to update wallet balance" };
  }
}


export type PurchaseResponse =
  | { success: true; newBalance: string }
  | { success: false; error: string };

export async function processWalletPurchase(
  orderId: string,
  totalAmount: number
): Promise<PurchaseResponse> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    return await prisma.$transaction<PurchaseResponse>(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { userId: session.user.id },
      });

      if (!wallet || Number(wallet.balance) < totalAmount) {
        throw new Error("Insufficient wallet balance.");
      }

      const updatedWallet = await tx.wallet.update({
        where: { userId: session.user.id },
        data: { balance: { decrement: totalAmount } },
      });

      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          amount: totalAmount,
          type: "PURCHASE",
          status: "SUCCESS",
          reference: `ORD-${orderId}-${Date.now()}`,
          description: `Payment for Order #${orderId}`,
        },
      });

      await tx.order.update({
        where: { id: orderId },
        data: { status: "PAID", paymentTypes: "WALLET" },
      });

      return {
        success: true,
        newBalance: updatedWallet.balance.toString(),
      };
    });
  } catch (error: any) {
    console.error("PURCHASE_ERROR:", error);

    return {
      success: false,
      error: error.message || "Failed to process payment",
    };
  }
}
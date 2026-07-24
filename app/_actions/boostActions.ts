"use server";

import prisma from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";


const getBoostPlanDetails = (days: number) => {
  switch (days) {
    case 3:
      return { cost: 15, duration: 3 };
    case 7:
      return { cost: 30, duration: 7 };
    case 30:
      return { cost: 100, duration: 30 };
    default:
      return { cost: days * 5, duration: days };
  }
};

type BoostProductResult =
  | { error: string }
  | { success: true; newBalance: number; expiry: Date };



export async function boostProduct(
  productId: string,
  requestedDays: number
): Promise<BoostProductResult> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { error: "Unauthorized. Please log in." };
  }

  const { cost, duration } = getBoostPlanDetails(requestedDays);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const vendorProfile = await tx.vendorProfile.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      });

      if (!vendorProfile) {
        throw new Error("Vendor profile not found.");
      }

      const vendorBoost = await tx.vendorBoost.findUnique({
        where: { vendorProfileId: vendorProfile.id },
        select: {
          id: true,
          credits: true,
          lowCreditAlertSent: true,
          exhaustedAlertSent: true,
        },
      });

      if (!vendorBoost || vendorBoost.credits < cost) {
        throw new Error(`Insufficient credits. You need ${cost} credits for this plan.`);
      }

      const product = await tx.product.findUnique({
        where: { id: productId },
        select: { boostUntil: true, vendorProfileId: true, title: true },
      });

      if (!product) {
        throw new Error("Product not found.");
      }

      if (product.vendorProfileId !== vendorProfile.id) {
        throw new Error("Unauthorized: Ownership mismatch.");
      }

      const now = new Date();
      const baseDate =
        product.boostUntil && new Date(product.boostUntil) > now
          ? new Date(product.boostUntil)
          : now;

      const newBoostUntil = new Date(baseDate);
      newBoostUntil.setDate(newBoostUntil.getDate() + duration);

      const previousBalance = vendorBoost.credits;

      const updatedBoost = await tx.vendorBoost.update({
        where: { id: vendorBoost.id },
        data: { credits: { decrement: cost } },
        select: {
          id: true,
          credits: true,
          lowCreditAlertSent: true,
          exhaustedAlertSent: true,
        },
      });

      await tx.product.update({
        where: { id: productId },
        data: {
          boostUntil: newBoostUntil,
          isTrending: true,
        },
      });

      await tx.creditTransaction.create({
        data: {
          reference: `USE_${productId}_${Date.now()}`,
          amount: -cost,
          vendorProfileId: vendorProfile.id,
          status: "SUCCESS",
          platform: "INTERNAL_BOOST",
        },
      });

      const vendor = await tx.vendorProfile.findUnique({
        where: { id: vendorProfile.id },
        select: {
          id: true,
          storeName: true,
          user: {
            select: {
              email: true,
              name: true,
            },
          },
        },
      });

      return {
        success: true as const,
        newBalance: updatedBoost.credits,
        expiry: newBoostUntil,
        previousBalance,
        vendorProfileId: vendorProfile.id,
        lowCreditAlertSent: updatedBoost.lowCreditAlertSent,
        exhaustedAlertSent: updatedBoost.exhaustedAlertSent,
        vendor,
      };
    });

    revalidatePath("/account/vendor/products");
    revalidatePath("/");
    revalidatePath("/account/vendor");
    revalidatePath("/account/vendor/credit-boost");

    if (result.vendor?.user?.email) {
      const crossedLowThreshold =
        result.previousBalance > 10 &&
        result.newBalance <= 10 &&
        result.newBalance > 0;

      const becameExhausted =
        result.previousBalance > 0 &&
        result.newBalance === 0;

      if (becameExhausted && !result.exhaustedAlertSent) {
        const { sendVendorExhaustedCreditsEmail } = await import(
          "@/app/lib/mailer"
        );

        await sendVendorExhaustedCreditsEmail({
          email: result.vendor.user.email,
          firstName: result.vendor.user.name || "Vendor",
          storeName:
            result.vendor.storeName ||
            result.vendor.user.name ||
            "Your Store",
        });

        await prisma.vendorBoost.update({
          where: { vendorProfileId: result.vendorProfileId },
          data: {
            exhaustedAlertSent: true,
            lowCreditAlertSent: true,
          },
        });
      } else if (crossedLowThreshold && !result.lowCreditAlertSent) {
        const { sendVendorLowCreditsEmail } = await import(
          "@/app/lib/mailer"
        );

        await sendVendorLowCreditsEmail({
          email: result.vendor.user.email,
          firstName: result.vendor.user.name || "Vendor",
          storeName:
            result.vendor.storeName ||
            result.vendor.user.name ||
            "Your Store",
          currentBalance: result.newBalance,
        });

        await prisma.vendorBoost.update({
          where: { vendorProfileId: result.vendorProfileId },
          data: {
            lowCreditAlertSent: true,
          },
        });
      }
    }

    return {
      success: true,
      newBalance: result.newBalance,
      expiry: result.expiry,
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";

    return { error: message };
  }
}



export async function addCreditsToVendor(
  vendorProfileId: string,
  amount: number,
  reference: string
) {
  try {
    const existingTransaction = await prisma.creditTransaction.findUnique({
      where: { reference },
    });

    if (existingTransaction) {
      return { success: false, error: "Transaction already processed." };
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.creditTransaction.create({
        data: {
          reference,
          amount,
          vendorProfileId,
          status: "SUCCESS",
          platform: "PAYSTACK",
          emailSent: false, 
        },
      });

      const updatedBoost = await tx.vendorBoost.update({
        where: { vendorProfileId },
        data: {
          credits: { increment: amount },
          lowCreditAlertSent: false, 
          exhaustedAlertSent: false, 
        },
      });

      const vendor = await tx.vendorProfile.findUnique({
        where: { id: vendorProfileId },
        select: {
          storeName: true,
          user: {
            select: {
              email: true,
              name: true,
            },
          },
        },
      });

      return {
        updatedBoost,
        vendor,
      };
    });

    revalidatePath("/account/vendor");
    revalidatePath("/account/vendor/credit-boost");

    if (result.vendor?.user?.email) {
      const { sendVendorCreditPurchaseEmail } = await import(
        "@/app/lib/mailer"
      );

      await sendVendorCreditPurchaseEmail({
        email: result.vendor.user.email,
        firstName: result.vendor.user.name || "Vendor",
        storeName:
          result.vendor.storeName || result.vendor.user.name || "Your Store",
        amountAdded: amount,
        newBalance: result.updatedBoost.credits,
      });

      await prisma.creditTransaction.update({
        where: { reference },
        data: {
          emailSent: true, 
          emailSentAt: new Date(), 
        },
      });
    }

    return {
      success: true,
      newBalance: result.updatedBoost.credits,
    };
  } catch (error: unknown) {
    console.error("Credit Purchase Error:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update credits.",
    };
  }
}



/**
 * GET TRANSACTION HISTORY
 * Fetches the credit purchase and usage history for a specific vendor
 */
export async function getTransactionHistory(vendorProfileId: string) {
  try {
    const transactions = await prisma.creditTransaction.findMany({
      where: { vendorProfileId },
      orderBy: { createdAt: "desc" },
      take: 10, // Adjust this number if you want to show more
    });

    return { 
      success: true, 
      transactions: JSON.parse(JSON.stringify(transactions)) // Ensure Date objects are serialized
    };
  } catch (error) {
    console.error("History Fetch Error:", error);
    return { success: false, error: "Failed to load transactions." };
  }
}
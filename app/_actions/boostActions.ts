"use server";

import prisma from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

const BOOST_COST = 5; 
const BOOST_DURATION_DAYS = 7;

/**
 * 1. BOOST PRODUCT ACTION
 * Deducts credits from a vendor and applies a time-based boost to a product
 */
export async function boostProduct(productId: string) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return { error: "Unauthorized. Please log in." };
  }

  try {
    return await prisma.$transaction(async (tx) => {
      // Find the Vendor Profile associated with the User
      const vendorProfile = await tx.vendorProfile.findUnique({
        where: { userId: session.user.id },
        select: { id: true }
      });

      if (!vendorProfile) {
        throw new Error("Vendor profile not found.");
      }

      // Get the Vendor's Boost Wallet
      const vendorBoost = await tx.vendorBoost.findUnique({
        where: { vendorProfileId: vendorProfile.id }
      });

      if (!vendorBoost || vendorBoost.credits < BOOST_COST) {
        throw new Error(`Insufficient credits. You need ${BOOST_COST} credits to boost.`);
      }

      // Calculate new expiry date
      const product = await tx.product.findUnique({
        where: { id: productId },
        select: { boostUntil: true, vendorProfileId: true }
      });

      if (!product) throw new Error("Product not found.");
      
      // Safety check: Ensure the vendor owns the product they are boosting
      if (product.vendorProfileId !== vendorProfile.id) {
        throw new Error("Unauthorized: You do not own this product.");
      }

      const baseDate = (product.boostUntil && new Date(product.boostUntil) > new Date()) 
        ? new Date(product.boostUntil) 
        : new Date();
      
      const newBoostUntil = new Date(baseDate);
      newBoostUntil.setDate(newBoostUntil.getDate() + BOOST_DURATION_DAYS);

      // Deduct Credits
      await tx.vendorBoost.update({
        where: { id: vendorBoost.id },
        data: { credits: { decrement: BOOST_COST } }
      });

      // Apply Boost to Product
      await tx.product.update({
        where: { id: productId },
        data: { 
          boostUntil: newBoostUntil,
          isTrending: true 
        }
      });

      revalidatePath("/account/vendor");
      revalidatePath("/"); // Update homepage carousels
      return { success: true };
    });
  } catch (error: any) {
    return { error: error.message || "An unexpected error occurred during boosting." };
  }
}

/**
 * 2. ADD CREDITS ACTION (With Security & History)
 * Fulfills a credit purchase and logs the transaction.
 */
export async function addCreditsToVendor(
  vendorProfileId: string, 
  amount: number, 
  reference: string
) {
  try {
    // Check if this reference has already been used (Prevent double-claiming)
    const existingTransaction = await prisma.creditTransaction.findUnique({
      where: { reference }
    });

    if (existingTransaction) {
      return { success: false, error: "Transaction already processed." };
    }

    const result = await prisma.$transaction(async (tx) => {
      // Create a record of the transaction for billing history
      await tx.creditTransaction.create({
        data: {
          reference,
          amount,
          vendorProfileId,
          status: "SUCCESS",
          platform: "PAYSTACK" // Or dynamic based on provider
        }
      });

      // Update the vendor's credit balance
      return await tx.vendorBoost.update({
        where: { vendorProfileId },
        data: {
          credits: { increment: amount },
        },
      });
    });

    revalidatePath("/account/vendor");
    return { success: true, newBalance: result.credits };
  } catch (error: any) {
    console.error("Credit Purchase Error:", error);
    return { success: false, error: error.message || "Failed to update credits." };
  }
}

/**
 * 3. GET TRANSACTION HISTORY
 * Fetches the credit purchase history for a specific vendor
 */
export async function getTransactionHistory(vendorProfileId: string) {
  try {
    const transactions = await prisma.creditTransaction.findMany({
      where: { vendorProfileId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    return { success: true, transactions };
  } catch (error) {
    return { success: false, error: "Failed to load transactions." };
  }
}

/**
 * 4. CLEANUP ACTION
 * Resets isTrending for products where boostUntil has expired
 */
export async function cleanupExpiredBoosts() {
  const now = new Date();

  try {
    const result = await prisma.product.updateMany({
      where: {
        boostUntil: { lt: now },
        isTrending: true,
      },
      data: {
        isTrending: false,
      },
    });

    revalidatePath("/");
    return { success: true, count: result.count };
  } catch (error) {
    console.error("Cleanup Error:", error);
    return { success: false, error: "Cleanup task failed." };
  }
}
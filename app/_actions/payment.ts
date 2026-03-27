"use server";


import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { revalidatePath } from "next/cache";

export async function savePaymentMethod(data: {
  provider: string;
  providerId: string; // The transaction reference from Paystack
}) {
  const session = await getServerSession(authOptions);
  
  // 1. Basic Auth Check
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized: Please sign in again." };
  }

  try {
    // 2. Verify the transaction with Paystack
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${data.providerId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const resData = await response.json();

    if (!resData.status || resData.data.status !== "success") {
      return { success: false, error: resData.message || "Payment verification failed" };
    }

    const auth = resData.data.authorization;

    // 3. Check if this specific card token (authorization_code) already exists for this user
    const existingCard = await prisma.paymentMethod.findFirst({
      where: {
        userId: session.user.id,
        providerId: auth.authorization_code,
      },
    });

    if (existingCard) {
      return { 
        success: true, 
        message: "Card already linked.", 
        data: existingCard // Return existing card so UI can show it
      };
    }

    // 4. Determine if this should be the default card
    const cardCount = await prisma.paymentMethod.count({ 
      where: { userId: session.user.id } 
    });
    const isFirstCard = cardCount === 0;

    // 5. Create the new Payment Method in Prisma
    const newCard = await prisma.paymentMethod.create({
      data: {
        userId: session.user.id,
        provider: "PAYSTACK",
        providerId: auth.authorization_code, // This is the reusable token for future charges
        last4: auth.last4,
        expiryMonth: auth.exp_month,
        expiryYear: auth.exp_year.toString().slice(-2), 
        cardType: auth.brand || "Card",
        isDefault: isFirstCard,
        metadata: {
          email: resData.data.customer.email,
          bank: auth.bank,
          card_type: auth.card_type,
          signature: auth.signature, // Useful for identifying unique cards across different users
        },
      },
    });

    // 6. Purge Next.js cache for this route
    revalidatePath("/account/customer/payment-methods");

    // 7. Return success and the new card data for immediate UI updates
    return { success: true, data: newCard };

  } catch (error) {
    console.error("VERIFY_ERROR:", error);
    return { 
      success: false, 
      error: "An internal error occurred while securing your card." 
    };
  }
}


export async function setDefaultPaymentMethod(methodId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Unauthorized" };

  try {
    // 1. Remove default status from ALL other methods for this user
    await prisma.paymentMethod.updateMany({
      where: { userId: session.user.id },
      data: { isDefault: false },
    });

    // 2. Set the chosen method as default
    await prisma.paymentMethod.update({
      where: { id: methodId },
      data: { isDefault: true },
    });

    revalidatePath("/account/customer/payment-methods");
    return { success: true };
  } catch (error) {
    return { error: "Could not update default method." };
  }
}




export async function deletePaymentMethod(cardId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { error: "Unauthorized access" };
  }

  try {
    // 1. Fetch all cards for this user to check the count
    const userCards = await prisma.paymentMethod.findMany({
      where: { userId: session.user.id },
      select: { id: true, isDefault: true }
    });

    // 2. Safety Guard: Prevent deleting the only card
    if (userCards.length <= 1) {
      return { 
        error: "You must have at least one payment method. Please add a new one before deleting this." 
      };
    }

    // 3. Find the card to be deleted
    const cardToDelete = userCards.find(c => c.id === cardId);
    if (!cardToDelete) return { error: "Card not found" };

    // 4. If deleting the DEFAULT card, assign default to another card first
    if (cardToDelete.isDefault) {
      const nextCard = userCards.find(c => c.id !== cardId);
      if (nextCard) {
        await prisma.paymentMethod.update({
          where: { id: nextCard.id },
          data: { isDefault: true }
        });
      }
    }

    // 5. Delete the card
    await prisma.paymentMethod.delete({
      where: { 
        id: cardId,
        userId: session.user.id // Extra security: ensure user owns the card
      },
    });

    revalidatePath("/account/customer/payment-methods");
    return { success: true };
  } catch (error) {
    console.error("PAYMENT_DELETE_ERROR:", error);
    return { error: "Could not remove card. Please try again." };
  }
}



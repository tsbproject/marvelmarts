"use server";

import { revalidatePath } from "next/cache";

import { requireCustomer } from "@/app/lib/auth/api";
import { PaymentService } from "@/app/lib/services/payment.service";

export async function savePaymentMethod(data: {
  providerId: string;
}) {
  try {
    const session = await requireCustomer();

    if (
      !data ||
      typeof data.providerId !== "string" ||
      !data.providerId.trim()
    ) {
      return {
        success: false,
        error: "Payment method ID is required.",
      };
    }

    const result =
      await PaymentService.savePaymentMethod(
        session.user.id,
        data.providerId.trim()
      );

    if (result.existing || result.paymentMethod) {
      revalidatePath(
        "/account/customer/payment-methods"
      );
    }

    return {
      success: true,
      ...result,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to save payment method.",
    };
  }
}

export async function setDefaultPaymentMethod(
  methodId: string
) {
  try {
    const session = await requireCustomer();

    const result =
      await PaymentService.setDefaultPaymentMethod(
        session.user.id,
        methodId
      );

    if (result.success) {
      revalidatePath(
        "/account/customer/payment-methods"
      );
    }

    return result;
  } catch (error: unknown) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Could not update default payment method.",
    };
  }
}

export async function deletePaymentMethod(
  cardId: string
) {
  try {
    const session = await requireCustomer();

    const result =
      await PaymentService.deletePaymentMethod(
        session.user.id,
        cardId
      );

    if (result.success) {
      revalidatePath(
        "/account/customer/payment-methods"
      );
    }

    return result;
  } catch (error: unknown) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Could not remove payment method.",
    };
  }
}
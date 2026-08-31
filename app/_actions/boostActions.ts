"use server";

import { revalidatePath } from "next/cache";

import { requireVendor } from "@/app/lib/auth/api";
import { BoostService } from "@/app/lib/services/boost.service";
import { VendorService } from "@/app/lib/services/vendor.service";

type BoostProductResult =
  | {
      success: true;
      newBalance: number;
      expiry: Date;
    }
  | {
      error: string;
    };

type TransactionHistoryResult =
  | {
      success: true;
      transactions: {
        id: string;
        createdAt: string;
        status: string;
        amount: number;
        reference: string;
        vendorProfileId: string;
        platform: string;
      }[];
    }
  | {
      success: false;
      error: string;
    };

export async function boostProduct(
  productId: string,
  requestedDays: number
): Promise<BoostProductResult> {
  try {
    const session = await requireVendor();

    const result = await BoostService.boostProduct(
      session.user.id,
      productId,
      requestedDays,
      {
        id: session.user.id,
        email: session.user.email ?? null,
        role: session.user.role,
      }
    );

    revalidatePath("/account/vendor/products");
    revalidatePath("/");
    revalidatePath("/account/vendor");
    revalidatePath("/account/vendor/credit-boost");

    return result;
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.",
    };
  }
}

export async function getTransactionHistory(): Promise<TransactionHistoryResult> {
  try {
    const session = await requireVendor();

    const vendor =
      await VendorService.getVendorProfileOrThrow(
        session.user.id
      );

    return await BoostService.getTransactionHistory(
      vendor.id
    );
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to load transactions.",
    };
  }
}
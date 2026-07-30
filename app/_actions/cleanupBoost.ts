"use server";

import { revalidatePath } from "next/cache";

import { requireManageTrending } from "@/app/lib/auth/api";
import { BoostService } from "@/app/lib/services/boost.service";

export async function cleanupExpiredBoosts() {
  try {
    await requireManageTrending();

    const result =
      await BoostService.cleanupExpiredBoosts();

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/account/vendor/products");

    return result;
  } catch (error: unknown) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to cleanup boosts.",
    };
  }
}
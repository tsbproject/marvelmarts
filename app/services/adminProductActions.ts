"use server";

import { revalidatePath } from "next/cache";
import { ProductService } from "@/app/lib/services/product.service";

export async function toggleTrendingAction(
  id: string,
  currentStatus: boolean
) {
  try {
    await ProductService.toggleTrendingStatus(
      id,
      currentStatus
    );

    revalidatePath("/dashboard/admins/products");
    revalidatePath("/");

    return { success: true };
  } catch {
    return {
      success: false,
      error: "Failed to update trending status.",
    };
  }
}
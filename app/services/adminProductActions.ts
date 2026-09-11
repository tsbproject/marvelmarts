"use server";

import { revalidatePath } from "next/cache";

import { requireManageProducts } from "@/app/lib/auth/api";
import { ProductService } from "@/app/lib/services/product.service";

export async function toggleTrendingAction(
  id: string,
  currentStatus: boolean
) {
  try {
    const session = await requireManageProducts();

    await ProductService.toggleTrendingStatus(
      id,
      currentStatus,
      session.user.id
    );

    revalidatePath(
      "/dashboard/admins/products"
    );

    revalidatePath("/");

    return {
      success: true,
    };
  } catch (error: any) {
    console.error(
      "Toggle Trending Error:",
      error
    );

    return {
      success: false,
      error:
        error.message ??
        "Failed to update trending status.",
    };
  }
}
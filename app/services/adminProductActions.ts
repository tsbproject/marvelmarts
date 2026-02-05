// app/services/adminProductActions.ts
"use server";

import prisma from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleTrendingAction(id: string, currentStatus: boolean) {
  try {
    await prisma.product.update({
      where: { id },
      data: { isTrending: !currentStatus },
    });

    revalidatePath("/dashboard/admins/products");
    revalidatePath("/"); // Revalidate homepage where trending products live
    
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update trending status." };
  }
}
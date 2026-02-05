// app/services/adminOrderActions.ts
"use server";

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";



export async function processRefund(orderId: string, reason: string) {
  const session = await getServerSession(authOptions);
  
  // Verify role matches exactly: 'SUPER_ADMIN'
  if (session?.user?.role !== "SUPER_ADMIN") {
    return { success: false, message: "ERROR: Level 2 clearance required." };
  }

  // LOG INPUTS: Check your terminal for these values
  console.log("REFUND ATTEMPT - ID:", orderId);
  console.log("REFUND ATTEMPT - REASON:", reason);

  try {
    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "refunded",
        refundStatus: "completed",
        refundReason: reason || "No reason provided",
      }
    });

    console.log("UPDATE SUCCESSFUL:", updated.id);
    revalidatePath(`/dashboard/admins/orders/${orderId}`);
    return { success: true, message: "Marvel Success: Funds Reversal Logged." };
  } catch (error: any) {
    // This logs the specific Prisma error code to your VS Code terminal
    console.error("PRISMA EXECUTION ERROR:", error);
    return { success: false, message: `Reversal Failed: ${error.message}` };
  }
}
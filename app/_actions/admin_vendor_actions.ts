"use server";

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";

export async function reviewVendorAccount(
  vendorProfileId: string,
  action: "APPROVE" | "REJECT",
  reason?: string
) {
  try {
    if (action === "APPROVE") {
      await prisma.vendorProfile.update({
        where: { id: vendorProfileId },
        data: {
          status: "APPROVED",
          isVerified: true, // This enables the "Verified Badge" on the storefront
          user: {
            update: { role: "VENDOR" } // Ensures role foundation is synced
          }
        },
      });
    } else {
      await prisma.vendorProfile.update({
        where: { id: vendorProfileId },
        data: {
          status: "REJECTED",
          rejectionReason: reason,
          isVerified: false,
        },
      });
    }

    revalidatePath("/admins/vendors");
    return { success: true };
  } catch (error) {
    return { error: "Action failed." };
  }
}
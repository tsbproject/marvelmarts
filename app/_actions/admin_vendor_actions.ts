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
            isVerified: true,

            user: {
              update: {
                role: "VENDOR",
                roles: ["CUSTOMER", "VENDOR"],
              }
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

    revalidatePath("/dashboard/admins/vendors");
    return { success: true };
  } catch (error) {
    return { error: "Action failed." };
  }
}
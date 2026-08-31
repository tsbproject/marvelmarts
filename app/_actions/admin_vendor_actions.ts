"use server";

import { revalidatePath } from "next/cache";

import { requireManageVendors } from "@/app/lib/auth/api";
import { VendorService } from "@/app/lib/services/vendor.service";

export async function reviewVendorAccount(
  vendorProfileId: string,
  action: "APPROVE" | "REJECT",
  reason?: string
) {
  try {
    const session =
      await requireManageVendors();

    const result =
      await VendorService.reviewVendorAccount(
        vendorProfileId,
        action,
        reason,
        {
          id: session.user.id,
          email:
            session.user.email ?? null,
          role: session.user.role,
        }
      );

    revalidatePath(
      "/dashboard/admins/vendors"
    );

    return result;
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Action failed.",
    };
  }
}
"use server";

import { revalidatePath } from "next/cache";

import { requireVendorProfile } from "@/app/lib/auth/api";
import { VendorService } from "@/app/lib/services/vendor.service";

export async function completeStoreSetup(
  vendorProfileId: string,
  formData: FormData
) {
  await requireVendorProfile();

  const result =
    await VendorService.completeStoreSetup(
      vendorProfileId,
      formData
    );

  if (result.success) {
    revalidatePath("/account/vendor");
  }

  return result;
}
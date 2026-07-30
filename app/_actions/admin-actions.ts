"use server";

import { revalidatePath } from "next/cache";

import { requireVendor } from "@/app/lib/auth/api";
import { VendorService } from "@/app/lib/services/vendor.service";
import type { VerificationStatus } from "@/types/vendor";

type SubmitVendorDocsResult =
  | {
      success: true;
      allDocsSubmitted: boolean;
      status: import("@prisma/client").VendorStatus;
      verificationStatus: VerificationStatus;
      emailSent: boolean;
    }
  | {
      success: false;
      error: string;
    };

export async function submitVendorDocs(
  vendorProfileId: string,
  url: string,
  step: "IDENTITY" | "BUSINESS" | "LOCATION"
): Promise<SubmitVendorDocsResult> {
  try {
    const session = await requireVendor();

    const result = await VendorService.submitVerificationDocuments(
      vendorProfileId,
      url,
      step,
      {
        id: session.user.id,
        email: session.user.email ?? null,
        role: session.user.role,
      }
    );

    revalidatePath("/account/vendor");
    revalidatePath("/account/vendor/verification");

    return result;
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unexpected error occurred",
    };
  }
}










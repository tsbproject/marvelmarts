"use server";

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitVerification(
  vendorProfileId: string,
  type: "IDENTITY" | "LOCATION" | "PHONE",
  documentUrl: string
) {
  try {
    // 1. Create the specific verification record
    // Note: You may need to add a VendorVerification model to your schema 
    // or store this in a JSON field in VendorProfile
    await prisma.vendorProfile.update({
      where: { id: vendorProfileId },
      data: {
        // We track that a specific part of the verification is now PENDING
        // This acts as the trigger for the Admin Dashboard
        status: "PENDING", 
        onboarding: {
          update: {
             profileDone: true // Marking progress in Phase 4
          }
        }
      },
    });

    revalidatePath("/account/vendor/verification-center");
    return { success: true };
  } catch (error) {
    return { error: "Failed to submit documents." };
  }
}
"use server";


import { requireVendorProfile } from "@/app/lib/auth/api";
import { CloudinaryService } from "@/app/lib/services/cloudinary.service";

export async function getCloudinarySignature(
  folder = "vendor-docs"
) {
  try {
    await requireVendorProfile();

    return await CloudinaryService.getUploadSignature(folder);
  } catch (error) {
    console.error("SIGNATURE_ERROR:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to generate upload signature.",
    };
  }
}
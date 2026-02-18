"use server";

import { prisma } from "@/app/lib/prisma";
import { VendorStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function processVendorApproval(
  vendorProfileId: string, 
  status: VendorStatus,
  rejectionReason?: string
) {
  try {
    // 1. Update the VendorProfile status
    const updatedProfile = await prisma.vendorProfile.update({
      where: { id: vendorProfileId },
      data: { 
        status: status,
        isVerified: status === "APPROVED",
        rejectionReason: status === "REJECTED" ? rejectionReason : null
      }
    });

    // 2. Self-Healing: Ensure the VendorStore exists if approved
    if (status === "APPROVED") {
      const storeName = updatedProfile.storeName || "My Store";
      const storeSlug = `${storeName.toLowerCase().replace(/\s+/g, '-')}-${vendorProfileId.slice(-5)}`;

      await prisma.vendorStore.upsert({
        where: { vendorProfileId },
        update: {},
        create: {
          vendorProfileId,
          name: storeName,
          slug: storeSlug,
        }
      });
    }

    revalidatePath("/account/vendor/verification");
    return { success: true };
  } catch (error: any) {
    // CRUCIAL: Look at your VS Code terminal for this log!
    console.error("ADMIN_ACTION_PRISMA_ERROR:", error.message || error);
    return { success: false, error: error.message || "Database update failed" };
  }
}


export async function submitVendorDocs(vendorProfileId: string, docUrl: string) {
  try {
    console.log("Saving URL for Profile:", vendorProfileId); // Check your terminal for this
    
    await prisma.vendorProfile.update({
      where: { id: vendorProfileId },
      data: { 
        status: "PENDING",
        // !!! CHECK: Is this field EXACTLY 'verificationDoc' in your schema.prisma?
        verificationDoc: docUrl 
      }
    });
    
    return { success: true };
  } catch (error: any) {
    // This will print the EXACT Prisma error in your VS Code terminal
    console.error("SUBMIT_DOCS_DATABASE_ERROR:", error.message || error);
    return { success: false, error: error.message };
  }
}


export async function getPendingVendors() {
  try {
    const pendingVendors = await prisma.vendorProfile.findMany({
      where: { status: "PENDING" },
      include: { user: true }, // To show the person's name/email
      orderBy: { updatedAt: "desc" },
    });
    return { success: true, data: pendingVendors };
  } catch (error) {
    return { success: false, error: "Failed to fetch pending vendors" };
  }
}
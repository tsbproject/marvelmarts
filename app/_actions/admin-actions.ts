// "use server";

// import { prisma } from "@/app/lib/prisma";
// import { VendorStatus } from "@prisma/client";
// import { revalidatePath } from "next/cache";
// import { sendVendorReviewEmail } from "@/app/lib/mailer";

// export type VerificationStatus =
//   | "NOT_STARTED"
//   | "PENDING"
//   | "APPROVED"
//   | "REJECTED"
//   | "PENDING_REVIEW";
// export async function submitVendorDocs(
//   vendorProfileId: string,
//   url: string,
//   step: "IDENTITY" | "BUSINESS" | "LOCATION"
// ) {
//   try {
//     const fieldMap = {
//       IDENTITY: "identityDoc",
//       BUSINESS: "businessDoc",
//       LOCATION: "locationDoc",
//     } as const;

//     const field = fieldMap[step];
//     if (!field) return { success: false, error: "Invalid verification step" };

//     // 1. Update Document
//     await prisma.vendorProfile.update({
//       where: { id: vendorProfileId },
//       data: { [field]: url },
//     });

//     // 2. Fetch fresh data
//     const vendor = await prisma.vendorProfile.findUnique({
//       where: { id: vendorProfileId },
//       include: { user: true },
//     });

//     if (!vendor) return { success: false, error: "Vendor profile not found" };

//     // 3. Re-map document state
//     const identityDoc = vendor.identityDoc;
//     const businessDoc = vendor.businessDoc;
//     const locationDoc = vendor.locationDoc;
//     const hasAllDocs = Boolean(identityDoc && businessDoc && locationDoc);

//     let finalStatus = vendor.status;
    
    
//     let emailSent = false;

//     // 4. Handle Status Transition to PENDING_REVIEW
//     if (hasAllDocs && (vendor.status === VendorStatus.PENDING || vendor.status === VendorStatus.REJECTED)) {
//         const updatedVendor = await prisma.vendorProfile.update({
//           where: { id: vendorProfileId },
//           data: {
//             status: VendorStatus.PENDING_REVIEW,
//             rejectionReason: null,
//           },
//         });
//         finalStatus = updatedVendor.status;
      
//       // 5. Send Email (Explicitly awaited to ensure execution)
//       try {
//         console.log(`[submitVendorDocs] Attempting to send review email to: ${vendor.user.email}`);
//         await sendVendorReviewEmail({
//           email: vendor.user.email,
//           firstName: vendor.user.name || "Vendor",
//           storeName: vendor.storeName || "Your Store",
//         });
//         emailSent = true;
//         console.log(`[submitVendorDocs] Review email successfully sent.`);
//       } catch (emailError) {
//         console.error("[submitVendorDocs] Email sending FAILED:", emailError);
//         // Do not return error here; document update was successful.
//       }
//     }

//     // 7 Determine frontend-friendly verificationStatus
//     let verificationStatus: VerificationStatus = "NOT_STARTED";
//     if (!identityDoc && !businessDoc && !locationDoc) {
//       verificationStatus = "NOT_STARTED";
//     } else if (finalStatus === VendorStatus.PENDING_REVIEW) {
//       verificationStatus = "PENDING_REVIEW";
//     } else if (finalStatus === VendorStatus.REJECTED) {
//       verificationStatus = "REJECTED";
//     } else if (finalStatus === VendorStatus.APPROVED) {
//       verificationStatus = "APPROVED";
//     } else {
//       verificationStatus = "PENDING";
//     }

//     // 8 Revalidate server-side pages
//     revalidatePath("/account/vendor");
//     revalidatePath("/account/vendor/verification");

//     // 9 Return response to frontend
//     return {
//       success: true,
//     allDocsSubmitted: hasAllDocs,
//       status: finalStatus,
//       verificationStatus,
//     };
//   } catch (error: any) {
//     console.error("[submitVendorDocs] Error:", error);
//     return {
//       success: false,
//       error: error?.message || "Unexpected error occurred",
//     };
//   }
// }



"use server";

import { prisma } from "@/app/lib/prisma";
import { VendorStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { sendVendorReviewEmail } from "@/app/lib/mailer";

export type VerificationStatus =
  | "NOT_STARTED"
  | "AWAITING_DOCUMENTS"
  | "APPROVED"
  | "REJECTED"
  | "PENDING_REVIEW";

export async function submitVendorDocs(
  vendorProfileId: string,
  url: string,
  step: "IDENTITY" | "BUSINESS" | "LOCATION"
) {
  try {
    const fieldMap = {
      IDENTITY: "identityDoc",
      BUSINESS: "businessDoc",
      LOCATION: "locationDoc",
    } as const;

    const field = fieldMap[step];
    if (!field) {
      return { success: false, error: "Invalid verification step" };
    }

    await prisma.vendorProfile.update({
      where: { id: vendorProfileId },
      data: { [field]: url },
    });

    const vendor = await prisma.vendorProfile.findUnique({
      where: { id: vendorProfileId },
      include: { user: true },
    });

    if (!vendor) {
      return { success: false, error: "Vendor profile not found" };
    }

    const identityDoc = vendor.identityDoc;
    const businessDoc = vendor.businessDoc;
    const locationDoc = vendor.locationDoc;
    const hasAllDocs = Boolean(identityDoc && businessDoc && locationDoc);

    let finalStatus = vendor.status;
    let emailSent = false;

    if (
      hasAllDocs &&
      (
        vendor.status === VendorStatus.AWAITING_DOCUMENTS ||
        vendor.status === VendorStatus.REJECTED
      )
    ) {
      const updatedVendor = await prisma.vendorProfile.update({
        where: { id: vendorProfileId },
        data: {
          status: VendorStatus.PENDING_REVIEW,
          rejectionReason: null,
        },
      });

      finalStatus = updatedVendor.status;

      try {
        console.log(
          `[submitVendorDocs] Attempting to send review email to: ${vendor.user.email}`
        );

        await sendVendorReviewEmail({
          email: vendor.user.email,
          firstName: vendor.user.name || "Vendor",
          storeName: vendor.storeName || "Your Store",
        });

        emailSent = true;
        console.log(`[submitVendorDocs] Review email successfully sent.`);
      } catch (emailError) {
        console.error("[submitVendorDocs] Email sending FAILED:", emailError);
      }
    }

    let verificationStatus: VerificationStatus = "NOT_STARTED";

    if (!identityDoc && !businessDoc && !locationDoc) {
      verificationStatus = "NOT_STARTED";
    } else if (finalStatus === VendorStatus.PENDING_REVIEW) {
      verificationStatus = "PENDING_REVIEW";
    } else if (finalStatus === VendorStatus.REJECTED) {
      verificationStatus = "REJECTED";
    } else if (finalStatus === VendorStatus.APPROVED) {
      verificationStatus = "APPROVED";
    } else {
      verificationStatus = "AWAITING_DOCUMENTS";
    }

    revalidatePath("/account/vendor");
    revalidatePath("/account/vendor/verification");

    return {
      success: true,
      allDocsSubmitted: hasAllDocs,
      status: finalStatus,
      verificationStatus,
      emailSent,
    };
  } catch (error: any) {
    console.error("[submitVendorDocs] Error:", error);
    return {
      success: false,
      error: error?.message || "Unexpected error occurred",
    };
  }
}










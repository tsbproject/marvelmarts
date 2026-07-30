// "use server";

// import { revalidatePath } from "next/cache";
// import { Prisma } from "@prisma/client";

// import { prisma } from "@/app/lib/prisma";
// import { requireVendorProfile } from "@/app/lib/auth/api";
// import { VendorService } from "@/app/lib/services/vendor.service";

// type CompleteStoreSetupResult =
//   | { success: true }
//   | { success: false; error: string };

// export async function completeStoreSetup(
//   vendorProfileId: string,
//   formData: FormData
// ): Promise<CompleteStoreSetupResult> {
//   const name = String(formData.get("name") ?? "").trim();
//   const slug = String(formData.get("slug") ?? "").trim();
//   const bio = String(formData.get("bio") ?? "").trim();

//   try {
//     const { vendor } = await requireVendorProfile();

//     if (vendor.id !== vendorProfileId) {
//       return {
//         success: false,
//         error: "You do not have permission to update this store.",
//       };
//     }

//     if (!name || !slug) {
//       return {
//         success: false,
//         error: "Store name and slug are required.",
//       };
//     }

//     const formattedSlug = VendorService.makeSlug(slug);

//     await VendorService.ensureStoreSlugAvailable(
//       formattedSlug,
//       vendorProfileId
//     );

//     await prisma.$transaction([
//       prisma.vendorStore.update({
//         where: { vendorProfileId },
//         data: {
//           name,
//           slug: formattedSlug,
//           description: bio,
//         },
//       }),
//       prisma.vendorOnboarding.update({
//         where: { vendorProfileId },
//         data: { storeDone: true },
//       }),
//     ]);

//     revalidatePath("/account/vendor");
//     revalidatePath("/account/vendor/store-settings");

//     return { success: true };
//   } catch (error: unknown) {
//     if (
//       error instanceof Prisma.PrismaClientKnownRequestError &&
//       error.code === "P2002"
//     ) {
//       return {
//         success: false,
//         error: "This store slug is already taken.",
//       };
//     }

//     if (error instanceof Error) {
//       return {
//         success: false,
//         error: error.message || "Something went wrong. Please try again.",
//       };
//     }

//     return {
//       success: false,
//       error: "Something went wrong. Please try again.",
//     };
//   }
// }





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

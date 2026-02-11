"use server"

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";

export async function completeStoreSetup(vendorProfileId: string, formData: FormData) {
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const bio = formData.get("bio") as string;

  try {
    const formattedSlug = slug.toLowerCase().trim().replace(/\s+/g, '-');

    await prisma.$transaction([
      // 1. Update the actual Store details
      prisma.vendorStore.update({
        where: { vendorProfileId },
        data: { 
          name, 
          slug: formattedSlug, 
          description: bio 
        },
      }),
      // 2. Update the Onboarding Tracker (Phase 4)
      prisma.vendorOnboarding.update({
        where: { vendorProfileId },
        data: { storeDone: true }
      })
    ]);

    revalidatePath("/account/vendor");
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') return { error: "This store slug is already taken." };
    return { error: "Something went wrong. Please try again." };
  }
}
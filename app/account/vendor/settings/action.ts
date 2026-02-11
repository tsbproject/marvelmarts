// app/account/vendor/settings/actions.ts
"use server"

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateStoreSettings(vendorProfileId: string, formData: FormData) {
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const bio = formData.get("bio") as string;

  try {
    await prisma.$transaction([
      // 1. Update the Store Identity
      prisma.vendorStore.update({
        where: { vendorProfileId },
        data: { 
          name, 
          slug: slug.toLowerCase().replace(/\s+/g, '-'), // Enforce slug format
          description: bio 
        },
      }),
      // 2. Mark Store Setup as Done in the Onboarding Tracker
      prisma.vendorOnboarding.update({
        where: { vendorProfileId },
        data: { storeDone: true }
      })
    ]);

    revalidatePath("/account/vendor");
    return { success: true };
  } catch (error) {
    return { error: "Slug already taken or update failed." };
  }
}
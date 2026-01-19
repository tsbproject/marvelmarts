"use server";

import prisma from "@/app/lib/prisma";
import { revalidatePath } from "next/cache"; 

export async function updateSiteSettings(formData: FormData) {
  const footerDesc = formData.get("footerDesc") as string;
  const supportPhone = formData.get("supportPhone") as string;
  const supportEmail = formData.get("supportEmail") as string;

  // Basic Validation
  if (!footerDesc || !supportPhone || !supportEmail) {
    return { success: false, message: "All fields are required." };
  }

  try {
    // We use upsert so that it updates ID 1 if it exists, or creates it if it doesn't
    await prisma.siteSettings.upsert({
      where: { id: 1 },
      update: {
        footerDesc,
        supportPhone,
        supportEmail,
      },
      create: {
        id: 1,
        footerDesc,
        supportPhone,
        supportEmail,
      },
    });

    // This clears the cache so the footer updates immediately across the site
    revalidatePath("/"); 
    
    return { success: true, message: "Settings updated successfully!" };
  } catch (error) {
    console.error("Settings Update Error:", error);
    return { success: false, message: "Database error: Failed to update settings." };
  }
}
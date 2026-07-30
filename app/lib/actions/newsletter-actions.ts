"use server";

"use server";

import { requireManageSubscribers } from "@/app/lib/auth/api";
import { NewsletterService } from "@/app/lib/services/newsletter.service";

export async function exportSubscribersToCSV() {
  try {
    await requireManageSubscribers();

    return await NewsletterService.exportSubscribersToCSV();
  } catch (error) {
    console.error("Export Error:", error);

    return {
      success: false,
      message: "Failed to generate export.",
    };
  }
}
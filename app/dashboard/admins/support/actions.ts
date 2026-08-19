"use server";

import { revalidatePath } from "next/cache";

import { HelpCenterService } from "@/app/lib/services/help-center.service";


export async function deleteArticleAction(
  formData: FormData
) {
  const id =
    formData.get("id") as string;

  if (!id) {
    throw new Error(
      "Missing article ID"
    );
  }

  try {
    await HelpCenterService.deleteArticle(
      id
    );

    revalidatePath(
      "/dashboard/admins/support"
    );

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "Delete Article Error:",
      error
    );

    return {
      success: false,
      error:
        "Failed to delete article",
    };
  }
}

export async function getOpenTicketCount() {
  try {
    return await HelpCenterService.getOpenTicketCount();
  } catch {
    return 0;
  }
}

export async function updateTicketNotes(
  ticketId: string,
  notes: string
) {
  try {
    await HelpCenterService.updateTicketNotes(
      ticketId,
      notes
    );

    revalidatePath(
      `/dashboard/admins/support/tickets/${ticketId}`
    );

    return {
      success: true,
    };
  } catch {
    return {
      success: false,
    };
  }
}
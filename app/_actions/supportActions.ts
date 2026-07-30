"use server";

import { requireManageSupport } from "@/app/lib/auth/api";
import { HelpCenterService } from "@/app/lib/services/help-center.service";

export async function sendTicketReply(input: {
  ticketId: string;
  message: string;
  status: string;
}) {
  try {
    await requireManageSupport();

    return await HelpCenterService.replyToTicket(input);
  } catch (error: unknown) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to send support reply.",
    };
  }
}
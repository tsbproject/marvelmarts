


"use server";

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";

// ... your existing deleteArticleAction ...

/**
 * Fetches the count of OPEN tickets for the navigation badge
 */
export async function getOpenTicketCount() {
  try {
    const count = await prisma.ticket.count({
      where: { status: "OPEN" },
    });
    return count;
  } catch (error) {
    return 0;
  }
}

/**
 * Updates internal admin notes for a specific ticket
 */
export async function updateTicketNotes(ticketId: string, notes: string) {
  await prisma.ticket.update({
    where: { id: ticketId },
    data: { notes },
  });

  revalidatePath(`/dashboard/admins/support/tickets/${ticketId}`);
}
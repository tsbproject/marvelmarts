"use server";

import { prisma } from "@/app/lib/prisma"; 
import { revalidatePath } from "next/cache";

export async function deleteArticleAction(id: string) {
  try {
    await prisma.helpArticle.delete({
      where: { id },
    });
    revalidatePath("/dashboard/admins/support");
    return { success: true };
  } catch (error) {
    console.error("Delete Article Error:", error);
    return { success: false, error: "Failed to delete article" };
  }
}

export async function getOpenTicketCount() {
  try {
    // Matches 'model Ticket' in schema
    const count = await prisma.ticket.count({
      where: { status: "OPEN" },
    });
    return count;
  } catch (error) {
    return 0;
  }
}

export async function updateTicketNotes(ticketId: string, notes: string) {
  try {
    // Matches 'model Ticket' in schema
    await prisma.ticket.update({
      where: { id: ticketId },
      data: { notes },
    });
    revalidatePath(`/dashboard/admins/support/tickets/${ticketId}`);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
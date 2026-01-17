"use server";

import { prisma } from "@/app/lib/prisma"; 
import { revalidatePath } from "next/cache";

export async function deleteArticleAction(formData: FormData) {
  // Match this to your <input name="id" ... />
  const id = formData.get("id") as string; 
  
  //Type Guard: Prisma requires a valid string for 'where'
  if (!id) {
    return { success: false, error: "No ID provided" };
  }

  try {
    await prisma.helpArticle.delete({ 
      where: { id } // This should no longer be red
    });
    
    revalidatePath("/dashboard/admins/support");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to delete" };
  }
}

// ... rest of your functions (getOpenTicketCount and updateTicketNotes) are correct
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
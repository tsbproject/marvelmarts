"use server";

import prisma from "@/app/lib/prisma";

export async function exportSubscribersToCSV() {
  try {
    // Fetch all subscribers from the database
    const subscribers = await prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: "desc" },
    });

    if (subscribers.length === 0) {
      return { success: false, message: "No subscribers found to export." };
    }

    // Define CSV Headers
    const headers = ["ID", "Email", "Joined Date"];
    
    // Map data to rows
    const rows = subscribers.map((sub) => [
      sub.id,
      sub.email,
      sub.createdAt.toISOString(),
    ]);

    // Combine into a single string
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    return { success: true, data: csvContent };
  } catch (error) {
    console.error("Export Error:", error);
    return { success: false, message: "Failed to generate export." };
  }
}
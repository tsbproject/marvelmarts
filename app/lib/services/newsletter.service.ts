import {prisma } from "@/app/lib/prisma";

export class NewsletterService {


static async exportSubscribersToCSV() {
  const subscribers =
    await prisma.newsletterSubscriber.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

  if (subscribers.length === 0) {
    return {
      success: false,
      message: "No subscribers found to export.",
    };
  }

  const headers = [
    "ID",
    "Email",
    "Joined Date",
  ];

  const rows = subscribers.map((subscriber) => [
    subscriber.id,
    subscriber.email,
    subscriber.createdAt.toISOString(),
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  return {
    success: true,
    data: csvContent,
  };
}
}
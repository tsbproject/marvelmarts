


import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { sendAdminTicketNotification, sendCustomerTicketConfirmation } from "@/app/lib/mailer";

export async function POST(req: Request) {
  const body = await req.json();

  const ticket = await prisma.ticket.create({
    data: {
      subject: body.subject || "General Support",
      message: body.message,
      userEmail: body.email,
      articleId: body.articleId || null,
    }
  });

  // Get article context if it exists
  let articleTitle = "";
  if (body.articleId) {
    const art = await prisma.helpArticle.findUnique({ where: { id: body.articleId } });
    articleTitle = art?.title || "";
  }

  // Send Emails
  try {
    // 1. Alert the Admin
    await sendAdminTicketNotification({
      id: ticket.id,
      subject: ticket.subject,
      email: ticket.userEmail,
      message: ticket.message,
      articleTitle
    });

    // 2. Acknowledge the Customer
    await sendCustomerTicketConfirmation(ticket.userEmail, ticket.subject);
  } catch (error) {
    console.error("Email notification failed:", error);
  }

  return NextResponse.json(ticket);
}
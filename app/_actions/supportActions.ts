"use server";

import { prisma } from "@/app/lib/prisma";

import {
  sendSupportProgressEmail,
  sendSupportResolvedEmail,
} from "@/app/lib/mailer";

export async function sendTicketReply({
  ticketId,
  message,
  status,
}: {
  ticketId: string;

  message: string;

  status: string;
}) {

  // GET TICKET
  const ticket =
    await prisma.ticket.findUnique({
      where: {
        id: ticketId,
      },
    });

  if (!ticket) {
    throw new Error(
      "Ticket not found"
    );
  }

  // CREATE REPLY
  await prisma.ticketReply.create({
    data: {
      ticketId,

      senderType: "ADMIN",

      message,
    },
  });

  // UPDATE STATUS
  await prisma.ticket.update({
    where: {
      id: ticketId,
    },

    data: {
      status,
    },
  });

  // SEND RESOLUTION EMAIL
  if (status === "RESOLVED") {

    await sendSupportResolvedEmail({
      to: ticket.userEmail,

      ticketId: ticket.id,

      subject: ticket.subject,

      message,
    });

  } else {

    // SEND PROGRESS EMAIL
    await sendSupportProgressEmail({
      to: ticket.userEmail,

      ticketId: ticket.id,

      subject: ticket.subject,

      status,

      message,
    });
  }

  return {
    success: true,
  };
}
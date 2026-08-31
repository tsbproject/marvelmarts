import { NextResponse } from "next/server";
import { z } from "zod";
import DOMPurify from "isomorphic-dompurify";

import { TicketService } from "@/app/lib/services/ticket.service";

import {
  sendSupportAcknowledgementEmail,
  sendAdminSupportNotification,
} from "@/app/lib/mailer";

import { pusherServer } from "@/app/lib/pusherServer";
import { verifyOrigin } from "@/app/lib/auth/csrf";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";

// VALIDATION
const ticketSchema = z.object({
  email: z.string().email().max(100),
  subject: z.string().min(3).max(150),
  message: z.string().min(10).max(5000),
  category: z.string().optional(),
  priority: z.string().optional(),
  articleId: z.string().optional().nullable(),
});

export const POST = withApiLogging(
  async (req: Request) => {
    try {
      verifyOrigin(req);

      // REQUEST DATA
      const json = await req.json();

      // HONEYPOT
      if (json.marvel_bot_gate) {
        return NextResponse.json(
          {
            message:
              "Security Protocol Active",
          },
          {
            status: 200,
          }
        );
      }

      // VALIDATE REQUEST
      const body =
        ticketSchema.parse(json);

      // SANITIZE INPUTS
      const cleanMessage =
        DOMPurify.sanitize(
          body.message
        );

      const cleanSubject =
        DOMPurify.sanitize(
          body.subject
        );

      // NORMALIZED VALUES
      const category =
        body.category ??
        "GENERAL";

      const priority =
        body.priority ??
        "MEDIUM";

      // CREATE SUPPORT TICKET
      const { ticket } =
        await TicketService.createTicket({
          email: body.email,
          subject: cleanSubject,
          message: cleanMessage,
          category,
          priority,
          articleId:
            body.articleId ?? null,
        });

      // REALTIME PUSHER EVENT
      try {
        await pusherServer.trigger(
          "admin-system",
          "new-support-ticket",
          {
            id: ticket.id,
            email: body.email,
            subject: cleanSubject,
            category,
            priority,
          }
        );
      } catch (pusherError) {
        console.error(
          "Pusher Support Notification Error:",
          pusherError
        );
      }

      // SEND USER ACKNOWLEDGEMENT EMAIL
      try {
        await sendSupportAcknowledgementEmail({
          to: body.email,
          ticketId: ticket.id,
          subject: cleanSubject,
          priority,
        });
      } catch (emailError) {
        console.error(
          "User acknowledgement email failed:",
          emailError
        );
      }

      // SEND ADMIN EMAIL ALERT
      try {
        await sendAdminSupportNotification({
          ticketId: ticket.id,
          subject: cleanSubject,
          category,
          priority,
          email: body.email,
        });
      } catch (adminEmailError) {
        console.error(
          "Admin notification email failed:",
          adminEmailError
        );
      }

      return NextResponse.json({
        success: true,
        id: ticket.id,
        message:
          "Support ticket submitted successfully.",
      });
    } catch (error) {
      console.error(
        "Support Ticket Error:",
        error
      );

      if (
        error instanceof z.ZodError
      ) {
        return NextResponse.json(
          {
            error:
              "Invalid Data Structure",
            issues:
              error.flatten(),
          },
          {
            status: 422,
          }
        );
      }

      return NextResponse.json(
        {
          error:
            "Internal Security Error",
        },
        {
          status: 500,
        }
      );
    }
  }
);
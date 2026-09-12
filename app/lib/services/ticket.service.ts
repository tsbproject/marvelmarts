import { NotificationContext } from "@prisma/client";
import { prisma } from "@/app/lib/prisma";

export class TicketService {
  /* -------------------------------------------------------------------------- */
  /* UPDATE STATUS                                                              */
  /* -------------------------------------------------------------------------- */

  static async updateStatus(
    id: string,
    status:
      | "OPEN"
      | "IN_PROGRESS"
      | "RESOLVED"
      | "CLOSED"
  ) {
    return prisma.ticket.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });
  }

  /* -------------------------------------------------------------------------- */
  /* CREATE SUPPORT TICKET                                                      */
  /* -------------------------------------------------------------------------- */

  static async createTicket(data: {
    email: string;
    subject: string;
    message: string;
    category?: string;
    priority?: string;
    articleId?: string | null;
  }) {
    const ticket =
      await prisma.ticket.create({
        data: {
          subject: data.subject,
          message: data.message,
          userEmail: data.email,
          category:
            data.category ?? "GENERAL",
          priority:
            data.priority ?? "MEDIUM",
          articleId:
            data.articleId ?? null,
        },
      });

    const admins =
      await prisma.user.findMany({
        where: {
          roles: {
            has: "ADMIN",
          },
        },
        select: {
          id: true,
        },
      });

    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          type: "SUPPORT_TICKET",
          title: "New Support Ticket",
          message: `${data.email} submitted a support request.`,
          link: `/dashboard/admins/support/tickets/${ticket.id}`,
          context: NotificationContext.ADMIN,
        })),
      });
    }

    return {
      ticket,
      admins,
    };
  }
}

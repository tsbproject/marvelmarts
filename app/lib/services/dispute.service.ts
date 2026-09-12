import { NotificationContext } from "@prisma/client";
import { prisma } from "@/app/lib/prisma";
import { sendAdminAlert } from "@/app/lib/mailer";
import { pusherServer } from "@/app/lib/pusherServer";
import { logger } from "@/app/lib/logger";

export class DisputeService {
  static async createDispute({
    orderId,
    vendorProfileId,
    vendorName,
    reason,
    description,
    raisedById,
  }: {
    orderId: string;
    vendorProfileId: string;
    vendorName: string;
    reason: string;
    description?: string;
    raisedById: string;
  }) {
    const dispute = await prisma.dispute.create({
      data: {
        vendorProfileId,
        orderId,
        reason,
        description,
        status: "OPEN",
        raisedById,
      },
    });

    const admins = await prisma.user.findMany({
      where: {
        role: "ADMIN",
      },
      select: {
        id: true,
      },
    });

    await Promise.all(
      admins.map((admin) =>
        prisma.notification.create({
          data: {
            userId: admin.id,
            type: "DISPUTE",
            title: "New Dispute Filed",
            message: `Vendor ${vendorName} filed a dispute for Order #${orderId}`,
            link: `/admin/disputes/${dispute.id}`,
            context: NotificationContext.ADMIN,
          },
        })
      )
    );

    try {
      await pusherServer.trigger(
        "admin-notifications",
        "new-alert",
        {
          type: "DISPUTE",
          title: "New Dispute Filed",
          message: `${vendorName} raised a dispute for Order #${orderId}`,
          link: `/admin/disputes/${dispute.id}`,
        }
      );
    } catch (err) {
      logger.error("Pusher Error:", err);
    }

    try {
      await sendAdminAlert({
        type: "DISPUTE",
        subject: `Order #${orderId} Dispute`,
        details: `Vendor: ${vendorName}
Reason: ${reason}
Description: ${description}

Action required immediately in the Admin Control Center.`,
      });
    } catch (err) {
      logger.error("Admin Email Error:", err);
    }

    return dispute;
  }
}

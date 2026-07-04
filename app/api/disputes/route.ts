import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/app/lib/prisma";

import { requireAuth } from "@/app/lib/auth/guards";
import { handleApiError } from "@/app/lib/auth/api";
import { badRequest } from "@/app/lib/auth/errors";

import { sendAdminAlert } from "@/app/lib/mailer";
import { pusherServer } from "@/app/lib/pusherServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();

    const {
      orderId,
      reason,
      description,
      vendorName,
      vendorProfileId,
    } = await req.json();

    if (
      !orderId ||
      !reason ||
      !vendorProfileId
    ) {
      throw badRequest(
        "Order, vendor and dispute reason are required."
      );
    }

    const dispute = await prisma.dispute.create({
      data: {
        vendorProfileId,
        orderId,
        reason,
        description,
        status: "OPEN",
        raisedById: session.user.id,
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
      console.error("Pusher Error:", err);
    }

    try {
      await sendAdminAlert({
        type: "DISPUTE",
        subject: `Order #${orderId} Dispute`,
        details: `Vendor: ${vendorName}\nReason: ${reason}\nDescription: ${description}\n\nAction required immediately in the Admin Control Center.`,
      });
    } catch (err) {
      console.error("Admin Email Error:", err);
    }

    return NextResponse.json(
      {
        success: true,
        disputeId: dispute.id,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
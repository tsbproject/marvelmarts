import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/app/lib/prisma";
import { pusherServer } from "@/app/lib/pusherServer";
import { sendRefundStatusEmail } from "@/app/lib/mailer";

import { requireManageOrders } from "@/app/lib/auth/guards";
import { handleApiError } from "@/app/lib/auth/api";
import {
  badRequest,
  notFound,
} from "@/app/lib/auth/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

type RefundAction =
  | "approved"
  | "rejected";

export async function PATCH(
  req: NextRequest,
  { params }: Context
) {
  try {
    await requireManageOrders();

    const { id } = await params;

    const body = await req.json();

    const action =
      body.action as RefundAction;

    const adminNote =
      body.adminNote?.trim() ||
      "Administrative decision";

    if (
      action !== "approved" &&
      action !== "rejected"
    ) {
      throw badRequest(
        "Invalid refund action."
      );
    }

    const order =
      await prisma.order.findUnique({
        where: {
          id,
        },
        include: {
          items: true,
        },
      });

    if (!order) {
      throw notFound(
        "Order not found."
      );
    }

    const updatedOrder =
      await prisma.order.update({
        where: {
          id,
        },
        data: {
          refundStatus: action,
          cancelReason: adminNote,

          ...(action === "approved"
            ? {
                status: "refunded",
              }
            : {}),
        },
        include: {
          items: true,
        },
      });

    if (updatedOrder.userId) {
      try {
        await pusherServer.trigger(
          `user-${updatedOrder.userId}`,
          "order-update",
          updatedOrder
        );
      } catch (error) {
        console.error(
          "PUSHER_REFUND_ERROR:",
          error
        );
      }
    }

    try {
      await sendRefundStatusEmail(
        updatedOrder,
        action,
        adminNote
      );
    } catch (error) {
      console.error(
        "REFUND_EMAIL_ERROR:",
        error
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          `Refund ${action} successfully.`,
        order: updatedOrder,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
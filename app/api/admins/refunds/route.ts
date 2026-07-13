import { NextRequest, NextResponse } from "next/server";

import { OrderService } from "@/app/lib/services/order.service";

import { pusherServer } from "@/app/lib/pusherServer";
import { sendRefundStatusEmail } from "@/app/lib/mailer";

import { requireManageOrders } from "@/app/lib/auth/guards";
import { handleApiError } from "@/app/lib/auth/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RefundAction =
  | "approved"
  | "rejected";

export async function PATCH(
  req: NextRequest
) {
  try {
    await requireManageOrders();

    const body =
      await req.json();

    const action =
      body.action as RefundAction;

    const adminNote =
      body.adminNote?.trim() ??
      "";

    const updatedOrder =
      await OrderService.processOrderRefund(
        body.orderId,
        action,
        adminNote
      );

    if (updatedOrder.userId) {
      try {
        await pusherServer.trigger(
          `user-${updatedOrder.userId}`,
          "order-update",
          {
            orderId:
              updatedOrder.id,

            status:
              updatedOrder.status,

            refundStatus:
              updatedOrder.refundStatus,

            message:
              `Your refund request for order ${updatedOrder.orderNumber} has been ${action}.`,
          }
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
        order: {
          id: updatedOrder.id,
          status:
            updatedOrder.status,
          refundStatus:
            updatedOrder.refundStatus,
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
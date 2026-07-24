import { NextRequest, NextResponse } from "next/server";

import { OrderService } from "@/app/lib/services/order.service";

import {
  sendShipmentNotificationEmail,
  sendDeliveryConfirmationEmail,
} from "@/app/lib/mailer";

import { pusherServer } from "@/app/lib/pusherServer";

import { handleApiError, requireManageOrders } from "@/app/lib/auth/api";
import { badRequest } from "@/app/lib/auth/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  req: NextRequest,
  { params }: Context
) {
  try {
    await requireManageOrders();

    const { id } =
      await params;

    const body =
      await req.json();

    const nextStatus = String(
      body.status ?? ""
    )
      .trim()
      .toUpperCase();

    if (!id) {
      throw badRequest(
        "Order ID is required."
      );
    }

    const result =
      await OrderService.updateAdminOrderStatus(
        id,
        nextStatus
      );

    try {
      if (
        result.previousStatus !==
          "SHIPPED" &&
        nextStatus ===
          "SHIPPED" &&
        result.updatedOrder.email
      ) {
        await sendShipmentNotificationEmail(
          result.updatedOrder
        );
      }

      if (
        result.previousStatus !==
          "DELIVERED" &&
        nextStatus ===
          "DELIVERED" &&
        result.updatedOrder.email
      ) {
        await sendDeliveryConfirmationEmail(
          result.updatedOrder
        );
      }
    } catch (error) {
      console.error(
        "ORDER_EMAIL_ERROR:",
        error
      );
    }

    try {
      if (result.userId) {
        await pusherServer.trigger(
          `user-${result.userId}`,
          "order-update",
          result.updatedOrder
        );
      }
    } catch (error) {
      console.error(
        "PUSHER_ORDER_ERROR:",
        error
      );
    }

    return NextResponse.json(
      {
        success: true,
        order:
          result.updatedOrder,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
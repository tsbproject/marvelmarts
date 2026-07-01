import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/app/lib/prisma";
import {
  sendShipmentNotificationEmail,
  sendDeliveryConfirmationEmail,
} from "@/app/lib/mailer";
import { pusherServer } from "@/app/lib/pusherServer";

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

export async function PATCH(
  req: NextRequest,
  { params }: Context
) {
  try {
    await requireManageOrders();

    const { id } = await params;

    const body = await req.json();

    const nextStatus = String(
      body.status ?? ""
    )
      .trim()
      .toUpperCase();

    if (!id || !nextStatus) {
      throw badRequest(
        "Order ID and status are required."
      );
    }

    const existingOrder =
      await prisma.order.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          status: true,
          total: true,
          vendorProfileId: true,
          userId: true,
          email: true,
          firstName: true,
          orderNumber: true,
        },
      });

    if (!existingOrder) {
      throw notFound(
        "Order not found."
      );
    }

    const previousStatus =
      String(
        existingOrder.status
      ).toUpperCase();

    const updatedOrder =
      await prisma.$transaction(
        async (tx) => {
          const order =
            await tx.order.update({
              where: {
                id,
              },
              data: {
                status: nextStatus,
              },
              include: {
                items: true,
                vendorProfile: {
                  select: {
                    storeName: true,
                  },
                },
              },
            });

          const movingToDelivered =
            previousStatus !==
              "DELIVERED" &&
            nextStatus ===
              "DELIVERED";

          if (
            movingToDelivered &&
            existingOrder.vendorProfileId
          ) {
            await tx.vendorProfile.update({
              where: {
                id: existingOrder.vendorProfileId,
              },
              data: {
                balance: {
                  increment: Number(
                    existingOrder.total
                  ),
                },
              },
            });
          }

          return order;
        }
      );

    try {
      if (
        previousStatus !==
          "SHIPPED" &&
        nextStatus ===
          "SHIPPED" &&
        updatedOrder.email
      ) {
        await sendShipmentNotificationEmail(
          updatedOrder
        );
      }

      if (
        previousStatus !==
          "DELIVERED" &&
        nextStatus ===
          "DELIVERED" &&
        updatedOrder.email
      ) {
        await sendDeliveryConfirmationEmail(
          updatedOrder
        );
      }
    } catch (error) {
      console.error(
        "ORDER_EMAIL_ERROR:",
        error
      );
    }

    try {
      if (existingOrder.userId) {
        await pusherServer.trigger(
          `user-${existingOrder.userId}`,
          "order-update",
          updatedOrder
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
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/app/lib/prisma";

import { requireManageOrders } from "@/app/lib/auth/guards";
import { handleApiError } from "@/app/lib/auth/api";
import {
  badRequest,
  forbidden,
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
    const session =
      await requireManageOrders();

    const { id } = await params;

    const body = await req.json();

    const status = String(
      body.status ?? ""
    )
      .trim()
      .toUpperCase();

    const refundReason =
      body.refundReason?.trim() ??
      "Administrative Reversal";

    if (!status) {
      throw badRequest(
        "Order status is required."
      );
    }

    const order =
      await prisma.order.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          total: true,
          status: true,
          vendorProfileId: true,
        },
      });

    if (!order) {
      throw notFound(
        "Order not found."
      );
    }

    const updateData: {
      status: string;
      refundStatus?: string;
      refundReason?: string;
    } = {
      status,
    };

    if (status === "REFUNDED") {
      if (
        session.user.role !==
        "SUPER_ADMIN"
      ) {
        throw forbidden(
          "Level 2 clearance required for refunds."
        );
      }

      updateData.refundStatus =
        "completed";

      updateData.refundReason =
        refundReason;
    }

    const updatedOrder =
      await prisma.$transaction(
        async (tx) => {
          const result =
            await tx.order.update({
              where: {
                id,
              },
              data: updateData,
            });

          const movingToDelivered =
            status ===
              "DELIVERED" &&
            order.status !==
              "DELIVERED";

          if (
            movingToDelivered &&
            order.vendorProfileId
          ) {
            await tx.vendorProfile.update({
              where: {
                id: order.vendorProfileId,
              },
              data: {
                balance: {
                  increment:
                    Number(
                      order.total
                    ),
                },
              },
            });
          }

          return result;
        }
      );

    return NextResponse.json(
      {
        success: true,
        order: {
          ...updatedOrder,
          total: Number(
            updatedOrder.total
          ),
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
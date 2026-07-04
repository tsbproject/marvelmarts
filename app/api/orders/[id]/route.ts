import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { requireAuth } from "@/app/lib/auth/api";
import { handleApiError } from "@/app/lib/auth/api";
import { badRequest, notFound } from "@/app/lib/auth/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();

    const { id: orderNumber } = await params;

    if (!orderNumber) {
      throw badRequest("Order number is required.");
    }

    const order = await prisma.order.findFirst({
      where: {
        orderNumber,
        userId: session.user.id,
      },
      include: {
        items: true,
        vendorProfile: {
          select: {
            id: true,
            storeName: true,
          },
        },
      },
    });

    if (!order) {
      throw notFound("Order not found.");
    }

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        subtotal: Number(order.subtotal),
        shipping: Number(order.shipping),
        tax: Number(order.tax),
        total: Number(order.total),
        items: order.items.map((item) => ({
          ...item,
          unitPrice: Number(item.unitPrice),
        })),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
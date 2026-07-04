import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { handleApiError } from "@/app/lib/auth/api";
import { badRequest, notFound } from "@/app/lib/auth/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderNumber = searchParams.get("orderNumber")?.trim();

    if (!orderNumber) {
      throw badRequest("Order number is required.");
    }

    const order = await prisma.order.findUnique({
      where: {
        orderNumber,
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
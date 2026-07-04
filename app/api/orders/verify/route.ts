import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { handleApiError } from "@/app/lib/auth/api";
import { badRequest, notFound } from "@/app/lib/auth/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { reference, orderId } = await req.json();

    if (!reference || !orderId) {
      throw badRequest("Reference and orderId are required.");
    }

    const existingOrder = await prisma.order.findUnique({
      where: {
        id: orderId,
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

    if (!existingOrder) {
      throw notFound("Order not found.");
    }

    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const result = await paystackRes.json();

    if (
      !paystackRes.ok ||
      !result.status ||
      result.data?.status !== "success"
    ) {
      throw badRequest("Payment could not be verified.");
    }

    const metadata = result.data?.metadata ?? {};

    if (
      metadata.orderId &&
      metadata.orderId !== existingOrder.id
    ) {
      throw badRequest("Payment reference does not belong to this order.");
    }

    if (
      metadata.orderNumber &&
      metadata.orderNumber !== existingOrder.orderNumber
    ) {
      throw badRequest("Order number mismatch.");
    }

    const expectedAmount = Math.round(
      Number(existingOrder.total) * 100
    );

    if (Number(result.data.amount) !== expectedAmount) {
      throw badRequest("Payment amount mismatch.");
    }

    if (
      existingOrder.email &&
      result.data.customer?.email &&
      existingOrder.email.toLowerCase() !==
        result.data.customer.email.toLowerCase()
    ) {
      throw badRequest("Customer email mismatch.");
    }

    const latestOrder = await prisma.order.findUnique({
      where: {
        id: existingOrder.id,
      },
      select: {
        id: true,
        orderNumber: true,
        paymentStatus: true,
        paymentIntentId: true,
        status: true,
      },
    });

    return NextResponse.json({
      success: true,
      verified: result.data.status === "success",
      order: latestOrder,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
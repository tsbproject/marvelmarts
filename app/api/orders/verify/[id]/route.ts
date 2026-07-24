import { NextResponse } from "next/server";
import { handleApiError } from "@/app/lib/auth/api";
import { badRequest, notFound } from "@/app/lib/auth/errors";
import { OrderService } from "@/app/lib/services/order.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderNumber } = await params;

    if (!orderNumber) {
      throw badRequest("Order number is required.");
    }

    const order =
      await OrderService.getOrderPaymentStatus(
        orderNumber
      );

    if (!order) {
      throw notFound("Order not found.");
    }

    return NextResponse.json({
      success: true,
      paid: order.paymentStatus,
      status: order.status,
      orderNumber: order.orderNumber,
      paymentReference: order.paymentIntentId,
      createdAt: order.createdAt,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { handleApiError } from "@/app/lib/auth/api";
import { badRequest, notFound } from "@/app/lib/auth/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      throw badRequest("Order ID is required.");
    }

    const order = await prisma.order.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        orderNumber: true,
        paymentStatus: true,
        status: true,
        createdAt: true,
        paymentIntentId: true,
      },
    });

    if (!order) {
      throw notFound("Order not found.");
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
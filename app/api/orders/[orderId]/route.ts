import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(
  req: Request,
  // Next.js 16 requires params to be a Promise
  { params }: { params: Promise<{ orderId: string }> } 
) {
  try {
    // 1. Await the params promise
    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID missing" }, { status: 400 });
    }

    // 2. Fetch the order from Neon
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // 3. Convert Decimal fields to regular numbers for the frontend
    const serializedOrder = {
      ...order,
      total: Number(order.total),
      subtotal: Number(order.subtotal),
      shipping: Number(order.shipping),
    };

    return NextResponse.json(serializedOrder);
  } catch (error: any) {
    console.error("API_FETCH_ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
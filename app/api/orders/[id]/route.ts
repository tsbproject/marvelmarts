import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(
  req: Request,
  // Changed orderId to id to match your other routes
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    // 1. Await the params promise
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Order ID missing" }, { status: 400 });
    }

    // 2. Fetch the order from Neon
    const order = await prisma.order.findUnique({
      where: { id: id }, // Use the 'id' variable here
      include: {
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // 3. Convert Decimal fields
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



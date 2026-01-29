import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(
  req: Request,
  // In Next.js 15/16, params is a Promise
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    // 1. You MUST await params in recent Next.js versions
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Order ID missing" }, { status: 400 });
    }

    // 2. Fetch the order
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found in database" }, { status: 404 });
    }

    // 3. Convert Decimal fields to Strings/Numbers for JSON safety
    const safeOrder = {
      ...order,
      total: order.total.toString(),
      subtotal: order.subtotal.toString(),
      shipping: order.shipping.toString(),
    };

    return NextResponse.json(safeOrder);
  } catch (error: any) {
    console.error("DETAILED_SERVER_ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
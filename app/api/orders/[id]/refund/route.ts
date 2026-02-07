import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

// 1. Change 'Request' to 'NextRequest' 
// 2. Change 'params' to a 'Promise'
export async function POST(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    // 3. Await the params (This is the fix)
    const { id: orderId } = await params;

    const session = await getServerSession(authOptions);

    // Auth Guard
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch Order and verify ownership
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden: Not your order" }, { status: 403 });
    }

    // Business Logic Guard
    if (order.status !== "delivered") {
      return NextResponse.json(
        { error: "Only delivered orders can be refunded" }, 
        { status: 400 }
      );
    }

    if (order.refundStatus === "requested" || order.refundStatus === "approved") {
      return NextResponse.json(
        { error: "Refund already requested or processed" }, 
        { status: 400 }
      );
    }

    // Update Database
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        refundStatus: "requested",
      },
    });

    return NextResponse.json({ 
      message: "Refund request submitted", 
      order: updatedOrder 
    });

  } catch (error) {
    console.error("REFUND_ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
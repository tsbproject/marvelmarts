import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const orderId = params.id;

    // 1. Auth Guard
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Fetch Order and verify ownership
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden: Not your order" }, { status: 403 });
    }

    // 3. Business Logic Guard
    // Only allow refund if status is 'delivered' and no refund is currently active
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

    // 4. Update Database
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        refundStatus: "requested",
        // You might want to track the timestamp or reason here too
      },
    });

    // 5. Admin Alert (Optional but recommended for Roadmap point 'h')
    // await createAdminNotification(`New refund request for Order #${orderId.slice(-6)}`);

    return NextResponse.json({ 
      message: "Refund request submitted", 
      order: updatedOrder 
    });

  } catch (error) {
    console.error("REFUND_ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
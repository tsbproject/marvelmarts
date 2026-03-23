


// import { NextRequest, NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/lib/auth"; 
// import { prisma } from "@/app/lib/prisma";
// import { pusherServer } from "@/app/lib/pusherServer";

// type Context = {
//   params: Promise<{ id: string }>;
// };

// export async function PATCH(req: NextRequest, { params }: Context) {
//   try {
//     const { id: orderId } = await params;
//     const session = await getServerSession(authOptions);

//     if (!session?.user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const { reason } = await req.json();

//     if (!reason || reason.trim().length < 10) {
//       return NextResponse.json({ error: "Reason too short (min 10 chars)" }, { status: 400 });
//     }

//     const order = await prisma.order.findUnique({ where: { id: orderId } });

//     if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
//     if (order.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

//     // UPDATE DATABASE - Matching your schema values
//     const updatedOrder = await prisma.order.update({
//       where: { id: orderId },
//       data: {
//         refundStatus: "requested", // Changed from 'pending' to 'requested'
//         refundReason: reason,
//       },
//     });

//     // PUSHER NOTIFICATION
//     try {
//       await pusherServer.trigger("admin-orders", "new-refund-request", {
//         orderId: updatedOrder.id,
//         customerName: session.user.name || "Customer",
//         amount: Number(updatedOrder.total),
//         reason: reason,
//       });
//     } catch (pErr) {
//       console.error("Pusher error (non-critical):", pErr);
//     }

//     return NextResponse.json(updatedOrder);

//   } catch (error: any) {
//     console.error("REFUND_PATCH_ERROR:", error);
//     return NextResponse.json({ error: "Server Error" }, { status: 500 });
//   }
// }





import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { pusherServer } from "@/app/lib/pusherServer";

type Context = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: NextRequest, { params }: Context) {
  try {
    const { id } = await params;
    const orderNumber = id;

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reason } = await req.json();

    if (!reason || reason.trim().length < 10) {
      return NextResponse.json(
        { error: "Reason too short (min 10 chars)" },
        { status: 400 }
      );
    }

    const order = await prisma.order.findFirst({
      where: {
        orderNumber,
        userId: session.user.id,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        refundStatus: "requested",
        refundReason: reason.trim(),
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

    try {
      await pusherServer.trigger("admin-orders", "new-refund-request", {
        id: updatedOrder.id,
        orderId: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        refundStatus: updatedOrder.refundStatus,
        refundReason: updatedOrder.refundReason,
        customerName: session.user.name || "Customer",
        amount: Number(updatedOrder.total),
        status: updatedOrder.status,
        reason: reason.trim(),
      });
    } catch (pErr) {
      console.error("Pusher error (non-critical):", pErr);
    }

    console.log("UPDATED REFUND ORDER:", {
  id: updatedOrder.id,
  orderNumber: updatedOrder.orderNumber,
  refundStatus: updatedOrder.refundStatus,
  refundReason: updatedOrder.refundReason,
});

    const serializedOrder = {
      ...updatedOrder,
      subtotal: Number(updatedOrder.subtotal),
      shipping: Number(updatedOrder.shipping),
      tax: Number(updatedOrder.tax),
      total: Number(updatedOrder.total),
      items: updatedOrder.items.map((item) => ({
        ...item,
        unitPrice: Number(item.unitPrice),
      })),
    };

    return NextResponse.json(serializedOrder);
  } catch (error: any) {
    console.error("REFUND_PATCH_ERROR:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
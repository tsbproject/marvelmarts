import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { NextResponse, NextRequest } from "next/server";

type Context = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: NextRequest, context: Context) {
  const session = await getServerSession(authOptions);
  const { id } = await context.params;

  // Security Gate
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { status, refundReason } = body;

    // Normalize status to uppercase for consistency with Vendor Dashboard
    const normalizedStatus = status.toUpperCase();

    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch current order to get total and vendorId
      const order = await tx.order.findUnique({
        where: { id },
        select: { total: true, vendorProfileId: true, status: true }
      });

      if (!order) throw new Error("Order not found");

      // 2. Prepare update data
      const updateData: any = { status: normalizedStatus };

      if (normalizedStatus === "REFUNDED") {
        if (session.user.role !== "SUPER_ADMIN") {
          throw new Error("Level 2 clearance required for refunds");
        }
        updateData.refundStatus = "completed";
        updateData.refundReason = refundReason || "Administrative Reversal";
      }

      // 3. Update the Order
      const updatedOrder = await tx.order.update({
        where: { id },
        data: updateData
      });

      // 4. BALANCE LOGIC: If status changed to DELIVERED, pay the vendor
      // We check if the previous status wasn't already DELIVERED to prevent double-paying
      if (normalizedStatus === "DELIVERED" && order.status !== "DELIVERED" && order.vendorProfileId) {
        await tx.vendorProfile.update({
          where: { userId: order.vendorProfileId },
          data: {
            balance: {
              increment: order.total // Adds order total to vendor's current balance
            }
          }
        });
      }

      return updatedOrder;
    });

    // TACTICAL SERIALIZATION
    const serializedOrder = {
      ...result,
      total: Number(result.total || 0),
    };

    return NextResponse.json(serializedOrder);
  } catch (error: any) {
    console.error("API Update Error:", error);
    const message = error.message === "Level 2 clearance required for refunds" 
      ? error.message 
      : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: error.message.includes("clearance") ? 403 : 500 });
  }
}




// import { prisma } from "@/app/lib/prisma";
// import { NextResponse } from "next/server";
// import { sendAdminOrderNotification } from "@/app/lib/mailer";
// import { pusherServer } from "@/app/lib/pusherServer";

// export async function PATCH(
//   req: Request,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const resolvedParams = await params;
//     const id = resolvedParams.id;

//     const body = await req.json();
//     const { status, userId } = body;

//     if (!id || !status) {
//       return NextResponse.json(
//         { error: "Missing Order ID or Status" },
//         { status: 400 }
//       );
//     }

//     const existingOrder = await prisma.order.findUnique({
//       where: { id },
//       select: {
//         id: true,
//         status: true,
//         total: true,
//         vendorProfileId: true,
//         email: true,
//         firstName: true,
//         orderNumber: true,
//         userId: true,
//       },
//     });

//     if (!existingOrder) {
//       return NextResponse.json({ error: "Order not found" }, { status: 404 });
//     }

//     const updatedOrder = await prisma.$transaction(async (tx) => {
//       const order = await tx.order.update({
//         where: { id },
//         data: { status },
//       });

//       const isMovingToDelivered =
//         existingOrder.status !== "DELIVERED" && status === "DELIVERED";

//       if (isMovingToDelivered && existingOrder.vendorProfileId) {
//         const vendorAmount = Number(existingOrder.total || 0);

//         await tx.vendorProfile.update({
//           where: { id: existingOrder.vendorProfileId },
//           data: {
//             balance: {
//               increment: vendorAmount,
//             },
//           },
//         });
//       }

//       return order;
//     });

//     if (status === "SHIPPED") {
//       try {
//         await sendAdminOrderNotification({
//           to: updatedOrder.email,
//           subject: `Your MarvelMarts Order is on the move!`,
//           html: `<h1>Good news, ${updatedOrder.firstName}!</h1><p>Your order #${updatedOrder.orderNumber} has been shipped.</p>`,
//         });
//       } catch (mailError) {
//         console.error("Email failed but order updated:", mailError);
//       }
//     }

//     try {
//       await pusherServer.trigger(
//         `user-${userId || existingOrder.userId}`,
//         "order-update",
//         updatedOrder
//       );
//     } catch (pusherError) {
//       console.error("Pusher trigger failed:", pusherError);
//     }

//     return NextResponse.json(updatedOrder);
//   } catch (error: any) {
//     console.error("PATCH Error:", error);
//     return NextResponse.json(
//       { error: error.message || "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }
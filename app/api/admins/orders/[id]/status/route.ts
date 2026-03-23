// import { prisma } from "@/app/lib/prisma";
// import { NextResponse } from "next/server";
// import { sendAdminOrderNotification } from "@/app/lib/mailer";
// import {
//   sendShipmentNotificationEmail,
//   sendDeliveryConfirmationEmail,
// } from "@/app/lib/mailer";
// import { pusherServer } from "@/app/lib/pusherServer";
 

// export async function PATCH(
//   req: Request,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const resolvedParams = await params;
//     const id = resolvedParams.id;

//     const body = await req.json();
//     const { status } = body;

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
//         userId: true,
//         email: true,
//         firstName: true,
//         orderNumber: true,
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
//         `user-${existingOrder.userId}`,
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




import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import {
  sendShipmentNotificationEmail,
  sendDeliveryConfirmationEmail,
} from "@/app/lib/mailer";
import { pusherServer } from "@/app/lib/pusherServer";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const body = await req.json();
    const nextStatus = String(body?.status || "").toUpperCase().trim();

    if (!id || !nextStatus) {
      return NextResponse.json(
        { error: "Missing Order ID or Status" },
        { status: 400 }
      );
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        total: true,
        vendorProfileId: true,
        userId: true,
        email: true,
        firstName: true,
        orderNumber: true,
      },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const previousStatus = String(existingOrder.status || "").toUpperCase();

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id },
        data: { status: nextStatus },
        include: {
          items: true,
          vendorProfile: {
            select: {
              storeName: true,
            },
          },
        },
      });

      const isMovingToDelivered =
        previousStatus !== "DELIVERED" && nextStatus === "DELIVERED";

      if (isMovingToDelivered && existingOrder.vendorProfileId) {
        const vendorAmount = Number(existingOrder.total || 0);

        await tx.vendorProfile.update({
          where: { id: existingOrder.vendorProfileId },
          data: {
            balance: {
              increment: vendorAmount,
            },
          },
        });
      }

      return order;
    });

    try {
      if (
        previousStatus !== "SHIPPED" &&
        nextStatus === "SHIPPED" &&
        updatedOrder.email
      ) {
        await sendShipmentNotificationEmail(updatedOrder);
      }

      if (
        previousStatus !== "DELIVERED" &&
        nextStatus === "DELIVERED" &&
        updatedOrder.email
      ) {
        await sendDeliveryConfirmationEmail(updatedOrder);
      }
    } catch (mailError) {
      console.error("Order email failed but order updated:", mailError);
    }

    try {
      if (existingOrder.userId) {
        await pusherServer.trigger(
          `user-${existingOrder.userId}`,
          "order-update",
          updatedOrder
        );
      }
    } catch (pusherError) {
      console.error("Pusher trigger failed:", pusherError);
    }

    return NextResponse.json(updatedOrder);
  } catch (error: any) {
    console.error("PATCH Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
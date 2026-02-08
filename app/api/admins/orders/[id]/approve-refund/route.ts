// // app/api/admin/orders/[id]/approve-refund/route.ts
// import { prisma } from "@/app/lib/prisma";
// import { pusherServer } from "@/app/lib/pusherServer";
// import { NextResponse } from "next/server";

// export async function PATCH(
//   req: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const orderId = params.id;

//     // 1. Update Order in Database
//     const updatedOrder = await prisma.order.update({
//       where: { id: orderId },
//       data: {
//         refundStatus: "approved",
//         status: "refunded", // Optional: update general status too
//       },
//     });

//     // 2. Trigger Pusher Sync
//     // This is what makes it appear on Tayo's screen instantly
//     await pusherServer.trigger(
//       `user-${updatedOrder.userId}`, 
//       "order-update", 
//       updatedOrder
//     );

//     return NextResponse.json(updatedOrder);
//   } catch (error) {
//     return NextResponse.json({ error: "Approval failed" }, { status: 500 });
//   }
// }






// app/api/admin/orders/[id]/approve-refund/route.ts
import { prisma } from "@/app/lib/prisma";
import { pusherServer } from "@/app/lib/pusherServer";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { action } = await req.json(); // "approved" or "rejected"
    const orderId = params.id;

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        refundStatus: action,
        // Only set status to 'refunded' if approved
        ...(action === "approved" && { status: "refunded" })
      },
    });

    // Notify Customer via Pusher
    await pusherServer.trigger(
      `user-${updatedOrder.userId}`, 
      "order-update", 
      updatedOrder
    );

    return NextResponse.json(updatedOrder);
  } catch (error) {
    return NextResponse.json({ error: "Action failed" }, { status: 500 });
  }
}
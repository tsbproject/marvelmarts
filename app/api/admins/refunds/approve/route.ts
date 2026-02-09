// // app/api/admin/refunds/approve/route.ts
// import { prisma } from "@/app/lib/prisma";
// import { pusherServer } from "@/app/lib/pusherServer";
// import { NextResponse } from "next/server";

// export async function PATCH(req: Request) {
//   try {
//     const { orderId } = await req.json();

//     // 1. Update the order in the database
//     const updatedOrder = await prisma.order.update({
//       where: { id: orderId },
//       data: { 
//         status: "refunded",
//         refundStatus: "approved" 
//       },
//       include: { items: true } // Include items so the frontend gets the full object
//     });

//     // 2. Trigger Pusher to update the Customer's UI instantly
//     await pusherServer.trigger(
//       `user-${updatedOrder.userId}`, 
//       "order-update", 
//       updatedOrder
//     );

//     return NextResponse.json({ 
//       success: true, 
//       message: "Refund approved and customer notified." 
//     });
//   } catch (error) {
//     console.error("Refund Approval Error:", error);
//     return NextResponse.json({ error: "Failed to approve refund" }, { status: 500 });
//   }
// }




import { prisma } from "@/app/lib/prisma";
import { pusherServer } from "@/app/lib/pusherServer";
import { sendRefundStatusEmail } from "@/app/lib/mailer";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  try {
    const { orderId, action, adminNote } = await req.json();

    // 1. Validate the action
    if (!['approved', 'rejected'].includes(action)) {
      return NextResponse.json({ error: "Invalid action. Use 'approved' or 'rejected'" }, { status: 400 });
    }

    // 2. Update the order in the database
    // Approved -> status: "refunded", refundStatus: "approved"
    // Rejected -> status: remains original, refundStatus: "rejected"
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { 
        status: action === "approved" ? "refunded" : undefined, 
        refundStatus: action,
        // We can store the admin note in the refundReason or a dedicated field if you have one
        cancelReason: action === "rejected" ? adminNote : undefined, 
      },
      include: { items: true } 
    });

    // 3. Trigger Pusher to update the Customer's UI instantly
    try {
      await pusherServer.trigger(
        `user-${updatedOrder.userId}`, 
        "order-update", 
        updatedOrder
      );
    } catch (pErr) {
      console.error("Pusher update failed:", pErr);
    }

    // 4. Send Branded MarvelMarts Email
    try {
      await sendRefundStatusEmail(
        updatedOrder, 
        action as 'approved' | 'rejected', 
        adminNote
      );
    } catch (mailErr) {
      console.error("Email dispatch failed:", mailErr);
    }

    return NextResponse.json({ 
      success: true, 
      message: `Refund ${action} and customer notified.`,
      order: updatedOrder
    });

  } catch (error) {
    console.error("Refund Action Error:", error);
    return NextResponse.json({ error: "Failed to process refund action" }, { status: 500 });
  }
}
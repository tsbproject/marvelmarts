// import { prisma } from "@/app/lib/prisma";
// import { pusherServer } from "@/app/lib/pusherServer";
// import { NextRequest, NextResponse } from "next/server";

// // Define the context type for Next.js 15+ 
// type Context = {
//   params: Promise<{ id: string }>;
// };

// export async function PATCH(req: NextRequest, context: Context) {
//   // 1. Await params to prevent Build Error
//   const { id } = await context.params;

//   try {
//     // 2. Get the action from the body ("approved" or "rejected")
//     const { action } = await req.json(); 

//     if (!action || !["approved", "rejected"].includes(action)) {
//       return NextResponse.json({ error: "Invalid action" }, { status: 400 });
//     }

//     // 3. Update Order in Database
//     const updatedOrder = await prisma.order.update({
//       where: { id: id },
//       data: {
//         refundStatus: action,
//         // Only set the main order status to 'refunded' if it was approved
//         ...(action === "approved" && { status: "refunded" }),
//       },
//     });

//     // 4. Trigger Pusher Sync
//     // This makes the update appear on the customer's screen instantly
//     await pusherServer.trigger(
//       `user-${updatedOrder.userId}`, 
//       "order-update", 
//       updatedOrder
//     );

//     return NextResponse.json(updatedOrder);
//   } catch (error) {
//     console.error("MarvelMarts Refund Process Error:", error);
//     return NextResponse.json({ error: "Action failed" }, { status: 500 });
//   }
// }





import { prisma } from "@/app/lib/prisma";
import { pusherServer } from "@/app/lib/pusherServer";
import { sendRefundStatusEmail } from "@/app/lib/mailer"; // Ensure this import path is correct
import { NextRequest, NextResponse } from "next/server";

type Context = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: NextRequest, context: Context) {
  const { id } = await context.params;

  try {
    // 1. Capture both the action AND the reason from the request body
    const { action, adminNote } = await req.json(); 

    if (!action || !["approved", "rejected"].includes(action)) {
      return NextResponse.json({ error: "Invalid protocol action" }, { status: 400 });
    }

    // 2. Update Database with the decision and the justification
    const updatedOrder = await prisma.order.update({
      where: { id: id },
      data: {
        refundStatus: action,
        // We save the reason in cancelReason to ensure visibility in the UI
        cancelReason: adminNote || "Administrative decision",
        // Only set the main order status to 'refunded' if it was approved
        ...(action === "approved" && { status: "refunded" }),
      },
      include: { items: true } // Include items for the email template
    });

    // 3. Trigger Real-time Pusher Sync
    if (updatedOrder.userId) {
      await pusherServer.trigger(
        `user-${updatedOrder.userId}`, 
        "order-update", 
        updatedOrder
      ).catch(err => console.error("Pusher Sync Failed:", err));
    }

    // 4. Dispatch the Branded Email
    // This uses the template we built to notify the customer of the result
    try {
      await sendRefundStatusEmail(
        updatedOrder, 
        action as 'approved' | 'rejected', 
        adminNote
      );
    } catch (mailErr) {
      console.error("Email Dispatch Failed:", mailErr);
    }

    return NextResponse.json({
      success: true,
      message: `Protocol ${action.toUpperCase()} successfully executed.`,
      order: updatedOrder
    });

  } catch (error) {
    console.error("MarvelMarts Refund Process Error:", error);
    return NextResponse.json({ error: "Critical System Failure" }, { status: 500 });
  }
}
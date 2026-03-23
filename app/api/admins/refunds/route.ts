// import { prisma } from "@/app/lib/prisma";
// import { pusherServer } from "@/app/lib/pusherServer";
// import { sendRefundStatusEmail } from "@/app/lib/mailer";
// import { NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/lib/auth";

// export async function PATCH(req: Request) {
//   try {
//     const session = await getServerSession(authOptions);

//     // 1. Robust Authorization Check
//     const userRole = (session?.user as any)?.role?.toUpperCase();
//     const isAuthorized = userRole === "ADMIN" || userRole === "SUPER_ADMIN";

//     if (!session?.user || !isAuthorized) {
//       console.warn(`Unauthorized refund attempt by: ${session?.user?.email || 'Unknown'}`);
//       return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 401 });
//     }

//     const { orderId, action, adminNote } = await req.json();

//     // 2. Validation
//     if (!orderId || !['approved', 'rejected'].includes(action)) {
//       return NextResponse.json({ error: "Missing Order ID or invalid action type" }, { status: 400 });
//     }

//     // 3. Database Update
//     // Using cancelReason (@db.Text) as per your schema to store the admin note
//     const updatedOrder = await prisma.order.update({
//       where: { id: orderId },
//       data: { 
//         status: action === "approved" ? "refunded" : undefined, 
//         refundStatus: action, 
//         cancelReason: adminNote, 
//       },
//       include: { items: true } 
//     });

//     // 4. Real-time Update (Pusher)
//     if (updatedOrder.userId) {
//       try {
//         await pusherServer.trigger(
//           `user-${updatedOrder.userId}`, 
//           "order-update", 
//           updatedOrder
//         );
//       } catch (pErr) {
//         console.error("Pusher Sync Failed:", pErr);
//       }
//     }

//     // 5. Branded Email Notification
//     try {
//       await sendRefundStatusEmail(
//         updatedOrder, 
//         action as 'approved' | 'rejected', 
//         adminNote
//       );
//     } catch (mailErr) {
//       console.error("Email Dispatch Failed:", mailErr);
//     }

//     return NextResponse.json({ 
//       success: true, 
//       message: `Refund ${action} successfully.`,
//       order: updatedOrder
//     });

//   } catch (error) {
//     console.error("ADMINS_REFUND_PATCH_ERROR:", error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }




import { prisma } from "@/app/lib/prisma";
import { pusherServer } from "@/app/lib/pusherServer";
import { sendRefundStatusEmail } from "@/app/lib/mailer";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // 1. Robust Authorization Check
    const userRole = (session?.user as any)?.role?.toUpperCase();
    const isAuthorized = userRole === "ADMIN" || userRole === "SUPER_ADMIN";

    if (!session?.user || !isAuthorized) {
      console.warn(`Unauthorized refund attempt by: ${session?.user?.email || 'Unknown'}`);
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 401 });
    }

    const { orderId, action, adminNote } = await req.json();

    // 2. Validation
    if (!orderId || !['approved', 'rejected'].includes(action)) {
      return NextResponse.json({ error: "Missing Order ID or invalid action type" }, { status: 400 });
    }

    // Fetch current order to prevent re-processing and handle status logic
    const currentOrder = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!currentOrder) {
      return NextResponse.json({ error: "Order not found in MarvelMarts Vault" }, { status: 404 });
    }

    // 3. Database Update
    // Logic: If approved, status becomes 'refunded'. If rejected, status stays as is.
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { 
        status: action === "approved" ? "refunded" : currentOrder.status, 
        refundStatus: action, 
        cancelReason: adminNote || (action === "approved" ? "Authorized by Admin" : "Declined by Admin"), 
      },
      include: { items: true } 
    });

    // 4. Real-time Update (Pusher)
    if (updatedOrder.userId) {
      try {
        // Notify the user-specific channel for instant UI updates
        await pusherServer.trigger(
          `user-${updatedOrder.userId}`, 
          "order-update", 
          {
            orderId: updatedOrder.id,
            status: updatedOrder.status,
            refundStatus: updatedOrder.refundStatus,
            message: `Your refund request for order ${updatedOrder.orderNumber} has been ${action}.`
          }
        );
      } catch (pErr) {
        console.error("Pusher Sync Failed:", pErr);
      }
    }

    // 5. Branded Email Notification
    try {
      // Logic inside mailer should handle the 'approved' vs 'rejected' template
      await sendRefundStatusEmail(
        updatedOrder, 
        action as 'approved' | 'rejected', 
        adminNote
      );
    } catch (mailErr) {
      console.error("Email Dispatch Failed:", mailErr);
      // We don't return error here because the DB update was successful
    }

    return NextResponse.json({ 
      success: true, 
      message: `Protocol executed: Refund ${action} successfully.`,
      order: {
        id: updatedOrder.id,
        status: updatedOrder.status,
        refundStatus: updatedOrder.refundStatus
      }
    });

  } catch (error) {
    console.error("ADMINS_REFUND_PATCH_ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/app/lib/prisma";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/lib/auth";
// import { pusherServer } from "@/app/lib/pusherServer";

// /**
//  * PATCH: Handle Payout Approval and Rejection
//  * Merged logic as per user instructions
//  */
// export async function PATCH(
//   req: NextRequest,
//   { params }: { params: Promise<{ id: string }> } // Awaitable params for Next.js 15
// ) {
//   try {
//     const session = await getServerSession(authOptions);
//     const { id: requestId } = await params; // Await the promise

//     // 1. Authorization Guard
//     if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const { status, remarks } = await req.json(); // status: "APPROVED" | "REJECTED"

//     if (!requestId || !status) {
//       return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
//     }

//     // 2. Database Transaction for Financial Integrity
//     const result = await prisma.$transaction(async (tx) => {
//       const payout = await tx.payout.findUnique({
//         where: { id: requestId },
//       });

//       if (!payout) throw new Error("Payout record not found");
//       if (payout.status !== "PENDING") throw new Error("Payout already processed");

//       // Update Payout Status
//       const updatedPayout = await tx.payout.update({
//         where: { id: requestId },
//         data: { 
//           status: status,
//           adminRemarks: remarks || (status === "APPROVED" ? "Processed by Admin" : "Rejected by Admin"),
//           processedAt: new Date()
//         }
//       });

//       // Refund logic if rejected - Using 'vendorProfileId' as per instructions
//       if (status === "REJECTED") {
//         await tx.vendorProfile.update({
//           where: { id: payout.vendorProfileId },
//           data: { balance: { increment: payout.amount } }
//         });
//       }

//       return { updatedPayout, vendorId: payout.vendorId };
//     });

//     // 3. Real-time Notification (Pusher)
//     try {
//       await pusherServer.trigger(
//         `vendor-${result.vendorId}`,
//         "payout-updated", 
//         {
//           status: status,
//           amount: result.updatedPayout.amount,
//           remarks: remarks || "Processed"
//         }
//       );
//     } catch (pusherError) {
//       console.error("Pusher Trigger Error:", pusherError);
//     }

//     return NextResponse.json({ 
//       success: true, 
//       message: `Payout request has been ${status.toLowerCase()}.`,
//       payout: result.updatedPayout
//     });

//   } catch (error: any) {
//     console.error("ADMIN_PAYOUT_PATCH_ERROR:", error);
//     return NextResponse.json({ error: error.message || "Failed to process payout" }, { status: 500 });
//   }
// }

// /**
//  * GET: Fetch all payout requests for Admin Dashboard
//  */
// export async function GET() {
//   try {
//     const session = await getServerSession(authOptions);
//     if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const payouts = await prisma.payout.findMany({
//       include: {
//         vendor: { select: { name: true } }
//       },
//       orderBy: { createdAt: 'desc' }
//     });

//     const formattedPayouts = payouts.map(p => ({
//       id: p.id,
//       name: p.accountName || p.vendor?.name || "Unknown Vendor",
//       amount: p.amount,
//       status: p.status,
//       createdAt: p.createdAt.toISOString()
//     }));

//     return NextResponse.json({ payouts: formattedPayouts });
//   } catch (error: any) {
//     console.error("ADMIN_PAYOUT_GET_ERROR:", error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }




import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { pusherServer } from "@/app/lib/pusherServer";
import { sendPayoutStatusEmail } from "@/app/lib/mailer";

/**
 * PATCH: Process a specific payout request (Approve/Reject)
 * Requirement: Next.js 15 requires awaiting params
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // 1. Await params for Next.js 15 compliance
    const { id: requestId } = await context.params;

    // 2. Authorization Guard
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { status, remarks } = body; // status: "APPROVED" | "REJECTED"

    if (!requestId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 3. Database Transaction (Financial Integrity)
    const result = await prisma.$transaction(async (tx) => {
      const payout = await tx.payout.findUnique({
        where: { id: requestId },
        include: {
          vendor: { select: { id: true, name: true, email: true } }
        }
      });

      if (!payout) throw new Error("Payout record not found");
      if (payout.status !== "PENDING") throw new Error("Payout already processed");

      // Update Payout Status
      const updatedPayout = await tx.payout.update({
        where: { id: requestId },
        data: { 
          status: status,
          adminRemarks: remarks || (status === "APPROVED" ? "Processed by Admin" : "Rejected by Admin"),
          processedAt: new Date()
        },
        include: {
          vendor: { select: { id: true, name: true, email: true } }
        }
      });

      // Refund logic if rejected - Using 'vendorProfileId' as per saved instructions
      let newBalance = null;
      if (status === "REJECTED") {
        const updatedProfile = await tx.vendorProfile.update({
          where: { id: payout.vendorProfileId },
          data: { balance: { increment: payout.amount } }
        });
        newBalance = updatedProfile.balance;
      }

      return { updatedPayout, newBalance, vendorId: payout.vendorId };
    });

    const { updatedPayout, newBalance } = result;

    // 4. Real-time Notification via Pusher
    try {
      await pusherServer.trigger(
        `vendor-${result.vendorId}`,
        "payout-updated", 
        {
          status: status,
          amount: updatedPayout.amount,
          newBalance: newBalance,
          requestId: updatedPayout.id,
          remarks: remarks || "Processed"
        }
      );
    } catch (pusherError) {
      console.error("Pusher Trigger Error:", pusherError);
    }

    // 5. Email Notification using central mailer
    if (updatedPayout.vendor?.email) {
      try {
        await sendPayoutStatusEmail(
          updatedPayout.vendor.email,
          updatedPayout.vendor.name || "Vendor",
          updatedPayout.amount,
          status,
          remarks
        );
      } catch (emailErr) {
        console.error("Email Notification Failed:", emailErr);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Payout request has been ${status.toLowerCase()}.`,
      payout: updatedPayout
    });

  } catch (error: any) {
    console.error("ADMIN_PAYOUT_PATCH_ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process payout" }, 
      { status: 500 }
    );
  }
}
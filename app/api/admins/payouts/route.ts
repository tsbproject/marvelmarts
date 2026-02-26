// import { NextResponse } from "next/server";
// import { prisma } from "@/app/lib/prisma";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/lib/auth";
// import { sendPayoutStatusEmail } from "@/app/lib/mailer";
// import { pusherServer } from "@/app/lib/pusherServer"; 

// export async function PATCH(
//   req: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (session?.user?.role !== "ADMIN") {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const requestId = params.id;
//     const { status, remarks } = await req.json();

//     const result = await prisma.$transaction(async (tx) => {
//       // 1. Update Payout Record
//       const updatedPayout = await tx.payout.update({
//         where: { id: requestId },
//         data: { 
//           status, 
//           adminRemarks: remarks,
//           processedAt: new Date()
//         },
//         include: {
//           vendor: { select: { id: true, name: true, email: true } }
//         }
//       });

//       // 2. Refund Logic: If REJECTED, put money back in vendor's balance
//       let newBalance = null;
//       if (status === "REJECTED") {
//         const updatedUser = await tx.user.update({
//           where: { id: updatedPayout.vendorId },
//           data: { balance: { increment: updatedPayout.amount } }
//         });
//         newBalance = updatedUser.balance;
//       }

//       return { updatedPayout, newBalance };
//     });

//     const { updatedPayout, newBalance } = result;

//     // 3. Real-time Update via Pusher
//     // This tells the Vendor's browser to update their balance and history table
//     await pusherServer.trigger(`vendor-${updatedPayout.vendorId}`, "payout-updated", {
//       status,
//       amount: updatedPayout.amount,
//       newBalance: newBalance, // Only present if rejected
//       requestId: updatedPayout.id,
//       message: `Your payout request has been ${status.toLowerCase()}.`
//     });

//     // 4. Send Email Notification
//     if (updatedPayout.vendor?.email) {
//       try {
//         await sendPayoutStatusEmail(
//           updatedPayout.vendor.email,
//           updatedPayout.vendor.name || "Vendor",
//           updatedPayout.amount,
//           status,
//           remarks
//         );
//       } catch (err) {
//         console.error("Email failed:", err);
//       }
//     }

//     return NextResponse.json({ success: true, payout: updatedPayout });

//   } catch (error: any) {
//     console.error("PAYOUT_ACTION_ERROR:", error);
//     return NextResponse.json({ error: "Failed to process payout" }, { status: 500 });
//   }
// }

// export async function GET() {
//   try {
//     const payouts = await prisma.payout.findMany({
//       // Adding a filter here ensures the Admin Approval page only shows PENDING
//       // while the History table can show everything else
//       include: {
//         vendor: {
//           select: { name: true }
//         }
//       },
//       orderBy: { createdAt: 'desc' }
//     });

//     const formattedPayouts = payouts.map(p => ({
//       id: p.id,
//       vendorProfileId: (p as any).vendorProfileId, 
//       vendorName: p.vendor?.name || "Unknown Vendor",
//       amount: p.amount,
//       status: p.status,

//       accountName: (p as any).accountName,
//       accountNumber: (p as any).accountNumber,
//       bankName: (p as any).bankName,
//       createdAt: p.createdAt.toISOString(),
   
//     }));

//     // FIX: Return an object with the 'payouts' key
//     return NextResponse.json({ payouts: formattedPayouts }); 

//   } catch (error: any) {
//     console.error("GET_PAYOUTS_ERROR:", error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }





import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payouts = await prisma.payout.findMany({
      include: {
        vendor: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedPayouts = payouts.map(p => ({
      id: p.id,
      vendorProfileId: (p as any).vendorProfileId, 
      vendorName: p.vendor?.name || "Unknown Vendor",
      amount: p.amount,
      status: p.status,
      accountName: (p as any).accountName,
      accountNumber: (p as any).accountNumber,
      bankName: (p as any).bankName,
      createdAt: p.createdAt.toISOString(),
    }));

    return NextResponse.json({ payouts: formattedPayouts }); 

  } catch (error: any) {
    console.error("GET_PAYOUTS_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
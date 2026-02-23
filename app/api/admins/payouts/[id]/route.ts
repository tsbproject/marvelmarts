import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { pusherServer } from "@/app/lib/pusherServer"; 
export async function PATCH(
  req: Request, 
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // 1. Authorization Guard
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requestId = params.id;
    const { status, remarks } = await req.json(); // status: "APPROVED" | "REJECTED"

    if (!requestId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 2. Database Transaction for Financial Integrity
    const result = await prisma.$transaction(async (tx) => {
      const payout = await tx.payout.findUnique({
        where: { id: requestId },
        include: { vendor: true } // Fetch vendor for Pusher channel ID
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
        }
      });

      // Refund logic if rejected
      if (status === "REJECTED") {
        await tx.vendorProfile.update({
          where: { id: payout.vendorProfileId },
          data: { balance: { increment: payout.amount } }
        });
      }

      return { updatedPayout, vendorId: payout.vendorId };
    });

    // 3. Real-time Notification (Pusher)
    // We trigger this AFTER the transaction is successful
    try {
      await pusherServer.trigger(
        `vendor-${result.vendorId}`, // Unique channel for Tayo
        "payout-updated", 
        {
          status: status,
          amount: result.updatedPayout.amount,
          remarks: remarks || "Processed"
        }
      );
    } catch (pusherError) {
      console.error("Pusher Trigger Error:", pusherError);
      // We don't return error here because the DB update already succeeded
    }

    return NextResponse.json({ 
      success: true, 
      message: `Payout request has been ${status.toLowerCase()}.`,
      payout: result.updatedPayout
    });

  } catch (error: any) {
    console.error("ADMIN_PAYOUT_PATCH_ERROR:", error);
    return NextResponse.json({ error: error.message || "Failed to process payout" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
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
      name: p.accountName || p.vendor?.name || "Unknown Vendor",
      amount: p.amount,
      status: p.status,
      createdAt: p.createdAt.toISOString()
    }));

    return NextResponse.json({ payouts: formattedPayouts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
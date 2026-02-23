import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { amount, bankName, accountNumber, accountName } = body;

    // 1. Basic validation
    if (!amount || amount <= 0) {
      return NextResponse.json({ message: "Invalid amount" }, { status: 400 });
    }

    // 2. Run as a Transaction to prevent money glitches
    const result = await prisma.$transaction(async (tx) => {
      // Find the vendor profile and check balance
      const profile = await tx.vendorProfile.findUnique({
        where: { userId: session.user.id },
      });

      if (!amount || amount <= 0) {
  return NextResponse.json({ message: "Invalid amount" }, { status: 400 });
        }

        // Ensure bank details are present before proceeding
        if (!bankName || !accountNumber || !accountName) {
          return NextResponse.json({ message: "Missing settlement bank details" }, { status: 400 });
        }

      if (!profile) throw new Error("Vendor profile not found");
      if (profile.balance < amount) throw new Error("Insufficient balance");

      // 3. Create the Payout with the correct relation syntax
      const payout = await tx.payout.create({
        data: {
          amount,
          status: "PENDING",
          bankName,
          accountNumber,
          accountName,
          // Fixed the 'Argument vendorProfile is missing' error here
          vendorProfile: {
            connect: { id: profile.id }
          },
          vendor: {
            connect: { id: session.user.id }
          },
        },
      });

      // 4. Deduct the amount from vendor's balance immediately
      await tx.vendorProfile.update({
        where: { id: profile.id },
        data: {
          balance: { decrement: amount },
        },
      });

      return payout;
    });

    return NextResponse.json({
      message: "Payout request submitted successfully",
      payout: result,
    });

  } catch (error: any) {
    console.error("PAYOUT_ERROR:", error);
    return NextResponse.json(
      { message: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}



export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const payouts = await prisma.payout.findMany({
      where: { vendorId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ payouts });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
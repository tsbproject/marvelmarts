import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { amount } = await req.json();
    const withdrawAmount = Number(amount);

    // 1. Get Vendor Profile & Verify Balance
    const vendor = await prisma.vendorProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (!vendor) return NextResponse.json({ error: "Vendor profile not found" }, { status: 404 });
    
    if (vendor.isSuspended) {
      return NextResponse.json({ error: "Account suspended. Withdrawals locked." }, { status: 403 });
    }

    if (withdrawAmount > Number(vendor.balance)) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }

    // 2. Atomic Transaction: Create Withdrawal & Deduct Balance
    const result = await prisma.$transaction([
      prisma.withdrawal.create({
        data: {
          vendorProfileId: vendor.id,
          amount: withdrawAmount,
          status: "PENDING",
        }
      }),
      prisma.vendorProfile.update({
        where: { id: vendor.id },
        data: { balance: { decrement: withdrawAmount } }
      })
    ]);

    return NextResponse.json({ message: "Withdrawal initiated", data: result[0] }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
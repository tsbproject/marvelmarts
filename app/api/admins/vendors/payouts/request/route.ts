import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma"; 
import { getServerSession } from "next-auth";

export async function POST(req: Request) {
  try {
    const { amount, vendorProfileId } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    

    // 1. Check Vendor Balance logic here
    const vendor = await prisma.user.findUnique({ where: { id: vendorProfileId } });
    
    if (!vendor) {
      return NextResponse.json({ error: "Vendor account not found" }, { status: 404 });
    }

    if (vendor.balance < amount) return NextResponse.json({ error: "Insufficient funds" }, { status: 400 });

    // 2. Create the Payout record (Status: PENDING)
    const payout = await prisma.payout.create({
      data: {
        amount,
        status: "PENDING",
        reference: `PAY-${Date.now()}`,
        // connect the required relations instead of the raw id field
        vendor: { connect: { id: vendorProfileId } },
        vendorProfile: { connect: { id: vendorProfileId } },
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Payout request submitted successfully." 
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
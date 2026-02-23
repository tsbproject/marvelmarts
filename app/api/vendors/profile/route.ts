import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const vendor = await prisma.vendorProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!vendor) return NextResponse.json({ message: "Not Found" }, { status: 404 });

    return NextResponse.json({
      profile: vendor,
      balance: Number(vendor.balance || 0),
      lastSyncedAt: vendor.lastSyncedAt,
      onboarding: {
        profileDone: !!vendor.storeName,
        storeDone: !!vendor.bankName,
        productDone: true, // You can link this to a product count if you want
      }
    });
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
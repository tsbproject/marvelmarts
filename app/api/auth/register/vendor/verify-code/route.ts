import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();
    if (!email || !code) {
      return NextResponse.json({ success: false, error: "Email and code are required" }, { status: 400 });
    }

    const vCode = await prisma.vendorVerification.findFirst({
      where: {
        email,
        code,
        used: false,
        expiresAt: { gte: new Date() },
      },
    });

    if (!vCode) {
      return NextResponse.json({ success: false, error: "Invalid or expired verification code" }, { status: 400 });
    }

    // Mark as used
    await prisma.vendorVerification.update({
      where: { id: vCode.id },
      data: { used: true },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

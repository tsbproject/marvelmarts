import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { VerificationType } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const { uid, code } = await req.json();

    // 1. Find the code record
    const verification = await prisma.verificationCode.findFirst({
      where: {
        id: uid,
        code: code.toUpperCase(),
        type: VerificationType.VENDOR_REGISTRATION,
      },
    });

    if (!verification) {
      return NextResponse.json({ error: "Invalid or incorrect code" }, { status: 400 });
    }

    if (verification.expiresAt < new Date()) {
      return NextResponse.json({ error: "This code has expired" }, { status: 400 });
    }

    // 2. THE FIX: Update 'used' to true so getLatestVerification can find it
    await prisma.verificationCode.update({
      where: { id: uid },
      data: { used: true },
    });

    return NextResponse.json({ success: true, message: "Email verified successfully" });
  } catch (error: any) {
    console.error("Verification Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
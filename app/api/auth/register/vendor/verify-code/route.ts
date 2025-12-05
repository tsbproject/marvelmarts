// app/api/auth/register/vendor/verify-code/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma"; // adjust your path

interface VerifyCodeRequestBody {
  email: string;
  code: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: VerifyCodeRequestBody = await req.json();
    const email = body.email.trim().toLowerCase();
    const code = body.code.trim().toUpperCase();

    if (!email || !code) return NextResponse.json({ success: false, error: "Email and code are required" }, { status: 400 });

    // Find valid code
    const record = await prisma.vendorVerification.findFirst({
      where: { email, code, used: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });

    if (!record) return NextResponse.json({ success: false, error: "Invalid or expired code" }, { status: 400 });

    // Mark code as used
    await prisma.vendorVerification.update({
      where: { id: record.id },
      data: { used: true },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Verify code error:", err);
    return NextResponse.json({ success: false, error: "Unexpected server error" }, { status: 500 });
  }
}

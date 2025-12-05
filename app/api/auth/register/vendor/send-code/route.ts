// app/api/auth/register/vendor/send-code/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma"; // adjust your path
import { randomBytes } from "crypto";

interface SendCodeRequestBody {
  email: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: SendCodeRequestBody = await req.json();

    const email = body.email.trim().toLowerCase();
    if (!email) return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });

    // Generate 6-digit numeric code
    const code = randomBytes(3).toString("hex").toUpperCase();

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Save to VendorVerification table
    await prisma.vendorVerification.create({
      data: {
        email,
        code,
        expiresAt,
      },
    });

    // TODO: send code via email using your email service here

    return NextResponse.json({ success: true, code }); // return code for dev/testing
  } catch (err) {
    console.error("Send verification code error:", err);
    return NextResponse.json({ success: false, error: "Unexpected server error" }, { status: 500 });
  }
}

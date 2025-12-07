import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

function generateOTP(length = 6) {
  return Math.floor(Math.random() * 10 ** length)
    .toString()
    .padStart(length, "0");
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || !email.includes("@")) {
      return NextResponse.json({ success: false, error: "Invalid email" }, { status: 400 });
    }

    // Generate OTP
    const otp = generateOTP(6);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 5 minutes

    // Save OTP to DB
    await prisma.vendorVerification.create({
      data: {
        email,
        code: otp,
        expiresAt,
      },
    });

    // TODO: send otp via email here

    return NextResponse.json({ success: true, code: otp }); // code for dev/testing only
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

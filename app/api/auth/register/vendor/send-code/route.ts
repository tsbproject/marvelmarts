import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { VerificationType } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendVerificationEmailWithNodemailer } from "@/app/lib/mailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, firstName, lastName } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // 1. Hash password immediately to store in verification record
    const hashedPassword = await bcrypt.hash(password, 12);
    const code = crypto.randomBytes(3).toString("hex").toUpperCase();

    // 2. Save intent
    const verification = await prisma.verificationCode.create({
      data: {
        email,
        hashedPassword,
        code,
        type: VerificationType.VENDOR_REGISTRATION,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    // 3. Send Mail
    await sendVerificationEmailWithNodemailer(email, code, verification.id, firstName, "VENDOR");

    return NextResponse.json({ success: true, verificationId: verification.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
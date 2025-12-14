


import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { VerificationType } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendVerificationEmailWithNodemailer } from "@/app/lib/mailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";


export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Reject if already registered
    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered." },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate random code (6-digit numeric)
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Create verification record
    const verification = await prisma.verificationCode.create({
      data: {
        email: normalizedEmail,
        name,
        hashedPassword,
        code,
        type: VerificationType.CUSTOMER_REGISTRATION,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        used: false,
      },
    });

    // Send email with code
    try {
      await sendVerificationEmailWithNodemailer(normalizedEmail, code, verification.id, name);
    } catch (mailErr) {
      console.error("Failed to send verification email:", mailErr);
    }

    return NextResponse.json(
      {
        success: true,
        verificationId: verification.id,
        ...(process.env.NODE_ENV === "development" ? { debugCode: code } : {}),
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Customer send-code error:", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message },
      { status: 500 }
    );
  }
}

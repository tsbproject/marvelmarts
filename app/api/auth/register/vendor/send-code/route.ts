// app/api/auth/register/vendor/send-code/route.ts
import { prisma } from "@/app/lib/prisma";
import { VerificationType, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      storeName,
      storePhone,
      storeAddress,
      country,
      state,
    } = await req.json();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const code = crypto.randomBytes(3).toString("hex");

    const vendorData: Prisma.JsonObject = {
      firstName,
      lastName,
      storeName,
      storePhone,
      storeAddress,
      country,
      state,
    };

    const verification = await prisma.verificationCode.create({
      data: {
        email,
        hashedPassword,
        code,
        type: VerificationType.VENDOR_REGISTRATION,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        used: false,
        vendorData,
      },
    });

    return NextResponse.json(
      { success: true, verificationId: verification.id },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Vendor send-code error:", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message },
      { status: 500 }
    );
  }
}

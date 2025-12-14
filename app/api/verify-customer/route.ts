// app/api/verify-customer/route.ts
import { NextResponse } from "next/server";
import { prisma} from "@/app/lib/prisma";
import {  VerificationType } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";


export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const uid = body?.uid;
    const code = body?.code;

    if (!uid || !code) {
      return NextResponse.json({ error: "Verification ID and code required." }, { status: 400 });
    }

    // Find verification record
    const verification = await prisma.verificationCode.findUnique({ where: { id: uid } });

    if (!verification || verification.type !== VerificationType.CUSTOMER_REGISTRATION) {
      return NextResponse.json({ error: "Invalid verification record." }, { status: 404 });
    }

    // Check expiration
    if (verification.expiresAt < new Date()) {
      return NextResponse.json({ error: "Verification code expired." }, { status: 400 });
    }

    // Check if already used
    if (verification.used) {
      return NextResponse.json({ error: "Code already used." }, { status: 400 });
    }

    // Check code match
    if (verification.code !== code) {
      return NextResponse.json({ error: "Invalid verification code." }, { status: 400 });
    }

    try {
      // Create actual User + CustomerProfile
      const user = await prisma.user.create({
        data: {
          name: verification.name ?? "",
          email: verification.email,
          passwordHash: verification.hashedPassword,
          role: "CUSTOMER",
          IsVerified: true, // ✅ lowercase field
          customerProfile: { create: {} },
        },
      });

      // Mark verification as used
      await prisma.verificationCode.update({
        where: { id: uid },
        data: { used: true },
      });

      return NextResponse.json({ success: true, userId: user.id }, { status: 201 });
    } catch (err: any) {
      if (err.code === "P2002") {
        return NextResponse.json({ error: "Email already registered." }, { status: 400 });
      }
      console.error("Prisma error creating user:", err);
      return NextResponse.json({ error: "Internal Server Error", details: err.message }, { status: 500 });
    }
  } catch (err: any) {
    console.error("Customer verify-code error:", err);
    return NextResponse.json({ error: "Internal Server Error", details: err.message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { UserRole } from "@prisma/client";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const { uid, code } = await req.json();
    const normalizedCode = String(code || "").trim();

    if (!uid || !normalizedCode) {
      return NextResponse.json(
        { error: "Verification ID and code are required." },
        { status: 400 }
      );
    }

    if (!process.env.NEXTAUTH_SECRET) {
      return NextResponse.json(
        { error: "Server configuration error." },
        { status: 500 }
      );
    }

    const verification = await prisma.verificationCode.findUnique({
      where: { id: uid },
    });

    if (!verification || verification.used) {
      return NextResponse.json({ error: "Invalid or expired link." }, { status: 400 });
    }

    if (verification.code !== normalizedCode) {
      return NextResponse.json({ error: "Incorrect verification code." }, { status: 400 });
    }

    if (new Date() > verification.expiresAt) {
      return NextResponse.json({ error: "Code has expired." }, { status: 400 });
    }

    const createdUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: verification.name,
          email: verification.email,
          passwordHash: verification.hashedPassword,
          IsVerified: true,
          role: UserRole.CUSTOMER,
          customerProfile: {
            create: {},
          },
        },
      });

      await tx.verificationCode.update({
        where: { id: uid },
        data: { used: true },
      });

      return user;
    });

    const autoLoginToken = jwt.sign(
      {
        purpose: "verified-login",
        uid,
        userId: createdUser.id,
        email: createdUser.email,
      },
      process.env.NEXTAUTH_SECRET,
      { expiresIn: "10m" }
    );

    return NextResponse.json(
      {
        success: true,
        message: "Account verified!",
        autoLoginToken,
        redirectTo: "/checkout",
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("❌ VERIFICATION_CRASH:", err);

    if (err?.code === "P2002" || err?.message?.includes("Unique constraint")) {
      return NextResponse.json({ error: "Email already registered." }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal Server Error", details: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
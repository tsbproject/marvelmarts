import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/app/lib/mailer";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Find user in any table
    const superAdmin = await prisma.admin.findUnique({ where: { email } });
    const admin = await prisma.admin.findUnique({ where: { email } });
    const vendor = await prisma.vendorProfile.findUnique({ where: { email } });
    const customer = await prisma.user.findUnique({ where: { email } });

    const user = superAdmin || admin || vendor || customer;

    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If the email exists, a reset link will be sent.",
      });
    }

    // Create token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30 mins

    // Save token in DB
    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expiresAt,
      },
    });

    // Send email
    await sendPasswordResetEmail(email, token);

    return NextResponse.json({
      success: true,
      message: "Password reset link sent.",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

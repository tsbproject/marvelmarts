import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { sendVerificationEmailWithNodemailer } from "@/app/lib/mailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { uid } = await req.json();

    if (!uid) {
      return NextResponse.json({ error: "Verification ID is required." }, { status: 400 });
    }

    // 1. Find the existing pending verification
    const existingVerification = await prisma.verificationCode.findUnique({
      where: { id: uid },
    });

    if (!existingVerification) {
      return NextResponse.json({ error: "Verification record not found." }, { status: 404 });
    }

    if (existingVerification.used) {
      return NextResponse.json({ error: "This account is already verified." }, { status: 400 });
    }

    // 2. Generate a fresh 6-digit code
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    const newExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins from now

    // 3. Update the existing record with the new code and expiry
    await prisma.verificationCode.update({
      where: { id: uid },
      data: {
        code: newCode,
        expiresAt: newExpiry,
      },
    });

    // 4. Send the email
    try {
      await sendVerificationEmailWithNodemailer(
        existingVerification.email,
        newCode,
        existingVerification.id,
        existingVerification.name || "Customer",
        "CUSTOMER"
      );
    } catch (mailErr) {
      console.error("Resend Mailer Error:", mailErr);
      // We still return 200 because the DB updated, but notify the dev
    }

    return NextResponse.json({
      success: true,
      message: "New code sent successfully.",
      ...(process.env.NODE_ENV === "development" ? { debugCode: newCode } : {}),
    });

  } catch (err: any) {
    console.error("Resend Route Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message },
      { status: 500 }
    );
  }
}
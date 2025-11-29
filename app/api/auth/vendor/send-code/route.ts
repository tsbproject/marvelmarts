


// app/api/auth/vendor/send-code/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { sendVerificationEmail } from "@/app/lib/mailer";

type EmailRequestBody = {
  email?: string;
};

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as EmailRequestBody;
    const email = (body.email ?? "").toLowerCase().trim();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const now = new Date();

    // Cooldown: don't allow resend if last code sent less than 60s ago
    const existing = await prisma.emailVerification.findUnique({
      where: { email },
    });

    if (existing) {
      const secondsSince = (now.getTime() - existing.createdAt.getTime()) / 1000;
      if (secondsSince < 60) {
        return NextResponse.json(
          { error: "Wait before requesting a new code" },
          { status: 429 }
        );
      }
    }

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Upsert code
    await prisma.emailVerification.upsert({
      where: { email },
      update: { code, verified: false, expiresAt, createdAt: now },
      create: { email, code, expiresAt },
    });

    // Send email
    await sendVerificationEmail(email, code);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("send-code error:", err);
    return NextResponse.json(
      { error: "Failed to send code" },
      { status: 500 }
    );
  }
}


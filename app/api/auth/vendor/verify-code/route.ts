import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email: rawEmail, code } = await req.json();
    const email = (rawEmail || "").toLowerCase().trim();

    if (!email || !code) {
      return NextResponse.json({ error: "Email and code are required" }, { status: 400 });
    }

    const record = await prisma.emailVerification.findUnique({ where: { email } });

    if (!record) {
      return NextResponse.json({ error: "No code found for this email" }, { status: 404 });
    }

    if (record.verified) {
      return NextResponse.json({ success: true, message: "Already verified" });
    }

    const now = new Date();
    if (record.expiresAt < now) {
      return NextResponse.json({ error: "Code expired" }, { status: 400 });
    }

    if (record.code !== code) {
      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }

    // mark verified
    await prisma.emailVerification.update({
      where: { email },
      data: { verified: true },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("verify-code error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

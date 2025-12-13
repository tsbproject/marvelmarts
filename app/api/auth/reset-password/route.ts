// app/api/auth/reset-password/route.ts
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, code, newPassword } = await req.json();

    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { success: false, error: "Missing fields" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Generic response to avoid account enumeration
      return NextResponse.json(
        { success: false, error: "Invalid reset request" },
        { status: 400 }
      );
    }

    const token = await prisma.passwordResetToken.findUnique({
      where: { userId: user.id },
    });

    if (!token || token.token !== code) {
      return NextResponse.json(
        { success: false, error: "Invalid reset request" },
        { status: 400 }
      );
    }

    if (token.expiresAt < new Date()) {
      return NextResponse.json(
        { success: false, error: "Reset code expired" },
        { status: 400 }
      );
    }

    // 🔹 Removed the `attempts` check because the column doesn't exist

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashedPassword },
    });

    await prisma.passwordResetToken.delete({ where: { userId: user.id } });

    return NextResponse.json(
      { success: true, message: "Password reset successful" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Reset-password error:", err);

    if (err instanceof Error) {
      return NextResponse.json(
        { success: false, error: "Internal Server Error", details: err.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal Server Error", details: "Unknown error" },
      { status: 500 }
    );
  }
}

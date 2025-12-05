// /app/api/auth/reset-password/route.ts
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcrypt";

type ResetPasswordRequest = {
  email: string;
  code: string;
  newPassword: string;
};

const PASSWORD_MIN_LENGTH = 8;

// Simple in-memory rate limiter (per email)
const resetAttempts: Record<string, { count: number; lastAttempt: number }> = {};
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes

export async function POST(req: Request) {
  try {
    const body: ResetPasswordRequest = await req.json();

    // ✅ Validate input
    if (
      !body.email ||
      typeof body.email !== "string" ||
      !body.code ||
      typeof body.code !== "string" ||
      !body.newPassword ||
      typeof body.newPassword !== "string"
    ) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid input" }),
        { status: 400 }
      );
    }

    if (body.newPassword.length < PASSWORD_MIN_LENGTH) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
        }),
        { status: 400 }
      );
    }

    // ✅ Rate limiting per email
    const now = Date.now();
    const attempts = resetAttempts[body.email] || { count: 0, lastAttempt: now };
    if (now - attempts.lastAttempt > WINDOW_MS) {
      // Reset window
      attempts.count = 0;
      attempts.lastAttempt = now;
    }
    attempts.count += 1;
    attempts.lastAttempt = now;
    resetAttempts[body.email] = attempts;

    if (attempts.count > MAX_ATTEMPTS) {
      return new Response(
        JSON.stringify({ success: false, error: "Too many attempts. Try again later." }),
        { status: 429 }
      );
    }

    // ✅ Lookup user
    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user) {
      return new Response(
        JSON.stringify({ success: false, error: "User not found" }),
        { status: 404 }
      );
    }

    // ✅ Lookup token
    const tokenEntry = await prisma.passwordResetToken.findUnique({
      where: { userId: user.id },
    });

    if (
      !tokenEntry ||
      tokenEntry.token !== body.code ||
      tokenEntry.expiresAt < new Date()
    ) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid or expired code" }),
        { status: 400 }
      );
    }

    // ✅ Hash new password
    const hashedPassword = await bcrypt.hash(body.newPassword, 10);

    // ✅ Update user's password
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashedPassword },
    });

    // ✅ Delete used token
    await prisma.passwordResetToken.delete({ where: { userId: user.id } });

    // ✅ Reset attempts after success
    delete resetAttempts[body.email];

    return new Response(
      JSON.stringify({ success: true, message: "Password updated successfully" }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Reset-password error:", err);
    return new Response(
      JSON.stringify({ success: false, error: (err as Error).message || "Internal server error" }),
      { status: 500 }
    );
  }
}

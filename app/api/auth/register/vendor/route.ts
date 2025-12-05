import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcrypt";
import { z } from "zod";

const vendorSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  storeName: z.string().min(1),
  storePhone: z.string().min(10),
  storeAddress: z.string().min(5),
  country: z.string().min(1),
  state: z.string().min(1),
  verificationCode: z.string().min(4),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = vendorSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0]?.message ?? "Validation failed" },
        { status: 400 }
      );
    }

    const { email, password, firstName, lastName, storeName, storePhone, storeAddress, country, state, verificationCode } = parsed.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return NextResponse.json({ success: false, error: "Email already registered" }, { status: 400 });

    // Check verification code
    const vCode = await prisma.vendorVerification.findFirst({
      where: { email, code: verificationCode, used: false, expiresAt: { gte: new Date() } },
    });
    if (!vCode) return NextResponse.json({ success: false, error: "Invalid or expired verification code" }, { status: 400 });

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user + vendor profile
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: "VENDOR",
        vendorProfile: {
          create: {
            firstName,
            lastName,
            storeName,
            storePhone,
            storeAddress,
            country,
            state,
            verificationCode,
            isVerified: true,
          },
        },
      },
      include: { vendorProfile: true },
    });

    // Mark verification code as used
    await prisma.vendorVerification.update({ where: { id: vCode.id }, data: { used: true } });

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { VerificationType, UserRole } from "@prisma/client";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { getLatestVerification, validateVerification, cleanupVerification } from "@/app/lib/registration";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Matches your frontend payload
const vendorRegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6), // The real password from Step 3
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  storeName: z.string().min(1),
  storePhone: z.string().min(1),
  storeAddress: z.string().min(1),
  state: z.string().min(1),
  country: z.string().default("Nigeria"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = vendorRegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Missing required details", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { email, password, firstName, lastName, storeName, storePhone, storeAddress, state, country } = parsed.data;

    // 1. Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    // 2. Fetch the verification record (marked as 'used: true' by handleVerifyCode)
    const verification = await getLatestVerification(email, VerificationType.VENDOR_REGISTRATION);
    
    // We pass a custom check here because we are providing a NEW password 
    // from the frontend, so we don't need to rely on the placeholder passwordHash.
    if (!verification) {
      return NextResponse.json({ error: "Email not verified" }, { status: 400 });
    }

    // 3. Hash the REAL password from the final step
    const finalPasswordHash = await bcrypt.hash(password, 12);

    // 4. Atomic Creation: User + Vendor Profile
    const user = await prisma.user.create({
      data: {
        name: `${firstName} ${lastName}`,
        email,
        passwordHash: finalPasswordHash,
        role: UserRole.VENDOR,
        IsVerified: true,
        vendorProfile: {
          create: {
            firstName,
            lastName,
            storeName,
            storePhone,
            storeAddress,
            state,
            country,
            isVerified: true, 
          },
        },
      },
      select: { id: true, email: true, role: true },
    });

    // 5. Cleanup
    await cleanupVerification(email, VerificationType.VENDOR_REGISTRATION);

    return NextResponse.json({ success: true, user }, { status: 201 });
  } catch (err: any) {
    console.error("Vendor registration error:", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message },
      { status: 500 }
    );
  }
}
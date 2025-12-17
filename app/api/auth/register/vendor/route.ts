import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { VerificationType, UserRole } from "@prisma/client";
import { z } from "zod";
import { getLatestVerification, validateVerification, cleanupVerification } from "@/app/lib/registration";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// --- Zod schema ---
const customerRegisterSchema = z.object({
  email: z.string().email("Valid email required"),
  name: z.string().min(1, "Name is required"),
});

type CustomerRegisterBody = z.infer<typeof customerRegisterSchema>;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = customerRegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { email, name } = parsed.data;

    // --- Check if user already exists ---
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    // --- Verification checks ---
    const verification = await getLatestVerification(email, VerificationType.CUSTOMER_REGISTRATION);
    const check = validateVerification(verification);
    if (!check.valid) {
      return NextResponse.json({ error: check.error }, { status: 400 });
    }

    if (!verification?.hashedPassword) {
      return NextResponse.json({ error: "Password missing from verification record" }, { status: 400 });
    }

    // --- Customer profile data ---
    const customerProfileData = {
      // add any customer-specific fields here if needed
    };

    // --- Create user + customer profile ---
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: verification.hashedPassword,
        role: UserRole.CUSTOMER,
        IsVerified: true,
        customerProfile: { create: customerProfileData },
      },
      select: { id: true, email: true, role: true },
    });

    // --- Cleanup verification codes ---
    await cleanupVerification(email, VerificationType.CUSTOMER_REGISTRATION);

    return NextResponse.json({ success: true, user }, { status: 201 });
  } catch (err) {
    console.error("Customer registration error:", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { UserRole } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const { uid, code } = await req.json();

    // 1. Fetch verification record
    const verification = await prisma.verificationCode.findUnique({
      where: { id: uid },
    });

    if (!verification || verification.used) {
      return NextResponse.json({ error: "Invalid or expired link." }, { status: 400 });
    }

    if (verification.code !== code.trim()) {
      return NextResponse.json({ error: "Incorrect verification code." }, { status: 400 });
    }

    if (new Date() > verification.expiresAt) {
      return NextResponse.json({ error: "Code has expired." }, { status: 400 });
    }

    // 2. Database Transaction with CORRECT field names
    await prisma.$transaction(async (tx) => {
      // Create the user using your specific schema fields
      const user = await tx.user.create({
        data: {
          name: verification.name,
          email: verification.email,
          passwordHash: verification.hashedPassword, // Fixed to match your schema
          IsVerified: true,                          // Fixed: Capital 'I' to match your schema
          role: UserRole.CUSTOMER,
          customerProfile: {
            create: {} // Creates the linked profile you shared earlier
          }
        }
      });

      // Mark the code as used so it can't be reused
      await tx.verificationCode.update({
        where: { id: uid },
        data: { used: true },
      });
    });

    return NextResponse.json({ success: true, message: "Account verified!" }, { status: 201 });

  } catch (err: any) {
    console.error("❌ VERIFICATION_CRASH:", err.message);
    
    // Check for unique constraint (email already exists)
    if (err.message.includes("Unique constraint")) {
      return NextResponse.json({ error: "Email already registered." }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal Server Error", details: err.message },
      { status: 500 }
    );
  }
}
// app/api/auth/register/customer/route.ts
import { NextResponse } from "next/server";
import { prisma} from "@/app/lib/prisma";
import { VerificationType } from "@prisma/client";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email("Valid email required"),
});

type RegisterBody = z.infer<typeof registerSchema>;

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();
    const parsed = registerSchema.safeParse(body);
    
   if (!parsed.success) {
  return NextResponse.json(
   { error: parsed.error.issues[0]?.message ?? "Validation failed" }

  );
}

// At this point, parsed.data is guaranteed to be RegisterBody
const { email } = parsed.data as RegisterBody;


    // Reject if already registered
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    // Must have a verified, unexpired code
    const verification = await prisma.verificationCode.findFirst({
      where: { email, type: VerificationType.CUSTOMER_REGISTRATION, used: true },
      orderBy: { createdAt: "desc" },
    });

    if (!verification) {
      return NextResponse.json({ error: "Email not verified" }, { status: 400 });
    }
    if (verification.expiresAt < new Date()) {
      return NextResponse.json({ error: "Verification expired" }, { status: 400 });
    }

    if (!verification.hashedPassword) {
      return NextResponse.json({ error: "Password missing from verification record" }, { status: 400 });
    }

    // Create user + customer profile
    const user = await prisma.user.create({
      data: {
        name: verification.name ?? "",
        email,
        passwordHash: verification.hashedPassword,
        role: "CUSTOMER",
        customerProfile: {
          create: {},
        },
      },
      select: { id: true, email: true },
    });

    // Cleanup: remove all verification records for this email/type
    await prisma.verificationCode.deleteMany({
      where: { email, type: VerificationType.CUSTOMER_REGISTRATION },
    });

    return NextResponse.json({ success: true, user }, { status: 201 });
  } catch (err: any) {
    console.error("Customer registration error:", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message },
      { status: 500 }
    );
  }
}

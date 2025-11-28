import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      firstName,
      lastName,
      storeName,
      storePhone,
      storeAddress,
      country,
      state,
      email: rawEmail,
      password,
    } = body;

    const email = (rawEmail || "").toLowerCase().trim();

    // basic required validation
    if (!firstName || !lastName || !storeName || !storePhone || !storeAddress || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // check if email already used
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    // check email verification record and ensure verified
    const verification = await prisma.emailVerification.findUnique({ where: { email } });
    if (!verification || !verification.verified) {
      return NextResponse.json({ error: "Email not verified" }, { status: 400 });
    }

    // create user and vendor profile in a transaction
    const passwordHash = await bcrypt.hash(password, 10);

    const created = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: `${firstName} ${lastName}`,
          email,
          passwordHash,
          role: "vendor",
        },
      });

      await tx.vendorProfile.create({
        data: {
          userId: user.id,
          firstName,
          lastName,
          storeName,
          storePhone,
          storeAddress,
          country,
          state,
        },
      });

      // optional: delete verification record after successful registration
      await tx.emailVerification.deleteMany({ where: { email } });

      return user;
    });

    // success
    return NextResponse.json({ success: true, userId: created.id });
  } catch (err) {
    console.error("vendor register error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

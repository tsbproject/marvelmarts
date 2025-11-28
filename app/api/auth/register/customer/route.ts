import { NextResponse } from "next/server";
import { prisma } from "@/app/_lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const { fullName, email: rawEmail, password } = await req.json();
    const email = (rawEmail || "").toLowerCase().trim();

    if (!fullName || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: fullName,
        email,
        passwordHash,
        role: "user",
      },
    });

    return NextResponse.json({ success: true, userId: user.id });
  } catch (err) {
    console.error("customer register error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      fullName,
      email,
      password,
      storeName,
      storePhone,
      storeAddress,
      country,
      state
    } = body;

    if (!fullName || !email || !password || !storeName || !storePhone || !storeAddress) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        passwordHash: hashed,
        role: "VENDOR",
        storeName,
        storePhone,
        storeAddress,
        country,
        state
      }
    });

    return NextResponse.json({ success: true, user });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

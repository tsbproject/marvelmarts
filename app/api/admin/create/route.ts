import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, role, permissions } = body;

    // Check existing user
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Admin with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password into `passwordHash`
    const hashed = await bcrypt.hash(password, 10);

    // Create admin correctly using passwordHash
    const newAdmin = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashed, // ← FIXED
        role, // ADMIN or SUPER_ADMIN
        permissions, // JSON field is OK
      },
    });

    return NextResponse.json({ admin: newAdmin }, { status: 201 });
  } catch (err) {
    console.error("Admin create error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

// app/api/admin/create/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcrypt";

interface AdminRequestBody {
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "SUPER_ADMIN";
  permissions?: Record<string, boolean>;
}

export async function POST(req: Request) {
  try {
    const { name, email, password, role, permissions } = (await req.json()) as AdminRequestBody;

    // ------------------------------------------------------
    // 1. Normalize email before ANY DB operation
    // ------------------------------------------------------
    const normalizedEmail = email.toLowerCase().trim();

    // ------------------------------------------------------
    // 2. Check for existing admin using normalized email
    // ------------------------------------------------------
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingAdmin) {
      return NextResponse.json(
        { error: "Admin with this email already exists" },
        { status: 400 }
      );
    }

    // ------------------------------------------------------
    // 3. Hash password securely
    // ------------------------------------------------------
    const passwordHash = await bcrypt.hash(password, 10);

    // ------------------------------------------------------
    // 4. Create admin with CLEAN email + safe permissions
    // ------------------------------------------------------
    const newAdmin = await prisma.admin.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash,
        role,
        permissions: permissions ?? {}, // ensure always an object
      },
    });

    return NextResponse.json({ admin: newAdmin }, { status: 201 });

  } catch (error: unknown) {
    console.error("Admin creation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}


import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import bcrypt from "bcryptjs";
import prisma from "@/app/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const data = await req.json();
  const { name, email, password, permissions } = data;

  const hashed = await bcrypt.hash(password, 10);

  const admin = await prisma.admin.create({
    data: {
      name,
      email,
      password: hashed,
      role: "ADMIN",
      permissions,
    },
  });

  return NextResponse.json({ message: "Admin created", admin });
}

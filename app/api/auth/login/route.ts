import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcrypt";
import ws from "ws";

// Neon requires a WebSocket global for Prisma Accelerate
(global as any).WebSocket = ws;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";


export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // 🔹 1. Check user in User table
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 400 }
      );
    }

    // 🔹 2. Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 400 }
      );
    }

    // 🔹 3. Load correct profile based on role
    let profile = null;

    switch (user.role) {
      case "SUPER_ADMIN":
      case "ADMIN":
        profile = await prisma.adminProfile.findUnique({
          where: { userId: user.id },
        });
        break;

      case "VENDOR":
        profile = await prisma.vendorProfile.findUnique({
          where: { userId: user.id },
        });
        break;

      case "CUSTOMER":
        profile = await prisma.customerProfile.findUnique({
          where: { userId: user.id },
        });
        break;
    }

    // Safety: ensure profile exists
    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found for this user." },
        { status: 500 }
      );
    }

  
    // 🔹 4. Create session payload
        const sessionData = {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name ?? "User",   // ✅ use user.name instead of profile.name
          profileId: profile.id,
        };


    // 🔹 5. Set session cookie
    const response = NextResponse.json({
      message: "Login Successful",
      user: sessionData,
    });

    response.cookies.set("marvelmarts_session", JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Login Error:", err);
    return NextResponse.json(
      { error: "Something went wrong during login." },
      { status: 500 }
    );
  }
}

// trigger redeploy


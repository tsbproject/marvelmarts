import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ message: "Invalid email" }, { status: 400 });
    }

    const subscriber = await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: {}, // Do nothing if they already exist
      create: { email },
    });

    return NextResponse.json({ message: "Successfully joined the circle!" }, { status: 200 });
  } catch (error) {
    console.error("Newsletter Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
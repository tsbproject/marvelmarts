import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, marvel_marts_bot_check } = body;

    // 1. HONEYPOT SECURITY CHECK
    // If the hidden field is filled, it's a bot.
    if (marvel_marts_bot_check && marvel_marts_bot_check.length > 0) {
      console.warn("Bot submission detected and blocked.");
      // We return 200 to fool the bot into thinking it succeeded 
      // so it leaves your site alone.
      return NextResponse.json(
        { message: "Successfully joined the circle!" }, 
        { status: 200 }
      );
    }

    // 2. DATA VALIDATION
    if (!email || !email.includes("@")) {
      return NextResponse.json({ message: "Please provide a valid email" }, { status: 400 });
    }

    // 3. DATABASE UPSERT
    await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: {}, // Do nothing if they already exist
      create: { email },
    });

    return NextResponse.json(
      { message: "Successfully joined the circle!" }, 
      { status: 200 }
    );
  } catch (error) {
    console.error("Newsletter Error:", error);
    return NextResponse.json(
      { message: "Internal server error" }, 
      { status: 500 }
    );
  }
}
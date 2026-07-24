import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/app/lib/prisma";

import { handleApiError } from "@/app/lib/auth/api";
import { badRequest } from "@/app/lib/auth/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const {
      email,
      marvel_marts_bot_check,
    } = await req.json();

    // Honeypot
    if (
      marvel_marts_bot_check &&
      marvel_marts_bot_check.trim().length > 0
    ) {
      console.warn(
        "Newsletter honeypot triggered."
      );

      return NextResponse.json(
        {
          success: true,
          message:
            "Successfully joined the circle!",
        },
        {
          status: 200,
        }
      );
    }

    if (
      !email ||
      typeof email !== "string" ||
      !email.includes("@")
    ) {
      throw badRequest(
        "Please provide a valid email address."
      );
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    await prisma.newsletterSubscriber.upsert({
      where: {
        email: normalizedEmail,
      },
      update: {},
      create: {
        email: normalizedEmail,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Successfully joined the circle!",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
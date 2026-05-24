



import { NextResponse } from "next/server";

import { prisma } from "@/app/lib/prisma";

import { VerificationType } from "@prisma/client";

import bcrypt from "bcryptjs";

import { sendVerificationEmail } from "@/app/lib/mailer";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request
) {

  try {

    // ─────────────────────────────────────
    // REQUEST BODY
    // ─────────────────────────────────────
    const {
      name,
      email,
      password,
    } = await req.json();

    // ─────────────────────────────────────
    // VALIDATION
    // ─────────────────────────────────────
    if (
      !name ||
      !email ||
      !password
    ) {

      return NextResponse.json(
        {
          error:
            "Name, email, and password are required.",
        },
        {
          status: 400,
        }
      );
    }

    // ─────────────────────────────────────
    // NORMALIZE EMAIL
    // ─────────────────────────────────────
    const normalizedEmail =
      email
        .trim()
        .toLowerCase();

    // ─────────────────────────────────────
    // CHECK EXISTING USER
    // ─────────────────────────────────────
    const existingUser =
      await prisma.user.findUnique({
        where: {
          email:
            normalizedEmail,
        },
      });

    if (existingUser) {

      return NextResponse.json(
        {
          error:
            "Email already registered.",
        },
        {
          status: 400,
        }
      );
    }

    // ─────────────────────────────────────
    // HASH PASSWORD
    // ─────────────────────────────────────
    const hashedPassword =
      await bcrypt.hash(
        password,
        12
      );

    // ─────────────────────────────────────
    // GENERATE 6-DIGIT CODE
    // ─────────────────────────────────────
    const code =
      Math.floor(
        100000 +
          Math.random() *
            900000
      ).toString();

    // ─────────────────────────────────────
    // STORE VERIFICATION
    // ─────────────────────────────────────
    const verification =
      await prisma.verificationCode.create({
        data: {
          email:
            normalizedEmail,

          name,

          hashedPassword,

          code,

          type:
            VerificationType.CUSTOMER_REGISTRATION,

          expiresAt:
            new Date(
              Date.now() +
                15 *
                  60 *
                  1000
            ),

          used: false,
        },
      });

    // ─────────────────────────────────────
    // SEND EMAIL
    // FIXED:
    // Uses new object-based function signature
    // ─────────────────────────────────────
    await sendVerificationEmail({
      email:
        normalizedEmail,

      code,

      uid:
        verification.id,

      name,

      type:
        "CUSTOMER",
    });

    // ─────────────────────────────────────
    // SUCCESS RESPONSE
    // ─────────────────────────────────────
    return NextResponse.json(
      {
        success: true,

        verificationId:
          verification.id,

        email:
          normalizedEmail,

        ...(process.env
          .NODE_ENV ===
        "development"
          ? {
              debugCode:
                code,
            }
          : {}),
      },
      {
        status: 201,
      }
    );

  } catch (err: any) {

    console.error(
      "Customer send-code error:",
      err
    );

    return NextResponse.json(
      {
        error:
          "Internal Server Error",

        details:
          err?.message ||
          "Unknown error",
      },
      {
        status: 500,
      }
    );
  }
}
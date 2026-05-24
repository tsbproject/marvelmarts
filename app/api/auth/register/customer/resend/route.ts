


import { NextResponse } from "next/server";

import { prisma } from "@/app/lib/prisma";

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
    const { uid } =
      await req.json();

    // ─────────────────────────────────────
    // VALIDATION
    // ─────────────────────────────────────
    if (!uid) {

      return NextResponse.json(
        {
          error:
            "Verification ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    // ─────────────────────────────────────
    // FIND VERIFICATION RECORD
    // ─────────────────────────────────────
    const existingVerification =
      await prisma.verificationCode.findUnique({
        where: {
          id: uid,
        },
      });

    if (
      !existingVerification
    ) {

      return NextResponse.json(
        {
          error:
            "Verification record not found.",
        },
        {
          status: 404,
        }
      );
    }

    // ─────────────────────────────────────
    // CHECK IF ALREADY VERIFIED
    // ─────────────────────────────────────
    if (
      existingVerification.used
    ) {

      return NextResponse.json(
        {
          error:
            "This account is already verified.",
        },
        {
          status: 400,
        }
      );
    }

    // ─────────────────────────────────────
    // GENERATE NEW CODE
    // ─────────────────────────────────────
    const newCode =
      Math.floor(
        100000 +
          Math.random() *
            900000
      ).toString();

    const newExpiry =
      new Date(
        Date.now() +
          15 *
            60 *
            1000
      );

    // ─────────────────────────────────────
    // UPDATE VERIFICATION RECORD
    // ─────────────────────────────────────
    await prisma.verificationCode.update({
      where: {
        id: uid,
      },

      data: {
        code: newCode,

        expiresAt:
          newExpiry,
      },
    });

    // ─────────────────────────────────────
    // SEND NEW EMAIL
    // FIXED:
    // Uses new object-based function signature
    // ─────────────────────────────────────
    await sendVerificationEmail({
      email:
        existingVerification.email,

      code: newCode,

      uid:
        existingVerification.id,

      name:
        existingVerification.name ||
        "Customer",

      type:
        "CUSTOMER",
    });

    // ─────────────────────────────────────
    // SUCCESS RESPONSE
    // ─────────────────────────────────────
    return NextResponse.json({
      success: true,

      message:
        "New code sent successfully.",

      ...(process.env
        .NODE_ENV ===
      "development"
        ? {
            debugCode:
              newCode,
          }
        : {}),
    });

  } catch (err: any) {

    console.error(
      "Resend Route Error:",
      err
    );

    return NextResponse.json(
      {
        error:
          "Failed to resend verification code.",

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
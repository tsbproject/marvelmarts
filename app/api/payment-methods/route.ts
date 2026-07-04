import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

import {
  requireAuth,
  handleApiError,
} from "@/app/lib/auth/api";

import {
  badRequest,
} from "@/app/lib/auth/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();

    const { reference } = await req.json();

    if (!reference || typeof reference !== "string") {
      throw badRequest("Payment reference is required.");
    }

    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const result = await paystackRes.json();

    if (
      !paystackRes.ok ||
      !result.status ||
      result.data?.status !== "success"
    ) {
      throw badRequest(
        result.message ?? "Payment verification failed."
      );
    }

    const authorization = result.data?.authorization;

    if (!authorization?.authorization_code) {
      throw badRequest(
        "Reusable payment authorization was not returned."
      );
    }

    const existingCard = await prisma.paymentMethod.findFirst({
      where: {
        userId: session.user.id,
        provider: "PAYSTACK",
        providerId: authorization.authorization_code,
      },
      select: {
        id: true,
      },
    });

    if (existingCard) {
      return NextResponse.json({
        success: true,
        data: existingCard,
        message: "Payment method already exists.",
      });
    }

    const hasDefaultCard = await prisma.paymentMethod.findFirst({
      where: {
        userId: session.user.id,
        isDefault: true,
      },
      select: {
        id: true,
      },
    });

    const paymentMethod = await prisma.paymentMethod.create({
      data: {
        userId: session.user.id,
        provider: "PAYSTACK",
        providerId: authorization.authorization_code,
        cardType: authorization.brand,
        last4: authorization.last4,
        expiryMonth: authorization.exp_month,
        expiryYear: authorization.exp_year
          .toString()
          .slice(-2),
        isDefault: !hasDefaultCard,
        metadata: result.data,
      },
    });

    return NextResponse.json({
      success: true,
      data: paymentMethod,
    });

  } catch (error) {
    return handleApiError(error);
  }
}
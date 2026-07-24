import { NextRequest, NextResponse } from "next/server";

import {
  requireVendor,
  handleApiError,
} from "@/app/lib/auth/api";

import { badRequest } from "@/app/lib/auth/errors";
import { PaymentService } from "@/app/lib/services/payment.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest
) {
  try {
    const session =
      await requireVendor();

    const {
      vendorProfileId,
      credits,
      amount,
    } = await request.json();

    if (
      !vendorProfileId ||
      !credits ||
      !amount
    ) {
      throw badRequest(
        "Invalid credit purchase request."
      );
    }

    const payment =
      await PaymentService.initializeBoostCreditPayment({
        email: session.user.email!,
        vendorProfileId,
        credits,
        amount,
      });

    return NextResponse.json(payment);
  } catch (error) {
    return handleApiError(error);
  }
}
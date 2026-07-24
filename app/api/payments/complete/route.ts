import { NextResponse } from "next/server";

import {
  requireAuth,
  handleApiError,
} from "@/app/lib/auth/api";

import { badRequest } from "@/app/lib/auth/errors";

import { PaymentService } from "@/app/lib/services/payment.service";

export async function POST(request: Request) {
  try {
    await requireAuth();

    const { reference } = await request.json();

    if (!reference) {
      throw badRequest(
        "Payment reference is required."
      );
    }

    const result =
      await PaymentService.completePayment(
        reference
      );

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
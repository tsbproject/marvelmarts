import { NextResponse } from "next/server";

import { handleApiError } from "@/app/lib/auth/api";
import { badRequest } from "@/app/lib/auth/errors";

import { PaymentService } from "@/app/lib/services/payment.service";
import { OrderService } from "@/app/lib/services/order.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { reference, orderId } =
      await req.json();

    if (!reference || !orderId) {
      throw badRequest(
        "Reference and orderId are required."
      );
    }

    const transaction =
      await PaymentService.verifyTransaction(
        reference
      );

    const latestOrder =
      await OrderService.validateVerifiedPayment(
        orderId,
        transaction
      );

    return NextResponse.json(
      {
        success: true,
        verified: true,
        order: latestOrder,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
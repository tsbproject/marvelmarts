import { NextResponse } from "next/server";

import {
  handleApiError,
} from "@/app/lib/auth/api";

import { verifyOrigin } from "@/app/lib/auth/csrf";
import { badRequest } from "@/app/lib/auth/errors";

import { PaymentService } from "@/app/lib/services/payment.service";
import { OrderService } from "@/app/lib/services/order.service";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = withApiLogging(
  async (req: Request) => {
    try {
      verifyOrigin(req);

      const {
        reference,
        orderId,
      } = await req.json();

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
);
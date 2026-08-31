import { NextRequest, NextResponse } from "next/server";

import {
  requireAuth,
  handleApiError,
} from "@/app/lib/auth/api";

import { verifyOrigin } from "@/app/lib/auth/csrf";
import { badRequest } from "@/app/lib/auth/errors";
import { PaymentService } from "@/app/lib/services/payment.service";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = withApiLogging(
  async (req: NextRequest) => {
    try {
      verifyOrigin(req);

      const session =
        await requireAuth();

      const { reference } =
        await req.json();

      if (
        !reference ||
        typeof reference !== "string"
      ) {
        throw badRequest(
          "Payment reference is required."
        );
      }

      const result =
        await PaymentService.savePaymentMethod(
          session.user.id,
          reference
        );

      if (result.existing) {
        return NextResponse.json({
          success: true,
          data: result.paymentMethod,
          message:
            "Payment method already exists.",
        });
      }

      return NextResponse.json({
        success: true,
        data: result.paymentMethod,
      });
    } catch (error) {
      return handleApiError(error);
    }
  }
);
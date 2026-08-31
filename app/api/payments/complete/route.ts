import { NextResponse } from "next/server";

import {
  requireAuth,
  handleApiError,
} from "@/app/lib/auth/api";

import { badRequest } from "@/app/lib/auth/errors";
import { PaymentService } from "@/app/lib/services/payment.service";
import { verifyOrigin } from "@/app/lib/auth/csrf";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = withApiLogging(
  async (request: Request) => {
    try {
      verifyOrigin(request);

      const session =
        await requireAuth();

      const body =
        await request.json();

      const reference =
        typeof body?.reference === "string"
          ? body.reference.trim()
          : "";

      if (!reference) {
        throw badRequest(
          "Payment reference is required."
        );
      }

      const result =
        await PaymentService.completePayment(
          reference,
          session.user.id
        );

      return NextResponse.json(
        result,
        {
          status: 200,
        }
      );
    } catch (error) {
      return handleApiError(error);
    }
  }
);
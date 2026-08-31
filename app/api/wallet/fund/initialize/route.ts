import { NextResponse } from "next/server";

import {
  requireAuth,
  handleApiError,
} from "@/app/lib/auth/api";

import { PaymentService } from "@/app/lib/services/payment.service";
import { verifyOrigin } from "@/app/lib/auth/csrf";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const POST = withApiLogging(
  async (request: Request) => {
    try {
      verifyOrigin(request);

      const session =
        await requireAuth();

      const {
        amount,
        saveCard,
        returnUrl,
      } = await request.json();

      const payment =
        await PaymentService.initializeWalletFunding({
          email:
            session.user.email!,
          userId:
            session.user.id,
          amount,
          saveCard,
          returnUrl,
        });

      return NextResponse.json(
        payment
      );
    } catch (error) {
      return handleApiError(error);
    }
  }
);
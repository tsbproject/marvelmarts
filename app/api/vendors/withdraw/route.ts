import { NextRequest, NextResponse } from "next/server";

import {
  handleApiError,
  requireVendor,
} from "@/app/lib/auth/api";

import { PayoutService } from "@/app/lib/services/payout.service";
import { badRequest } from "@/app/lib/auth/errors";
import { verifyOrigin } from "@/app/lib/auth/csrf";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = withApiLogging(
  async (req: NextRequest) => {
    try {
      verifyOrigin(req);

      const session =
        await requireVendor();

      const body =
        await req.json();

      const withdrawAmount =
        Number(body.amount);

      if (
        !withdrawAmount ||
        withdrawAmount <= 0
      ) {
        throw badRequest(
          "Invalid withdrawal amount."
        );
      }

      const withdrawal =
        await PayoutService.requestWithdrawal(
          session.user.id,
          withdrawAmount
        );

      return NextResponse.json(
        {
          success: true,
          message:
            "Withdrawal initiated successfully.",
          withdrawal,
        },
        {
          status: 201,
        }
      );
    } catch (error) {
      return handleApiError(error);
    }
  }
);
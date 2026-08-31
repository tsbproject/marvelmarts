import { NextRequest, NextResponse } from "next/server";

import {
  handleApiError,
  requireVendor,
} from "@/app/lib/auth/api";

import { PayoutService } from "@/app/lib/services/payout.service";

import {
  badRequest,
} from "@/app/lib/auth/errors";

import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* -------------------------------------------------------------------------- */
/*                          CREATE PAYOUT REQUEST                             */
/* -------------------------------------------------------------------------- */

export const POST = withApiLogging(
  async (req: NextRequest) => {
    try {
      const session =
        await requireVendor();

      const body =
        await req.json();

      const amount =
        Number(body.amount);

      if (!amount || amount <= 0) {
        throw badRequest(
          "Invalid payout amount."
        );
      }

      const profile =
        await PayoutService.validatePayoutRequest(
          session.user.id,
          amount
        );

      const result =
        await PayoutService.createPayoutRequest(
          {
            id: profile.id,
            bankName: profile.bankName!,
            accountName: profile.accountName!,
            accountNumber:
              profile.accountNumber!,
          },
          session.user.id,
          amount
        );

      return NextResponse.json(
        {
          success: true,
          message:
            "Payout request submitted successfully.",
          payout:
            result.payout,
          newBalance:
            result.newBalance,
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

/* -------------------------------------------------------------------------- */
/*                           GET MY PAYOUTS                                   */
/* -------------------------------------------------------------------------- */

export const GET = withApiLogging(
  async () => {
    try {
      const session =
        await requireVendor();

      const payouts =
        await PayoutService.getVendorPayouts(
          session.user.id
        );

      return NextResponse.json(
        {
          success: true,
          payouts,
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
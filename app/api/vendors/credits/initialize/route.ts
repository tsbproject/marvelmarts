import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  requireVendor,
  handleApiError,
} from "@/app/lib/auth/api";

import {
  badRequest,
} from "@/app/lib/auth/errors";

import {
  PaymentService,
} from "@/app/lib/services/payment.service";

import {
  VendorService,
} from "@/app/lib/services/vendor.service";

import {
  verifyOrigin,
} from "@/app/lib/auth/csrf";

import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* -------------------------------------------------------------------------- */
/*                         SERVER-SIDE CREDIT PLANS                           */
/* -------------------------------------------------------------------------- */

const CREDIT_PLANS = {
  starter: {
    credits: 15,
    amount: 2500,
  },

  growth: {
    credits: 45,
    amount: 6500,
  },

  pro: {
    credits: 100,
    amount: 12000,
  },
} as const;

/* -------------------------------------------------------------------------- */
/*                         INITIALIZE CREDIT PAYMENT                          */
/* -------------------------------------------------------------------------- */

export const POST = withApiLogging(
  async (request: NextRequest) => {
    try {
      verifyOrigin(request);

      const session =
        await requireVendor();

      const body =
        await request.json();

      const planId =
        typeof body?.planId === "string"
          ? body.planId.trim()
          : "";

      if (
        !planId ||
        !Object.prototype.hasOwnProperty.call(
          CREDIT_PLANS,
          planId
        )
      ) {
        throw badRequest(
          "Invalid credit plan."
        );
      }

      /*
       * Resolve the vendor from the authenticated
       * user rather than trusting vendorProfileId
       * supplied by the browser.
       */
      const vendor =
        await VendorService.getVendorProfileOrThrow(
          session.user.id
        );

      const plan =
        CREDIT_PLANS[
          planId as keyof typeof CREDIT_PLANS
        ];

      const payment =
        await PaymentService.initializeBoostCreditPayment({
          email:
            session.user.email ?? "",
          vendorProfileId:
            vendor.id,
          credits:
            plan.credits,
          amount:
            plan.amount,
        });

      return NextResponse.json(
        payment
      );
    } catch (error) {
      return handleApiError(error);
    }
  }
);
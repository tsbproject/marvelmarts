import { NextResponse } from "next/server";

import { PayoutService } from "@/app/lib/services/payout.service";

import {
  handleApiError,
  requireManagePayout,
} from "@/app/lib/auth/api";

import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET =
  withApiLogging(
    async (_req: Request) => {
      try {
        await requireManagePayout();

        const payouts =
          await PayoutService.getAdminPayouts();

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
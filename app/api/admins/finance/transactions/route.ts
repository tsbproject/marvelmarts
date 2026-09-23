import { NextResponse } from "next/server";

import {
  handleApiError,
  requireManagePayout,
} from "@/app/lib/auth/api";

import { verifyOrigin } from "@/app/lib/auth/csrf";

import { withApiLogging } from "@/app/lib/logging/with-api-logging";

import { FinancialReportingService } from "@/app/lib/services/finance/financial-reporting.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withApiLogging(
  async (req: Request) => {
    try {
      verifyOrigin(req);

      await requireManagePayout();

      const transactions =
        await FinancialReportingService.getRecentTransactions();

      return NextResponse.json({
        success: true,
        transactions,
      });
    } catch (error) {
      return handleApiError(error);
    }
  }
);
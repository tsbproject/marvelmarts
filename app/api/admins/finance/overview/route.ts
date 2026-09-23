import { NextResponse } from "next/server";

import { FinancialReportingService } from "@/app/lib/services/finance/financial-reporting.service";

import {
  handleApiError,
  requireManagePayout,
} from "@/app/lib/auth/api";

import { verifyOrigin } from "@/app/lib/auth/csrf";

import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withApiLogging(
  async (req: Request) => {
    try {
      verifyOrigin(req);

      await requireManagePayout();

      const overview =
        await FinancialReportingService.getOverview();

      return NextResponse.json({
        success: true,
        overview,
      });
    } catch (error) {
      return handleApiError(error);
    }
  }
);

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

      const url = new URL(req.url);

      const start = url.searchParams.get("start");
      const end = url.searchParams.get("end");

      if (!start || !end) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Both start and end dates are required.",
          },
          { status: 400 },
        );
      }

      const startDate = new Date(start);
      const endDate = new Date(end);

      if (
        Number.isNaN(startDate.getTime()) ||
        Number.isNaN(endDate.getTime())
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid reconciliation date range.",
          },
          { status: 400 },
        );
      }

      if (startDate >= endDate) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Reconciliation start date must be before end date.",
          },
          { status: 400 },
        );
      }

      const reconciliation =
        await FinancialReportingService.getPeriodReconciliation(
          startDate,
          endDate,
        );

      return NextResponse.json({
        success: true,
        reconciliation,
      });
    } catch (error) {
      return handleApiError(error);
    }
  },
);
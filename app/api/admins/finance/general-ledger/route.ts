import { NextResponse } from "next/server";

import {
  handleApiError,
  requireManagePayout,
} from "@/app/lib/auth/api";

import { verifyOrigin } from "@/app/lib/auth/csrf";

import { withApiLogging } from "@/app/lib/logging/with-api-logging";

import { FinancialReportingService } from "@/app/lib/services/finance/financial-reporting.service";

import { FinancialTransactionType } from "@prisma/client";

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
      const accountCode =
        url.searchParams.get("accountCode") || undefined;
      const transactionType =
        url.searchParams.get("transactionType") || undefined;

      const limitParam = url.searchParams.get("limit");

      const limit = limitParam
        ? Number(limitParam)
        : 200;

      if (!Number.isInteger(limit) || limit < 1 || limit > 500) {
        return NextResponse.json(
          {
            success: false,
            error: "Limit must be an integer between 1 and 500.",
          },
          { status: 400 },
        );
      }

      let startDate: Date | undefined;
      let endDate: Date | undefined;

      if (start) {
        startDate = new Date(start);

        if (Number.isNaN(startDate.getTime())) {
          return NextResponse.json(
            {
              success: false,
              error: "Invalid general ledger start date.",
            },
            { status: 400 },
          );
        }
      }

      if (end) {
        endDate = new Date(end);

        if (Number.isNaN(endDate.getTime())) {
          return NextResponse.json(
            {
              success: false,
              error: "Invalid general ledger end date.",
            },
            { status: 400 },
          );
        }
      }

      if (startDate && endDate && startDate >= endDate) {
        return NextResponse.json(
          {
            success: false,
            error:
              "General ledger start date must be before end date.",
          },
          { status: 400 },
        );
      }

      let parsedTransactionType: FinancialTransactionType | undefined;

      if (transactionType) {
        if (
          !Object.values(FinancialTransactionType).includes(
            transactionType as FinancialTransactionType,
          )
        ) {
          return NextResponse.json(
            {
              success: false,
              error: "Invalid financial transaction type.",
            },
            { status: 400 },
          );
        }

        parsedTransactionType =
          transactionType as FinancialTransactionType;
      }

      const ledger =
        await FinancialReportingService.getGeneralLedger({
          startDate,
          endDate,
          accountCode,
          transactionType: parsedTransactionType,
          limit,
        });

      return NextResponse.json({
        success: true,
        ledger,
      });
    } catch (error) {
      return handleApiError(error);
    }
  },
);
import { NextResponse } from "next/server";

import {
  requireSuperAdmin,
  handleApiError,
} from "@/app/lib/auth/api";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";
import { ApiLogService } from "@/app/lib/services/logging/api-log.service";
import { toCsv } from "@/app/lib/logging/csv";

export const dynamic = "force-dynamic";




export const GET = withApiLogging(
  async (req: Request) => {
    try {
      await requireSuperAdmin();

      const { searchParams } = new URL(req.url);

      const search =
        searchParams.get("search")?.trim() || undefined;

      const method =
        searchParams.get("method")?.trim() || undefined;

      const statusCodeValue =
        searchParams.get("statusCode")?.trim();

      const userId =
        searchParams.get("userId")?.trim() || undefined;

      const dateFromValue =
        searchParams.get("dateFrom")?.trim();

      const dateToValue =
        searchParams.get("dateTo")?.trim();

      const dateFrom = dateFromValue
        ? new Date(dateFromValue)
        : undefined;

      const dateTo = dateToValue
        ? new Date(dateToValue)
        : undefined;

      const statusCode = statusCodeValue
        ? Number.parseInt(statusCodeValue, 10)
        : undefined;

      if (
        (dateFrom &&
          Number.isNaN(dateFrom.getTime())) ||
        (dateTo &&
          Number.isNaN(dateTo.getTime()))
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid date filter.",
          },
          { status: 400 }
        );
      }

      if (
        statusCodeValue &&
        (statusCode === undefined ||
          Number.isNaN(statusCode))
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid status code filter.",
          },
          { status: 400 }
        );
      }

      const logs = await ApiLogService.export({
        search,
        method,
        statusCode,
        userId,
        dateFrom,
        dateTo,
      });

      const headers = [
        "ID",
        "Timestamp",
        "Request ID",
        "User ID",
        "User Name",
        "User Email",
        "Method",
        "Path",
        "Status Code",
        "Duration (ms)",
        "IP Address",
        "User Agent",
      ];

      const rows = logs.map((log) => [
        log.id,
        log.createdAt.toISOString(),
        log.requestId,
        log.user?.id,
        log.user?.name,
        log.user?.email,
        log.method,
        log.path,
        log.statusCode,
        log.durationMs,
        log.ipAddress,
        log.userAgent,
      ]);

      const csv = toCsv(headers, rows);

      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition":
            'attachment; filename="marvelmarts-api-logs.csv"',
          "Cache-Control": "no-store",
        },
      });
    } catch (error) {
      return handleApiError(error);
    }
  }
);
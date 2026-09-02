import { NextResponse } from "next/server";

import {
  requireSuperAdmin,
  handleApiError,
} from "@/app/lib/auth/api";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";
import { SecurityLogService } from "@/app/lib/services/logging/security-log.service";
import { toCsv } from "@/app/lib/logging/csv";

export const dynamic = "force-dynamic";



export const GET = withApiLogging(
  async (req: Request) => {
    try {
      await requireSuperAdmin();

      const { searchParams } = new URL(req.url);

      const search =
        searchParams.get("search")?.trim() || undefined;

      const event =
        searchParams.get("event")?.trim() || undefined;

      const severity =
        searchParams.get("severity")?.trim() || undefined;

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

      const logs = await SecurityLogService.export({
        search,
        event,
        severity,
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
        "Event",
        "Severity",
        "IP Address",
        "User Agent",
        "Request Path",
        "Request Method",
        "Metadata",
      ];

      const rows = logs.map((log) => [
        log.id,
        log.createdAt.toISOString(),
        log.requestId,
        log.user?.id,
        log.user?.name,
        log.user?.email,
        log.event,
        log.severity,
        log.ipAddress,
        log.userAgent,
        log.requestPath,
        log.requestMethod,
        log.metadata,
      ]);

      const csv = toCsv(headers, rows);

      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition":
            'attachment; filename="marvelmarts-security-logs.csv"',
          "Cache-Control": "no-store",
        },
      });
    } catch (error) {
      return handleApiError(error);
    }
  }
);
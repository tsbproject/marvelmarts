import { NextResponse } from "next/server";

import {
  requireSuperAdmin,
  handleApiError,
} from "@/app/lib/auth/api";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";
import { SecurityLogService } from "@/app/lib/services/logging/security-log.service";

export const dynamic = "force-dynamic";

export const GET = withApiLogging(
  async (req: Request) => {
    try {
      await requireSuperAdmin();

      const { searchParams } = new URL(req.url);

      const page = Math.max(
        1,
        Number.parseInt(
          searchParams.get("page") ?? "1",
          10
        ) || 1
      );

      const requestedPageSize = Number.parseInt(
        searchParams.get("pageSize") ?? "25",
        10
      );

      const pageSize = Math.min(
        100,
        Math.max(
          1,
          Number.isNaN(requestedPageSize)
            ? 25
            : requestedPageSize
        )
      );

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

      const result = await SecurityLogService.list({
        page,
        pageSize,
        search,
        event,
        severity,
        userId,
        dateFrom,
        dateTo,
      });

      return NextResponse.json({
        success: true,
        ...result,
      });
    } catch (error) {
      return handleApiError(error);
    }
  }
);
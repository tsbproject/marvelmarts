import { NextResponse } from "next/server";

import {
  requireSuperAdmin,
  handleApiError,
} from "@/app/lib/auth/api";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";
import { ApiLogService } from "@/app/lib/services/logging/api-log.service";

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

      const result = await ApiLogService.list({
        page,
        pageSize,
        search,
        method,
        statusCode,
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
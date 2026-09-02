import { NextResponse } from "next/server";

import {
  requireSuperAdmin,
  handleApiError,
} from "@/app/lib/auth/api";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";
import { AuditService } from "@/app/lib/services/logging/audit.service";
import { toCsv } from "@/app/lib/logging/csv";

export const dynamic = "force-dynamic";



 

export const GET = withApiLogging(
  async (req: Request) => {
    try {
      await requireSuperAdmin();

      const { searchParams } = new URL(req.url);

      const search =
        searchParams.get("search")?.trim() || undefined;

      const action =
        searchParams.get("action")?.trim() || undefined;

      const entity =
        searchParams.get("entity")?.trim() || undefined;

      const actorId =
        searchParams.get("actorId")?.trim() || undefined;

      const actorRole =
        searchParams.get("actorRole")?.trim() || undefined;

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

      const logs = await AuditService.export({
        search,
        action,
        entity,
        actorId,
        actorRole,
        dateFrom,
        dateTo,
      });

      const headers = [
        "ID",
        "Timestamp",
        "Request ID",
        "Actor ID",
        "Actor Name",
        "Actor Email",
        "Actor Role",
        "Action",
        "Entity",
        "Entity ID",
        "IP Address",
        "User Agent",
        "Old Values",
        "New Values",
      ];

      const rows = logs.map((log) => [
        log.id,
        log.createdAt.toISOString(),
        log.requestId,
        log.actor?.id,
        log.actor?.name,
        log.actor?.email,
        log.actorRole,
        log.action,
        log.entity,
        log.entityId,
        log.ipAddress,
        log.userAgent,
        log.oldValues,
        log.newValues,
      ]);

      const csv = toCsv(headers, rows);

      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition":
            'attachment; filename="marvelmarts-audit-logs.csv"',
          "Cache-Control": "no-store",
        },
      });
    } catch (error) {
      return handleApiError(error);
    }
  }
);
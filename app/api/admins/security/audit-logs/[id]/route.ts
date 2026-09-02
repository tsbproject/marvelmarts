import { NextResponse } from "next/server";

import {
  requireSuperAdmin,
  handleApiError,
} from "@/app/lib/auth/api";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";
import { AuditService } from "@/app/lib/services/logging/audit.service";

export const dynamic = "force-dynamic";

export const GET = withApiLogging(
  async (
    req: Request,
    context: {
      params: Promise<{ id: string }>;
    }
  ) => {
    try {
      await requireSuperAdmin();

      const { id } = await context.params;

      if (!id?.trim()) {
        return NextResponse.json(
          {
            success: false,
            error: "Audit log ID is required.",
          },
          { status: 400 }
        );
      }

      const auditLog = await AuditService.findById(id);

      if (!auditLog) {
        return NextResponse.json(
          {
            success: false,
            error: "Audit log not found.",
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        auditLog,
      });
    } catch (error) {
      return handleApiError(error);
    }
  }
);
import { NextResponse } from "next/server";

import {
  requireSuperAdmin,
  handleApiError,
} from "@/app/lib/auth/api";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";
import { ApiLogService } from "@/app/lib/services/logging/api-log.service";

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
            error: "API log ID is required.",
          },
          { status: 400 }
        );
      }

      const apiLog = await ApiLogService.findById(id);

      if (!apiLog) {
        return NextResponse.json(
          {
            success: false,
            error: "API log not found.",
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        apiLog,
      });
    } catch (error) {
      return handleApiError(error);
    }
  }
);
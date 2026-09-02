import { NextResponse } from "next/server";

import {
  requireSuperAdmin,
  handleApiError,
} from "@/app/lib/auth/api";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";
import { AuthLogService } from "@/app/lib/services/logging/auth-log.service";

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
            error: "Auth log ID is required.",
          },
          { status: 400 }
        );
      }

      const authLog = await AuthLogService.findById(id);

      if (!authLog) {
        return NextResponse.json(
          {
            success: false,
            error: "Auth log not found.",
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        authLog,
      });
    } catch (error) {
      return handleApiError(error);
    }
  }
);
import { NextResponse } from "next/server";

import {
  requireSuperAdmin,
  handleApiError,
} from "@/app/lib/auth/api";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";
import { SecurityLogService } from "@/app/lib/services/logging/security-log.service";

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
            error: "Security log ID is required.",
          },
          { status: 400 }
        );
      }

      const securityLog =
        await SecurityLogService.findById(id);

      if (!securityLog) {
        return NextResponse.json(
          {
            success: false,
            error: "Security log not found.",
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        securityLog,
      });
    } catch (error) {
      return handleApiError(error);
    }
  }
);
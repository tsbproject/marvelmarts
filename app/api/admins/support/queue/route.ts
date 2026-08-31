import { NextResponse } from "next/server";

import { MessageService } from "@/app/lib/services/message.service";
import {
  handleApiError,
  requireManageSupport,
} from "@/app/lib/auth/api";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET =
  withApiLogging(
    async (_req: Request) => {
      try {
        await requireManageSupport();

        const result =
          await MessageService.getSupportDashboardStats();

        return NextResponse.json({
          success: true,
          openTickets:
            result.openTickets,
        });
      } catch (error) {
        return handleApiError(error);
      }
    }
  );
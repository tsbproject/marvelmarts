import { NextResponse } from "next/server";

import { HelpCenterService } from "@/app/lib/services/help-center.service";
import { handleApiError } from "@/app/lib/auth/api";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET =
  withApiLogging(
    async (request: Request) => {
      try {
        const { searchParams } =
          new URL(request.url);

        const query =
          searchParams
            .get("q")
            ?.trim() ?? "";

        const articles =
          await HelpCenterService.searchArticles(
            query
          );

        return NextResponse.json({
          success: true,
          articles,
        });
      } catch (error) {
        return handleApiError(error);
      }
    }
  );
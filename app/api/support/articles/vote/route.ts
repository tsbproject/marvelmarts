import { NextResponse } from "next/server";

import { HelpCenterService } from "@/app/lib/services/help-center.service";
import { handleApiError } from "@/app/lib/auth/api";
import { verifyOrigin } from "@/app/lib/auth/csrf";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const POST = withApiLogging(
  async (req: Request) => {
    try {
      verifyOrigin(req);

      const {
        id,
        type,
      } = await req.json();

      const count =
        await HelpCenterService.voteArticle(
          id,
          type
        );

      return NextResponse.json({
        success: true,
        count,
      });
    } catch (error) {
      return handleApiError(error);
    }
  }
);
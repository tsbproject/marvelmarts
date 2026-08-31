import { NextRequest, NextResponse } from "next/server";

import {
  handleApiError,
  requireVendor,
} from "@/app/lib/auth/api";

import { VendorService } from "@/app/lib/services/vendor.service";
import { verifyOrigin } from "@/app/lib/auth/csrf";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const PATCH = withApiLogging(
  async (req: NextRequest) => {
    try {
      verifyOrigin(req);

      const session =
        await requireVendor();

      const body =
        await req.json();

      const updatedProfile =
        await VendorService.updateVendorSettings(
          session.user.id,
          body
        );

      return NextResponse.json(
        {
          success: true,
          profile: updatedProfile,
        },
        {
          status: 200,
        }
      );
    } catch (error) {
      return handleApiError(error);
    }
  }
);
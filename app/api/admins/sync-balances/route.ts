import { NextResponse } from "next/server";

import { VendorService } from "@/app/lib/services/vendor.service";
import {
  handleApiError,
  requireManageVendors,
} from "@/app/lib/auth/api";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET =
  withApiLogging(
    async (_req: Request) => {
      try {
        await requireManageVendors();

        const result =
          await VendorService.syncVendorBalances();

        return NextResponse.json({
          success: true,
          syncedCount:
            result.syncedCount,
          details:
            result.details,
        });
      } catch (error) {
        return handleApiError(error);
      }
    }
  );
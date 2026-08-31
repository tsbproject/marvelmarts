import { NextResponse } from "next/server";

import { VendorService } from "@/app/lib/services/vendor.service";
import {
  handleApiError,
  requireManageVendors,
} from "@/app/lib/auth/api";
import { verifyOrigin } from "@/app/lib/auth/csrf";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST =
  withApiLogging(
    async (req: Request) => {
      try {
        verifyOrigin(req);

        await requireManageVendors();

        const synced =
          await VendorService.syncVendorStores();

        return NextResponse.json(
          {
            success: true,
            message:
              `Successfully synchronized ${synced} stores with profile data.`,
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
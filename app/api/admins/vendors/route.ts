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

        const vendors =
          await VendorService.getAdminVendors();

        return NextResponse.json(
          {
            success: true,
            vendors,
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
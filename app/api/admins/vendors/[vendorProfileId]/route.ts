import { NextRequest, NextResponse } from "next/server";

import { VendorService } from "@/app/lib/services/vendor.service";
import {
  handleApiError,
  requireManageVendors,
} from "@/app/lib/auth/api";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET: Fetch vendor profile details for Admin view
 */
export const GET = withApiLogging(
  async (
    req: NextRequest,
    {
      params,
    }: {
      params: Promise<{
        vendorProfileId: string;
      }>;
    }
  ) => {
    try {
      await requireManageVendors();

      const { vendorProfileId } = await params;

      const vendorProfile =
        await VendorService.getVendorProfileForAdmin(
          vendorProfileId
        );

      return NextResponse.json(vendorProfile);
    } catch (error) {
      return handleApiError(error);
    }
  }
);
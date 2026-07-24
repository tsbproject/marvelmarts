import { NextRequest, NextResponse } from "next/server";

import { VendorService } from "@/app/lib/services/vendor.service";
import { handleApiError, requireManageVendors } from "@/app/lib/auth/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET: Fetch vendor profile details for Admin view
 */
export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      vendorProfileId: string;
    }>;
  }
) {
  try {
    await requireManageVendors();

    const { vendorProfileId } =
      await params;

    const vendorProfile =
      await VendorService.getVendorProfileForAdmin(
        vendorProfileId
      );

    return NextResponse.json(
      vendorProfile
    );
  } catch (error) {
    return handleApiError(error);
  }
}
import { NextResponse } from "next/server";

import { VendorService } from "@/app/lib/services/vendor.service";
import { handleApiError, requireManageVendors  } from "@/app/lib/auth/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
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
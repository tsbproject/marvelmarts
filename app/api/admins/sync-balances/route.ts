import { NextResponse } from "next/server";

import { VendorService } from "@/app/lib/services/vendor.service";

import { requireManageVendors } from "@/app/lib/auth/guards";
import { handleApiError } from "@/app/lib/auth/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
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
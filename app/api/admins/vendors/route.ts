import { NextResponse } from "next/server";

import { VendorService } from "@/app/lib/services/vendor.service";

import { requireManageVendors } from "@/app/lib/auth/guards";
import { handleApiError } from "@/app/lib/auth/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
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
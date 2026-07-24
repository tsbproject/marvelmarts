import { NextRequest, NextResponse } from "next/server";

import { handleApiError, requireVendor  } from "@/app/lib/auth/api";

import { VendorService } from "@/app/lib/services/vendor.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest
) {
  try {
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
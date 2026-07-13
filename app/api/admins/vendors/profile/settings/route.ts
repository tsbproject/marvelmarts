import { NextResponse } from "next/server";

import { VendorService } from "@/app/lib/services/vendor.service";

import { requireVendor } from "@/app/lib/auth/guards";
import { handleApiError } from "@/app/lib/auth/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request
) {
  try {
    const session =
      await requireVendor();

    const body =
      await req.json();

    const profile =
      await VendorService.updateVendorSettings(
        session.user.id,
        body
      );

    return NextResponse.json(
      {
        success: true,
        message:
          "Profile settings updated",
        profile,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
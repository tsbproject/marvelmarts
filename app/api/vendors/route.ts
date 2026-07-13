import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/app/lib/prisma";

import {
  requireManageVendors,
  requireAuth,
} from "@/app/lib/auth/guards";

import { handleApiError } from "@/app/lib/auth/api";
import { badRequest, notFound,} from "@/app/lib/auth/errors";
import { VendorService } from "@/app/lib/services/vendor.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* -------------------------------------------------------------------------- */
/*                               GET VENDORS                                  */
/* -------------------------------------------------------------------------- */

export async function GET() {
  try {
    await requireManageVendors();

    const vendors =
      await VendorService.listVendors();

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

/* -------------------------------------------------------------------------- */
/*                           UPDATE STORE SETUP                               */
/* -------------------------------------------------------------------------- */

export async function PATCH(
  req: NextRequest
) {
  try {
    const session =
      await requireAuth();

    const body = await req.json();

    const {
      storeName,
      storePhone,
      storeAddress,
      logoUrl,
      coverUrl,
    } = body;

    await VendorService.getVendorProfileOrThrow(
        session.user.id
      );

    if (
      !storeName?.trim()
    ) {
      throw badRequest(
        "Store name is required."
      );
    }

    const updatedVendor =
      await VendorService.updateStoreSetup(
        session.user.id,
        {
          storeName,
          storePhone,
          storeAddress,
          logoUrl,
          coverUrl,
        }
      );
    return NextResponse.json(
      {
        success: true,
        vendor: updatedVendor,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
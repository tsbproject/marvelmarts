import { NextRequest, NextResponse } from "next/server";

import {
  requireManageVendors,
  requireAuth,
  handleApiError,
} from "@/app/lib/auth/api";

import { badRequest } from "@/app/lib/auth/errors";
import { VendorService } from "@/app/lib/services/vendor.service";
import { verifyOrigin } from "@/app/lib/auth/csrf";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* -------------------------------------------------------------------------- */
/*                               GET VENDORS                                  */
/* -------------------------------------------------------------------------- */

export const GET = withApiLogging(
  async () => {
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
);

/* -------------------------------------------------------------------------- */
/*                           UPDATE STORE SETUP                               */
/* -------------------------------------------------------------------------- */

export const PATCH = withApiLogging(
  async (req: NextRequest) => {
    try {
      verifyOrigin(req);

      const session =
        await requireAuth();

      const body =
        await req.json();

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

      if (!storeName?.trim()) {
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
);
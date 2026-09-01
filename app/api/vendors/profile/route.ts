import { NextResponse } from "next/server";

import {
  handleApiError,
  requireVendor,
} from "@/app/lib/auth/api";

import { VendorService } from "@/app/lib/services/vendor.service";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";


export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* -------------------------------------------------------------------------- */
/*                               GET PROFILE                                  */
/* -------------------------------------------------------------------------- */

export const GET = withApiLogging(
  async () => {
    try {
       
      const session = await requireVendor();

      const profile =
        await VendorService.getVendorProfileWithStore(
          session.user.id
        );

      return NextResponse.json(
        {
          success: true,
          profile,
          onboarding: {
            profileDone:
              profile.profileDone ?? false,
            storeDone:
              profile.storeDone ?? false,
            payoutsDone:
              profile.payoutsDone ?? false,
            productDone:
              (profile._count.products ?? 0) > 0,
          },
          balance: Number(profile.balance),
          roles:
            session.user.roles ??
            [session.user.role],
          verificationStatus:
            profile.status,
          lastSyncedAt:
            new Date().toISOString(),
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
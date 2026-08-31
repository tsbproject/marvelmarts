import {
  NextRequest,
  NextResponse,
} from "next/server";

import { VendorService } from "@/app/lib/services/vendor.service";

import {
  handleApiError,
  requireAuth,
} from "@/app/lib/auth/api";
import { verifyOrigin } from "@/app/lib/auth/csrf";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* -------------------------------------------------------------------------- */
/*                          GET BANK ACCOUNT                                  */
/* -------------------------------------------------------------------------- */

export const GET = withApiLogging(
  async () => {
    try {
      const session =
        await requireAuth();

      const bankAccount =
        await VendorService.getBankAccount(
          session.user.id
        );

      return NextResponse.json(
        {
          success: true,
          bankAccount,
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
/*                     CREATE / UPDATE BANK ACCOUNT                           */
/* -------------------------------------------------------------------------- */

export const POST = withApiLogging(
  async (req: NextRequest) => {
    try {
      verifyOrigin(req);

      const session =
        await requireAuth();

      const body =
        await req.json();

      const bankAccount =
        await VendorService.saveBankAccount(
          session.user.id,
          body
        );

      return NextResponse.json(
        {
          success: true,
          bankAccount,
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
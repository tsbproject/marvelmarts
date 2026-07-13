import {
  NextRequest,
  NextResponse,
} from "next/server";

import { VendorService } from "@/app/lib/services/vendor.service";

import { requireAuth } from "@/app/lib/auth/guards";
import { handleApiError } from "@/app/lib/auth/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* -------------------------------------------------------------------------- */
/*                          GET BANK ACCOUNT                                  */
/* -------------------------------------------------------------------------- */

export async function GET() {
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

/* -------------------------------------------------------------------------- */
/*                     CREATE / UPDATE BANK ACCOUNT                           */
/* -------------------------------------------------------------------------- */

export async function POST(
  req: NextRequest
) {
  try {
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
import {
  NextRequest,
  NextResponse,
} from "next/server";

import { CartService } from "@/app/lib/services/cart.service";

import {
  handleApiError,
  requireAuth,
} from "@/app/lib/auth/api";
import { verifyOrigin } from "@/app/lib/auth/csrf";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = withApiLogging(
  async (req: NextRequest) => {
    try {
      verifyOrigin(req);

      const session =
        await requireAuth();

      const guestCart =
        await req.json();

      await CartService.mergeGuestCart(
        session.user.id,
        guestCart
      );

      return NextResponse.json(
        {
          success: true,
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
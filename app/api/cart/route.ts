import { NextRequest, NextResponse } from "next/server";

import { CartService } from "@/app/lib/services/cart.service";

import {
  handleApiError,
  requireAuth,
} from "@/app/lib/auth/api";
import { verifyOrigin } from "@/app/lib/auth/csrf";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* -------------------------------------------------------------------------- */
/*                                GET CART                                    */
/* -------------------------------------------------------------------------- */

export const GET = withApiLogging(
  async () => {
    try {
      const session =
        await requireAuth();

      const cart =
        await CartService.getCart(
          session.user.id
        );

      return NextResponse.json(
        {
          success: true,
          ...cart,
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
/*                              ADD TO CART                                   */
/* -------------------------------------------------------------------------- */

export const POST = withApiLogging(
  async (req: NextRequest) => {
    try {
      verifyOrigin(req);

      const session =
        await requireAuth();

      const body =
        await req.json();

      const cart =
        await CartService.addToCart(
          session.user.id,
          body
        );

      return NextResponse.json(
        {
          success: true,
          ...cart,
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
import {
  NextRequest,
  NextResponse,
} from "next/server";

import { CartService } from "@/app/lib/services/cart.service";

import {
  requireAuth,
  handleApiError,
} from "@/app/lib/auth/api";
import { verifyOrigin } from "@/app/lib/auth/csrf";

import {
  cartItemUpdateSchema,
  cartItemDeleteSchema,
} from "@/app/lib/schemas/cart";

import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* -------------------------------------------------------------------------- */
/*                           UPDATE CART ITEM                                 */
/* -------------------------------------------------------------------------- */

export const PATCH = withApiLogging(
  async (req: NextRequest) => {
    try {
      verifyOrigin(req);

      const session =
        await requireAuth();

      const parsed =
        cartItemUpdateSchema.safeParse(
          await req.json()
        );

      if (!parsed.success) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid request payload.",
            errors:
              parsed.error.format(),
          },
          {
            status: 400,
          }
        );
      }

      const {
        id,
        qty,
      } = parsed.data;

      await CartService.updateCartItem(
        session.user.id,
        String(id),
        qty
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

/* -------------------------------------------------------------------------- */
/*                           DELETE CART ITEM                                 */
/* -------------------------------------------------------------------------- */

export const DELETE = withApiLogging(
  async (req: NextRequest) => {
    try {
      verifyOrigin(req);

      const session =
        await requireAuth();

      const parsed =
        cartItemDeleteSchema.safeParse(
          await req.json()
        );

      if (!parsed.success) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid request payload.",
            errors:
              parsed.error.format(),
          },
          {
            status: 400,
          }
        );
      }

      const { id } =
        parsed.data;

      await CartService.deleteCartItem(
        session.user.id,
        String(id)
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
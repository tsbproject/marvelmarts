import { NextRequest, NextResponse } from "next/server";

import { CartService } from "@/app/lib/services/cart.service";

import { requireAuth } from "@/app/lib/auth/guards";
import { handleApiError } from "@/app/lib/auth/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* -------------------------------------------------------------------------- */
/*                                GET CART                                    */
/* -------------------------------------------------------------------------- */

export async function GET() {
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

/* -------------------------------------------------------------------------- */
/*                              ADD TO CART                                   */
/* -------------------------------------------------------------------------- */

export async function POST(
  req: NextRequest
) {
  try {
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
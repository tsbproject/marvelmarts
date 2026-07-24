import {
  NextRequest,
  NextResponse,
} from "next/server";

import { CartService } from "@/app/lib/services/cart.service";

import { handleApiError, requireAuth } from "@/app/lib/auth/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest
) {
  try {
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
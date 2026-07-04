import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/app/lib/prisma";

import { requireAuth } from "@/app/lib/auth/guards";
import { handleApiError } from "@/app/lib/auth/api";
import {
  forbidden,
  notFound,
} from "@/app/lib/auth/errors";

import {
  cartItemUpdateSchema,
  cartItemDeleteSchema,
} from "@/app/lib/schemas/cart";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* -------------------------------------------------------------------------- */
/*                           UPDATE CART ITEM                                 */
/* -------------------------------------------------------------------------- */

export async function PATCH(
  req: NextRequest
) {
  try {
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

    const { id, qty } =
      parsed.data;

    const cartItem =
      await prisma.cartItem.findUnique({
        where: {
          id: String(id),
        },
        include: {
          cart: true,
        },
      });

    if (!cartItem) {
      throw notFound(
        "Cart item not found."
      );
    }

    if (
      cartItem.cart.userId !==
      session.user.id
    ) {
      throw forbidden(
        "You do not have access to this cart item."
      );
    }

    await prisma.cartItem.update({
      where: {
        id: cartItem.id,
      },
      data: {
        qty,
      },
    });

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

/* -------------------------------------------------------------------------- */
/*                           DELETE CART ITEM                                 */
/* -------------------------------------------------------------------------- */

export async function DELETE(
  req: NextRequest
) {
  try {
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

    const cartItem =
      await prisma.cartItem.findUnique({
        where: {
          id: String(id),
        },
        include: {
          cart: true,
        },
      });

    if (!cartItem) {
      throw notFound(
        "Cart item not found."
      );
    }

    if (
      cartItem.cart.userId !==
      session.user.id
    ) {
      throw forbidden(
        "You do not have access to this cart item."
      );
    }

    await prisma.cartItem.delete({
      where: {
        id: cartItem.id,
      },
    });

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
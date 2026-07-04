import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/app/lib/prisma";

import { requireAuth } from "@/app/lib/auth/guards";
import { handleApiError } from "@/app/lib/auth/api";
import { badRequest } from "@/app/lib/auth/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface GuestCartItem {
  productId: string;
  variantId?: string | null;
  qty: number;
  unitPrice: number;
}

interface GuestCart {
  items: GuestCartItem[];
}

export async function POST(
  req: NextRequest
) {
  try {
    const session =
      await requireAuth();

    const guestCart: GuestCart =
      await req.json();

    if (
      !Array.isArray(guestCart.items)
    ) {
      throw badRequest(
        "Invalid cart payload."
      );
    }

    const cart =
      await prisma.cart.upsert({
        where: {
          userId: session.user.id,
        },
        create: {
          userId: session.user.id,
        },
        update: {},
      });

    for (const item of guestCart.items) {
      const existing =
        await prisma.cartItem.findFirst({
          where: {
            cartId: cart.id,
            productId: item.productId,
            variantId: item.variantId ?? null,
          },
        });

      if (existing) {
        await prisma.cartItem.update({
          where: {
            id: existing.id,
          },
          data: {
            qty: {
              increment: item.qty,
            },
          },
        });
      } else {
        await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId: item.productId,
            variantId: item.variantId ?? null,
            qty: item.qty,
            unitPrice: item.unitPrice,
          },
        });
      }
    }

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
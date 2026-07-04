import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { prisma } from "@/app/lib/prisma";

import { requireAuth } from "@/app/lib/auth/guards";
import { handleApiError } from "@/app/lib/auth/api";
import {
  badRequest,
  notFound,
} from "@/app/lib/auth/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface AddToCartBody {
  productId: string;
  variantId?: string | null;
  qty?: number;
}

/* -------------------------------------------------------------------------- */
/*                              HELPERS                                       */
/* -------------------------------------------------------------------------- */

function formatCart(cart: any) {
  return {
    id: cart.id,
    userId: cart.userId,
    items: cart.items.map((item: any) => ({
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      qty: item.qty,
      unitPrice: Number(item.unitPrice),

      product: item.product
        ? {
            ...item.product,
            price: Number(item.product.price),
            discountPrice: item.product.discountPrice
              ? Number(item.product.discountPrice)
              : null,
          }
        : null,

      variant: item.variant
        ? {
            id: item.variant.id,
            name: item.variant.name,
            stock: item.variant.stock,
          }
        : null,
    })),
  };
}

async function getOrCreateCart(
  userId: string
) {
  let cart =
    await prisma.cart.findUnique({
      where: {
        userId,
      },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });

  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        userId,
      },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });
  }

  return formatCart(cart);
}

/* -------------------------------------------------------------------------- */
/*                                GET CART                                    */
/* -------------------------------------------------------------------------- */

export async function GET() {
  try {
    const session =
      await requireAuth();

    const cart =
      await getOrCreateCart(
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

    const {
      productId,
      variantId,
      qty = 1,
    }: AddToCartBody =
      await req.json();

    if (!productId) {
      throw badRequest(
        "Product ID is required."
      );
    }

    const product =
      await prisma.product.findUnique({
        where: {
          id: productId,
        },
        include: {
          variants: variantId
            ? {
                where: {
                  id: variantId,
                },
              }
            : false,
        },
      });

    if (!product) {
      throw notFound(
        "Product not found."
      );
    }

    let unitPrice: Prisma.Decimal;
    let stock: number;

    if (variantId) {
      const variant =
        product.variants?.[0];

      if (!variant) {
        throw notFound(
          "Variant not found."
        );
      }

      unitPrice =
        variant.price ??
        product.discountPrice ??
        product.price;

      stock = variant.stock;
    } else {
      unitPrice =
        product.discountPrice ??
        product.price;

      stock = product.stock;
    }

    if (stock < qty) {
      throw badRequest(
        "Insufficient stock."
      );
    }

    const cart =
      await getOrCreateCart(
        session.user.id
      );

    const existingItem =
      await prisma.cartItem.findFirst({
        where: {
          cartId: cart.id,
          productId,
          variantId:
            variantId ?? null,
        },
      });

    if (existingItem) {
      await prisma.cartItem.update({
        where: {
          id: existingItem.id,
        },
        data: {
          qty:
            existingItem.qty +
            qty,
        },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          variantId:
            variantId ?? null,
          qty,
          unitPrice,
        },
      });
    }

    const updatedCart =
      await getOrCreateCart(
        session.user.id
      );

    return NextResponse.json(
      {
        success: true,
        ...updatedCart,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
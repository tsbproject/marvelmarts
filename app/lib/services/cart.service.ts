import { Prisma } from "@prisma/client";

import { prisma } from "@/app/lib/prisma";

import {
  badRequest,
  notFound,
  forbidden
} from "@/app/lib/auth/errors";

interface AddToCartInput {
  productId: string;
  variantId?: string | null;
  qty?: number;
}

export class CartService {
  /* -------------------------------------------------------------------------- */
  /*                               PRIVATE HELPERS                              */
  /* -------------------------------------------------------------------------- */

  private static formatCart(
    cart: any
  ) {
    return {
      id: cart.id,
      userId: cart.userId,

      items: cart.items.map(
        (item: any) => ({
          id: item.id,

          productId:
            item.productId,

          variantId:
            item.variantId,

          qty: item.qty,

          unitPrice: Number(
            item.unitPrice
          ),

          product: item.product
            ? {
                ...item.product,

                price: Number(
                  item.product.price
                ),

                discountPrice:
                  item.product
                    .discountPrice
                    ? Number(
                        item.product
                          .discountPrice
                      )
                    : null,
              }
            : null,

          variant: item.variant
            ? {
                id: item.variant.id,
                name:
                  item.variant.name,
                stock:
                  item.variant.stock,
              }
            : null,
        })
      ),
    };
  }

  private static async getOrCreateCart(
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
      cart =
        await prisma.cart.create({
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

    return this.formatCart(cart);
  }

  /* -------------------------------------------------------------------------- */
  /*                                GET CART                                    */
  /* -------------------------------------------------------------------------- */

  static async getCart(
    userId: string
  ) {
    return this.getOrCreateCart(
      userId
    );
  }

  /* -------------------------------------------------------------------------- */
  /*                              ADD TO CART                                   */
  /* -------------------------------------------------------------------------- */

  static async addToCart(
    userId: string,
    {
      productId,
      variantId,
      qty = 1,
    }: AddToCartInput
  ) {
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

    let unitPrice:
      Prisma.Decimal;

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

      stock =
        variant.stock;
    } else {
      unitPrice =
        product.discountPrice ??
        product.price;

      stock =
        product.stock;
    }

    if (stock < qty) {
      throw badRequest(
        "Insufficient stock."
      );
    }

    const cart =
      await this.getOrCreateCart(
        userId
      );

    const existingItem =
      await prisma.cartItem.findFirst({
        where: {
          cartId: cart.id,

          productId,

          variantId:
            variantId ??
            null,
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
            variantId ??
            null,

          qty,

          unitPrice,
        },
      });
    }

    return this.getOrCreateCart(
      userId
    );
  }


  static async mergeGuestCart(
  userId: string,
  guestCart: {
    items: {
      productId: string;
      variantId?: string | null;
      qty: number;
      unitPrice: number;
    }[];
  }
) {
  if (
    !Array.isArray(
      guestCart.items
    )
  ) {
    throw badRequest(
      "Invalid cart payload."
    );
  }

  const cart =
    await prisma.cart.upsert({
      where: {
        userId,
      },
      create: {
        userId,
      },
      update: {},
    });

  for (const item of guestCart.items) {
    const existing =
      await prisma.cartItem.findFirst({
        where: {
          cartId: cart.id,
          productId:
            item.productId,
          variantId:
            item.variantId ??
            null,
        },
      });

    if (existing) {
      await prisma.cartItem.update({
        where: {
          id: existing.id,
        },
        data: {
          qty: {
            increment:
              item.qty,
          },
        },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId:
            item.productId,
          variantId:
            item.variantId ??
            null,
          qty: item.qty,
          unitPrice:
            item.unitPrice,
        },
      });
    }
  }
}

static async updateCartItem(
  userId: string,
  itemId: string,
  qty: number
) {
  const cartItem =
    await prisma.cartItem.findUnique({
      where: {
        id: itemId,
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
    userId
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
}

static async deleteCartItem(
  userId: string,
  itemId: string
) {
  const cartItem =
    await prisma.cartItem.findUnique({
      where: {
        id: itemId,
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
    userId
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
}
}
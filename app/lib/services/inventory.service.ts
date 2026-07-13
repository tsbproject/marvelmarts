import { Prisma } from "@prisma/client";

export class InventoryService {
  /**
   * Reduce stock after a successful order.
   */
  static async decrementStock(
    tx: Prisma.TransactionClient,
    items: {
      productId: string;
      variantId?: string | null;
      quantity: number;
    }[]
  ) {
    for (const item of items) {
      if (item.variantId) {
        await tx.variant.update({
          where: {
            id: item.variantId,
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        await tx.product.update({
          where: {
            id: item.productId,
          },
          data: {
            salesCount: {
              increment: item.quantity,
            },
          },
        });
      } else {
        await tx.product.update({
          where: {
            id: item.productId,
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
            salesCount: {
              increment: item.quantity,
            },
          },
        });
      }
    }
  }

  /**
   * Increase stock.
   * Used for refunds, cancellations and manual adjustments.
   */
  static async incrementStock(
    tx: Prisma.TransactionClient,
    items: {
      productId: string;
      variantId?: string | null;
      quantity: number;
    }[]
  ) {
    for (const item of items) {
      if (item.variantId) {
        await tx.variant.update({
          where: {
            id: item.variantId,
          },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      } else {
        await tx.product.update({
          where: {
            id: item.productId,
          },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }
    }
  }

  /**
   * Adjust stock by a signed quantity.
   * Positive = add stock
   * Negative = remove stock
   */
  static async adjustStock(
    tx: Prisma.TransactionClient,
    productId: string,
    quantity: number,
    variantId?: string | null
  ) {
    if (variantId) {
      return tx.variant.update({
        where: {
          id: variantId,
        },
        data: {
          stock: {
            increment: quantity,
          },
        },
      });
    }

    return tx.product.update({
      where: {
        id: productId,
      },
      data: {
        stock: {
          increment: quantity,
        },
      },
    });
  }
}
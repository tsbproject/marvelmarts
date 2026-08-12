import { prisma } from "@/app/lib/prisma";
import { badRequest } from "@/app/lib/auth/errors";

export class WishlistService {
  static async getWishlist(
    userId: string
  ) {
    return prisma.wishlist.findMany({
      where: {
        userId,
      },
      include: {
        product: {
          include: {
            images: {
              take: 1,
              orderBy: {
                order: "asc",
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  static async toggleWishlist(
    userId: string,
    productId: string
  ) {
    const product =
      await prisma.product.findUnique({
        where: {
          id: productId,
        },
        select: {
          id: true,
        },
      });

    if (!product) {
      throw badRequest(
        "Product not found."
      );
    }

    const existing =
      await prisma.wishlist.findUnique({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
      });

    if (existing) {
      await prisma.wishlist.delete({
        where: {
          id: existing.id,
        },
      });

      return "removed";
    }

    await prisma.wishlist.create({
      data: {
        userId,
        productId,
      },
    });

    return "added";
  }

  static async removeWishlistItem(
  userId: string,
  id: string
) {
  let deletion =
    await prisma.wishlist.deleteMany({
      where: {
        id,
        userId,
      },
    });

  if (deletion.count === 0) {
    deletion =
      await prisma.wishlist.deleteMany({
        where: {
          productId: id,
          userId,
        },
      });
  }

  return deletion.count > 0;
}


/* -------------------------------------------------------------------------- */
/*                    CUSTOMER WISHLIST PAGE SECTION                          */
/* -------------------------------------------------------------------------- */

static async getCustomerWishlist(
  userId: string
) {
  return prisma.wishlist.findMany({
    where: {
      userId,
    },
    include: {
      product: {
        include: {
          images: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
}
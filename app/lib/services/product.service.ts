import { prisma } from "@/app/lib/prisma";
import { Prisma } from "@prisma/client";
import {
  badRequest,
  forbidden,
  notFound,
} from "@/app/lib/auth/errors";

export class ProductService {
  static async getVendorProfile(userId: string) {
    return prisma.vendorProfile.findUnique({
      where: {
        userId,
      },

      select: {
        id: true,
        isSuspended: true,
      },
    });
  }

  static async getProduct(
    id: string
  ) {
    return prisma.product.findUnique({
      where: {
        id,
      },

      include: {
        category: true,

        categories: true,

        images: {
          orderBy: {
            order: "asc",
          },
        },

        variants: true,

        vendorProfile: true,
      },
    });
  }

  static async listProducts(
    vendorProfileId?: string
  ) {
    return prisma.product.findMany({
      where: {
        vendorProfileId,
      },

      include: {
        category: true,

        categories: true,

        images: {
          orderBy: {
            order: "asc",
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });
  }

  static async createProduct({
  vendorId,
  data,
  slug,
  parsedTags,
  parsedCategoryIds,
  imageUrls,
  variants,
}: {
  vendorId: string;
  data: any;
  slug: string;
  parsedTags: string[];
  parsedCategoryIds: string[];
  imageUrls: string[];
  variants: any[];
}) {
  return prisma.$transaction(async (tx) => {
    const product =
      await tx.product.create({
        data: {
          title: data.title,

          slug,

          tags: parsedTags,

          sku: data.sku || null,

          description: data.description,

          brand: data.brand,

          price: new Prisma.Decimal(
            data.price.toString()
          ),

          discountPrice:
            data.discountPrice
              ? new Prisma.Decimal(
                  data.discountPrice.toString()
                )
              : null,

          stock: data.stock,

          status: data.status,

          metaTitle: data.metaTitle,

          metaDescription:
            data.metaDescription,

          isFeatured:
            data.isFeatured ?? false,

          isFlashSale:
            data.isFlashSale ?? false,

          isNewArrival:
            data.isNewArrival ?? false,

          shippingMethod:
            data.shippingMethod,

          weight: data.weight,

          vendorProfile: {
            connect: {
              id: vendorId,
            },
          },

          category:
            parsedCategoryIds[0] ||
            data.categoryId
              ? {
                  connect: {
                    id:
                      parsedCategoryIds[0] ||
                      data.categoryId,
                  },
                }
              : undefined,

          categories:
            parsedCategoryIds.length
              ? {
                  connect:
                    parsedCategoryIds.map(
                      (id) => ({ id })
                    ),
                }
              : undefined,

          images: {
            create:
              imageUrls.map(
                (url, index) => ({
                  url,
                  order: index,
                  alt: data.title,
                })
              ),
          },

          variants: {
            create:
              variants.map((v: any) => ({
                name: v.name,

                sku:
                  v.sku ||
                  `${slug}-${Math.random()
                    .toString(36)
                    .substring(7)}`,

                price: v.price
                  ? new Prisma.Decimal(
                      v.price.toString()
                    )
                  : null,

                stock:
                  Number(v.stock) || 0,

                attributes:
                  v.attributes || {
                    name: v.name,
                  },
              })),
          },
        },
      });

    await tx.vendorOnboarding.updateMany({
      where: {
        vendorProfileId: vendorId,
      },

      data: {
        productDone: true,
      },
    });

    return product;
  });
}

static async updateProduct({
  productId,
  data,
  parsedTags,
  parsedCategoryIds,
  deletedImageIds,
  newImageOperations,
  variants,
}: {
  productId: string;
  data: any;
  parsedTags: string[];
  parsedCategoryIds: string[];
  deletedImageIds: string[];
  newImageOperations: Prisma.ProductImageCreateWithoutProductInput[];
  variants: any[];
}) {
  return prisma.$transaction(async (tx) => {
    if (deletedImageIds.length > 0) {
      await tx.productImage.deleteMany({
        where: {
          id: {
            in: deletedImageIds,
          },
        },
      });
    }

    await tx.variant.deleteMany({
      where: {
        productId,
      },
    });

    return tx.product.update({
      where: {
        id: productId,
      },

      data: {
        title: data.title,

        sku: data.sku || null,

        description: data.description,

        brand: data.brand || null,

        price: new Prisma.Decimal(
          data.price.toString()
        ),

        discountPrice:
          data.discountPrice != null
            ? new Prisma.Decimal(
                data.discountPrice.toString()
              )
            : null,

        stock: data.stock,

        tags: parsedTags,

        status: data.status,

        metaTitle:
          data.metaTitle || null,

        metaDescription:
          data.metaDescription || null,

        isFeatured:
          data.isFeatured ?? false,

        isFlashSale:
          data.isFlashSale ?? false,

        isNewArrival:
          data.isNewArrival ?? false,

        shippingMethod:
          data.shippingMethod || null,

        weight:
          data.weight ?? null,

        category:
          parsedCategoryIds[0] ||
          data.categoryId
            ? {
                connect: {
                  id:
                    parsedCategoryIds[0] ??
                    data.categoryId,
                },
              }
            : {
                disconnect: true,
              },

        categories: {
          set:
            parsedCategoryIds.map(
              (id) => ({
                id,
              })
            ),
        },

        images:
          newImageOperations.length
            ? {
                create:
                  newImageOperations,
              }
            : undefined,

        variants: {
          create:
            variants.map(
              (variant) => ({
                name:
                  variant.name,

                sku:
                  variant.sku ||
                  `${data.sku || "sku"}-${Math.random()
                    .toString(36)
                    .substring(2, 8)}`,

                price:
                  variant.price != null
                    ? new Prisma.Decimal(
                        variant.price.toString()
                      )
                    : null,

                stock:
                  Number(
                    variant.stock
                  ) || 0,

                attributes:
                  variant.attributes || {
                    name:
                      variant.name,
                  },
              })
            ),
        },
      },

      include: {
        category: true,

        categories: true,

        images: {
          orderBy: {
            order: "asc",
          },
        },

        variants: true,
      },
    });
  });
}

static async deleteProduct(
  productId: string
) {
  return prisma.$transaction(async (tx) => {
    const product =
      await tx.product.findUnique({
        where: {
          id: productId,
        },
        include: {
          images: true,
        },
      });

    if (!product) {
      throw notFound(
        "Product not found."
      );
    }

    await tx.productImage.deleteMany({
      where: {
        productId,
      },
    });

    await tx.variant.deleteMany({
      where: {
        productId,
      },
    });

    await tx.product.delete({
      where: {
        id: productId,
      },
    });

    return product;
  });
}

static async getVendorProducts(
      vendorProfileId: string
    ) {
      return prisma.product.findMany({
        where: {
          vendorProfileId,
        },
        include: {
          category: {
            select: {
              name: true,
            },
          },
          images: {
            select: {
              url: true,
            },
            take: 1,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    static async getProductByIdOrThrow(
        productId: string
      ) {
        const product =
          await prisma.product.findUnique({
            where: {
              id: productId,
            },
            select: {
              id: true,
              vendorProfileId: true,
            },
          });

        if (!product) {
          throw notFound(
            "Product not found."
          );
        }

        return product;
      }


      static async deleteProductById(
        productId: string
      ) {
        return prisma.product.delete({
          where: {
            id: productId,
          },
        });
      }


      static async createProductReview(
      userId: string,
      data: {
        productId: string;
        rating: number;
        body?: string;
      }
    ) {
      const {
        productId,
        rating,
        body,
      } = data;

      if (!productId) {
        throw badRequest(
          "Product is required."
        );
      }

      if (
        rating < 1 ||
        rating > 5
      ) {
        throw badRequest(
          "Rating must be between 1 and 5."
        );
      }

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
        throw notFound(
          "Product not found."
        );
      }

      const purchased =
        await prisma.order.findFirst({
          where: {
            userId,
            status: "DELIVERED",
            items: {
              some: {
                productId,
              },
            },
          },
          select: {
            id: true,
          },
        });

      return prisma.review.create({
        data: {
          productId,
          userId,
          rating,
          body,
          isVerified: !!purchased,
          approved: true,
        },
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      });
    }


    static async bulkApproveReviews(
      ids: string[],
      approved: boolean
    ) {
      if (
        !Array.isArray(ids) ||
        ids.length === 0
      ) {
        throw badRequest(
          "At least one review must be selected."
        );
      }

      if (
        typeof approved !==
        "boolean"
      ) {
        throw badRequest(
          "Approved flag is required."
        );
      }

      const result =
        await prisma.review.updateMany({
          where: {
            id: {
              in: ids,
            },
          },
          data: {
            approved,
          },
        });

      return result.count;
    }

    static async bulkDeleteReviews(
      ids: string[]
    ) {
      if (
        !Array.isArray(ids) ||
        ids.length === 0
      ) {
        throw badRequest(
          "At least one review must be selected."
        );
      }

      const result =
        await prisma.review.deleteMany({
          where: {
            id: {
              in: ids,
            },
          },
        });

      return result.count;
    }


    static async updateReviewApproval(
      reviewId: string,
      approved: boolean
    ) {
      if (
        typeof approved !==
        "boolean"
      ) {
        throw badRequest(
          "Approved status is required."
        );
      }

      const review =
        await prisma.review.findUnique({
          where: {
            id: reviewId,
          },
          select: {
            id: true,
          },
        });

      if (!review) {
        throw notFound(
          "Review not found."
        );
      }

      return prisma.review.update({
        where: {
          id: reviewId,
        },
        data: {
          approved,
        },
      });
    }

    static async deleteReview(
      reviewId: string
    ) {
      const review =
        await prisma.review.findUnique({
          where: {
            id: reviewId,
          },
          select: {
            id: true,
          },
        });

      if (!review) {
        throw notFound(
          "Review not found."
        );
      }

      await prisma.review.delete({
        where: {
          id: reviewId,
        },
      });
    }
}
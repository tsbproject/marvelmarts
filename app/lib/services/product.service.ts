import { prisma } from "@/app/lib/prisma";
import { Prisma } from "@prisma/client";
import { deleteFromCloudinary } from "@/app/lib/cloudinary";
import {
  badRequest,
  forbidden,
  notFound
} from "@/app/lib/auth/errors";
import { AuditService } from "@/app/lib/services/logging/audit.service";

export class ProductService {


//PRIVATE HELPERS SECTION
private static async getVendorProfileId(
  userId: string
) {
  const vendor =
    await prisma.vendorProfile.findUnique({
      where: {
        userId,
      },
      select: {
        id: true,
      },
    });

  return vendor?.id ?? null;
}


private static async validateProductOwnership(
  userId: string,
  role: string,
  vendorProfileId: string
) {
  if (
    role === "ADMIN" ||
    role === "SUPER_ADMIN"
  ) {
    return;
  }

  const currentVendorProfileId =
    await this.getVendorProfileId(userId);

  if (
    currentVendorProfileId !==
    vendorProfileId
  ) {
    throw forbidden(
      "You do not have permission to modify this product."
    );
  }
}


    //QUERIES SECTION 
 static async getProductBySlug(
    slug: string,
    options?: {
      includeUnavailable?: boolean;
    }
  ) {
  const product =
    await prisma.product.findUnique({
      where: {
        slug,
      },
      include: {
        category: true,

        images: {
          orderBy: {
            order: "asc",
          },
        },

        variants: true,

        vendorProfile: {
          include: {
            store: {
              select: {
                slug: true,
              },
            },
          },
        },

        reviews: {
          where: {
            approved: true,
          },

          include: {
            user: {
              select: {
                name: true,
                orders: {
                  where: {
                    items: {
                      some: {
                        productId: {
                          not: undefined,
                        },
                      },
                    },
                    status: "DELIVERED",
                  },

                  select: {
                    items: {
                      select: {
                        productId: true,
                      },
                    },
                  },
                },
              },
            },
          },

          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

  if (!product) {
    throw notFound(
      "Product not found."
    );
  }

  if (
    product.vendorProfile.isSuspended ||
    product.vendorProfile.status !== "APPROVED"
  ) {
    if (!options?.includeUnavailable) {
      throw forbidden("Product is unavailable.");
    }
  }

  return product;
}



//COMMAND SECTION 
static async updateProductBySlug(
  slug: string,
  userId: string,
  role: string,
  data: any
) {
  const existingProduct =
    await prisma.product.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
        vendorProfileId: true,
        title: true,
        description: true,
        brand: true,
        price: true,
        discountPrice: true,
        categoryId: true,
        status: true,
        isFeatured: true,
        metaTitle: true,
        metaDescription: true,
      },
    });

  if (!existingProduct) {
    throw notFound(
      "Product not found."
    );
  }

  await this.validateProductOwnership(
    userId,
    role,
    existingProduct.vendorProfileId
  );

  const updatedProduct =
    await prisma.product.update({
      where: {
        slug,
      },
      data: {
        title: data.title,
        description: data.description,
        brand: data.brand,
        price: data.price,
        discountPrice:
          data.discountPrice,
        categoryId:
          data.categoryId,
        status: data.status,
        isFeatured:
          data.isFeatured,
        metaTitle:
          data.metaTitle ||
          data.title,
        metaDescription:
          data.metaDescription ||
          data.description?.substring(
            0,
            160
          ),
      },
      include: {
        images: {
          orderBy: {
            order: "asc",
          },
        },
        category: true,
        variants: {
          orderBy: {
            name: "asc",
          },
        },
      },
    });

  await AuditService.productUpdated({
    actorId: userId,
    entityId: updatedProduct.id,
    oldValues: {
      title: existingProduct.title,
      description:
        existingProduct.description,
      brand: existingProduct.brand,
      price: existingProduct.price,
      discountPrice:
        existingProduct.discountPrice,
      categoryId:
        existingProduct.categoryId,
      status: existingProduct.status,
      isFeatured:
        existingProduct.isFeatured,
      metaTitle:
        existingProduct.metaTitle,
      metaDescription:
        existingProduct.metaDescription,
    },
    newValues: {
      title: updatedProduct.title,
      description:
        updatedProduct.description,
      brand: updatedProduct.brand,
      price: updatedProduct.price,
      discountPrice:
        updatedProduct.discountPrice,
      categoryId:
        updatedProduct.categoryId,
      status: updatedProduct.status,
      isFeatured:
        updatedProduct.isFeatured,
      metaTitle:
        updatedProduct.metaTitle,
      metaDescription:
        updatedProduct.metaDescription,
    },
  });

  return updatedProduct;
}

static async deleteProductBySlug(
  slug: string,
  userId: string,
  role: string
) {
  const existingProduct =
    await prisma.product.findUnique({
      where: {
        slug,
      },
      include: {
        images: true,
      },
    });

  if (!existingProduct) {
    throw notFound(
      "Product not found."
    );
  }

  await this.validateProductOwnership(
    userId,
    role,
    existingProduct.vendorProfileId
  );

  await prisma.$transaction(
    async (tx) => {
      await tx.productImage.deleteMany({
        where: {
          productId:
            existingProduct.id,
        },
      });

      await tx.variant.deleteMany({
        where: {
          productId:
            existingProduct.id,
        },
      });

      await tx.product.delete({
        where: {
          id: existingProduct.id,
        },
      });
    }
  );

  await Promise.allSettled(
    existingProduct.images.map(
      async (image) => {
        try {
          await deleteFromCloudinary(
            image.url
          );
        } catch {}
      }
    )
  );

  await AuditService.productDeleted({
    actorId: userId,
    entityId: existingProduct.id,
    oldValues: existingProduct,
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
  userId,
  vendorId,
  data,
  slug,
  parsedTags,
  parsedCategoryIds,
  imageUrls,
  variants,
}: {
  userId: string;
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


    await AuditService.productCreated({
      actorId: userId,
      entityId: product.id,
      newValues: product,
    });

        return product;
      });
    }

static async updateProduct({
  userId,
  productId,
  data,
  parsedTags,
  parsedCategoryIds,
  deletedImageIds,
  newImageOperations,
  variants,
}: {
  userId: string;
  productId: string;
  data: any;
  parsedTags: string[];
  parsedCategoryIds: string[];
  deletedImageIds: string[];
  newImageOperations: Prisma.ProductImageCreateWithoutProductInput[];
  variants: any[];
}) {
  const {
    existing,
    product,
    deletedImageUrls,
  } = await prisma.$transaction(async (tx) => {
    const existing =
      await tx.product.findUnique({
        where: {
          id: productId,
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

    if (!existing) {
      throw notFound(
        "Product not found."
      );
    }

    /*
     * Capture the Cloudinary URLs BEFORE deleting
     * the ProductImage records.
     *
     * Only images belonging to this product are considered.
     */
    let deletedImageUrls: string[] = [];

    if (deletedImageIds.length > 0) {
      const imagesToDelete =
        await tx.productImage.findMany({
          where: {
            id: {
              in: deletedImageIds,
            },
            productId,
          },
          select: {
            id: true,
            url: true,
          },
        });

      deletedImageUrls =
        imagesToDelete
          .map((image) => image.url)
          .filter(Boolean);

      await tx.productImage.deleteMany({
        where: {
          id: {
            in: imagesToDelete.map(
              (image) => image.id
            ),
          },
          productId,
        },
      });
    }

    /*
     * Recreate variants from the submitted state.
     */
    await tx.variant.deleteMany({
      where: {
        productId,
      },
    });

    const product =
      await tx.product.update({
        where: {
          id: productId,
        },

        data: {
          title: data.title,

          sku: data.sku || null,

          description:
            data.description,

          brand:
            data.brand || null,

          price:
            new Prisma.Decimal(
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

          /*
           * Newly uploaded images are already
           * in Cloudinary at this point.
           */
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
                    `${
                      data.sku ||
                      "sku"
                    }-${Math.random()
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
                    variant.attributes ||
                    {
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

    return {
      existing,
      product,
      deletedImageUrls,
    };
  });

  /*
   * Database update succeeded.
   *
   * Cloudinary cleanup happens AFTER the transaction so
   * a Cloudinary failure cannot roll back a valid product
   * update.
   */
  if (deletedImageUrls.length > 0) {
    await Promise.allSettled(
      deletedImageUrls.map(
        async (url) => {
          try {
            await deleteFromCloudinary(
              url
            );
          } catch (error) {
            console.error(
              "PRODUCT_IMAGE_CLOUDINARY_DELETE_FAILED:",
              {
                productId,
                url,
                error,
              }
            );
          }
        }
      )
    );
  }

  await AuditService.productUpdated({
    actorId: userId,
    entityId: product.id,
    oldValues: existing,
    newValues: product,
  });

  return product;
}






static async deleteProduct(
  userId: string,
  productId: string
) {
  const product =
    await prisma.$transaction(
      async (tx) => {
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

        /*
         * Delete all database image records first.
         *
         * The image URLs remain available on the
         * `product` object returned from the transaction,
         * allowing Cloudinary cleanup after the transaction
         * succeeds.
         */
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
      }
    );

  /*
   * Database deletion succeeded.
   *
   * Now clean up the corresponding Cloudinary assets.
   * Cloudinary failure must not undo a successful database
   * deletion.
   */
  const imageUrls =
    product.images
      .map((image) => image.url)
      .filter(Boolean);

  if (imageUrls.length > 0) {
    await Promise.allSettled(
      imageUrls.map(
        async (url) => {
          try {
            await deleteFromCloudinary(
              url
            );
          } catch (error) {
            console.error(
              "PRODUCT_IMAGE_CLOUDINARY_DELETE_FAILED:",
              {
                productId,
                url,
                error,
              }
            );
          }
        }
      )
    );
  }

  await AuditService.productDeleted({
    actorId: userId,
    entityId: product.id,
    oldValues: product,
  });

  return product;
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
  productId: string,
  vendorProfileId: string,
  actorId: string
) {
  const product =
    await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

  if (!product) {
    throw notFound(
      "Product not found."
    );
  }

  if (
    product.vendorProfileId !==
    vendorProfileId
  ) {
    throw forbidden(
      "You do not have permission to delete this product."
    );
  }

  const deletedProduct =
    await prisma.product.delete({
      where: {
        id: productId,
      },
    });

  await AuditService.productDeleted({
    actorId,
    entityId: product.id,
    oldValues: product,
  });

  return deletedProduct;
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

  const existingReview =
    await prisma.review.findFirst({
      where: {
        userId,
        productId,
      },
      select: {
        id: true,
      },
    });

  if (existingReview) {
    throw badRequest(
      "You have already reviewed this product."
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
  approved: boolean,
  actorId: string
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
    typeof approved !== "boolean"
  ) {
    throw badRequest(
      "Approved flag is required."
    );
  }

  if (!actorId) {
    throw badRequest(
      "Audit actor is required."
    );
  }

  const reviews =
    await prisma.review.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      select: {
        id: true,
        approved: true,
      },
    });

  if (reviews.length === 0) {
    throw notFound(
      "No matching reviews found."
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

  await AuditService.reviewsBulkApprovalChanged({
    actorId,
    oldValues: {
      approved: reviews.map(
        (review) => ({
          reviewId: review.id,
          approved: review.approved,
        })
      ),
    },
    newValues: {
      approved: reviews.map(
        (review) => ({
          reviewId: review.id,
          approved,
        })
      ),
      count: result.count,
    },
  });

  return result.count;
}

static async bulkDeleteReviews(
  ids: string[],
  actorId: string
) {
  if (
    !Array.isArray(ids) ||
    ids.length === 0
  ) {
    throw badRequest(
      "At least one review must be selected."
    );
  }

  if (!actorId) {
    throw badRequest(
      "Audit actor is required."
    );
  }

  const reviews =
    await prisma.review.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      select: {
        id: true,
        userId: true,
        productId: true,
        rating: true,
        body: true,
        approved: true,
        isVerified: true,
      },
    });

  if (reviews.length === 0) {
    throw notFound(
      "No matching reviews found."
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

  await AuditService.reviewsBulkDeleted({
    actorId,
    oldValues: {
      reviews,
      count: result.count,
    },
    newValues: {
      deleted: true,
      count: result.count,
    },
  });

  return result.count;
}

static async updateReviewApproval(
  reviewId: string,
  approved: boolean,
  actorId: string
) {
  if (
    typeof approved !== "boolean"
  ) {
    throw badRequest(
      "Approved status is required."
    );
  }

  if (!actorId) {
    throw badRequest(
      "Audit actor is required."
    );
  }

  const review =
    await prisma.review.findUnique({
      where: {
        id: reviewId,
      },
      select: {
        id: true,
        approved: true,
      },
    });

  if (!review) {
    throw notFound(
      "Review not found."
    );
  }

  const updatedReview =
    await prisma.review.update({
      where: {
        id: reviewId,
      },
      data: {
        approved,
      },
    });

  await AuditService.reviewApprovalChanged({
    actorId,
    entityId: review.id,
    oldValues: {
      approved: review.approved,
    },
    newValues: {
      approved:
        updatedReview.approved,
    },
  });

  return updatedReview;
}

  static async deleteReviewBySlug(
  slug: string,
  reviewId: string,
  userId: string,
  role: string
) {
  const product =
    await prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    });

  if (!product) {
    throw notFound("Product not found.");
  }

  const review =
    await prisma.review.findUnique({
      where: {
        id: reviewId,
      },
      select: {
        id: true,
        userId: true,
        productId: true,
        rating: true,
        body: true,
        approved: true,
        isVerified: true,
      },
    });

  if (
    !review ||
    review.productId !== product.id
  ) {
    throw notFound("Review not found.");
  }

  const isAdmin =
    role === "ADMIN" ||
    role === "SUPER_ADMIN";

  if (
    !isAdmin &&
    review.userId !== userId
  ) {
    throw forbidden(
      "You do not have permission to delete this review."
    );
  }

  await prisma.review.delete({
    where: {
      id: review.id,
    },
  });

  await AuditService.reviewDeleted({
    actorId: userId,
    entityId: review.id,
    oldValues: {
      productId: review.productId,
      userId: review.userId,
      rating: review.rating,
      body: review.body,
      approved: review.approved,
      isVerified: review.isVerified,
    },
  });
}


static async deleteReview(
  reviewId: string,
  actorId: string
) {
  if (!actorId) {
    throw badRequest(
      "Audit actor is required."
    );
  }

  const review =
    await prisma.review.findUnique({
      where: {
        id: reviewId,
      },
      select: {
        id: true,
        userId: true,
        productId: true,
        rating: true,
        body: true,
        approved: true,
        isVerified: true,
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

  await AuditService.reviewDeleted({
    actorId,
    entityId: review.id,
    oldValues: review,
    newValues: {
      deleted: true,
    },
  });
}

  static async expireBoostedProducts() {
  const now = new Date();

  const result = await prisma.product.updateMany({
    where: {
      boostUntil: {
        lt: now,
      },
      isTrending: true,
    },
    data: {
      isTrending: false,
    },
  });

  return {
    processed: result.count,
    timestamp: now,
  };
}

static async getTrendingProducts() {
  return prisma.product.findMany({
    where: {
      isTrending: true,
      status: "ACTIVE",
      vendorProfile: {
        isSuspended: false,
        status: "APPROVED",
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 10,
    select: {
      id: true,
      title: true,
      slug: true,
      price: true,
      discountPrice: true,
      stock: true,
      images: {
        orderBy: {
          order: "asc",
        },
        take: 1,
        select: {
          url: true,
          alt: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}


static async search(
  query: string
) {
  const [products, categories, vendors] =
    await Promise.all([
      prisma.product.findMany({
        where: {
          status: "ACTIVE",
          isPublished: true,
          vendorProfile: {
            isSuspended: false,
            status: "APPROVED",
          },
          OR: [
            {
              title: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              description: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              sku: {
                contains: query,
                mode: "insensitive",
              },
            },
          ],
        },
        include: {
          images: {
            take: 1,
            orderBy: {
              order: "asc",
            },
          },
          vendorProfile: {
            select: {
              id: true,
              storeName: true,
              logoUrl: true,
              isVerified: true,
            },
          },
        },
        orderBy: [
          {
            boostUntil: {
              sort: "desc",
              nulls: "last",
            },
          },
          {
            createdAt: "desc",
          },
        ],
        take: 10,
      }),

      prisma.category.findMany({
        where: {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
        orderBy: {
          name: "asc",
        },
        take: 4,
      }),

      prisma.vendorProfile.findMany({
        where: {
          isSuspended: false,
          status: "APPROVED",
          OR: [
            {
              storeName: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              id: {
                equals: query,
              },
            },
          ],
        },
        select: {
          id: true,
          storeName: true,
          logoUrl: true,
          isVerified: true,
        },
        take: 3,
      }),
    ]);

  return {
    products,
    categories,
    vendors,
  };
}


static async bulkToggleProductFlag({
  ids = [],
  updateType,
  applyToAll = false,
  filters,
  actorId,
}: {
  ids: string[];
  updateType: string;
  applyToAll?: boolean;
  filters?: any;
  actorId: string;
}) {
  const fieldMapping = {
    isFeatured: "isFeatured",
    isFlashSale: "isFlashSale",
    isNew: "isNewArrival",
    isNewArrival: "isNewArrival",
  } as const;

  const dbField =
    fieldMapping[
      updateType as keyof typeof fieldMapping
    ];

  if (!dbField) {
    throw badRequest("Invalid update type.");
  }

  if (!actorId) {
    throw badRequest("Audit actor is required.");
  }

  let targetIds: string[] = [];

  if (applyToAll && filters) {
    const where: Record<string, unknown> = {};

    if (filters.search) {
      const searchConstraint = {
        contains: filters.search,
        mode: "insensitive" as const,
      };

      switch (filters.searchType) {
        case "title":
          where.title = searchConstraint;
          break;

        case "category":
          where.category = {
            name: searchConstraint,
          };
          break;

        case "vendor":
          where.vendorProfile = {
            storeName: searchConstraint,
          };
          break;

        default:
          where.OR = [
            {
              title: searchConstraint,
            },
            {
              category: {
                name: searchConstraint,
              },
            },
            {
              vendorProfile: {
                storeName: searchConstraint,
              },
            },
          ];
      }
    }

    if (filters.filter === "featured") {
      where.isFeatured = true;
    }

    if (filters.filter === "new") {
      where.isNewArrival = true;
    }

    if (filters.filter === "flash") {
      where.isFlashSale = true;
    }

    const products =
      await prisma.product.findMany({
        where,
        select: {
          id: true,
        },
      });

    targetIds = products.map(
      (product) => product.id
    );
  } else {
    targetIds = ids;
  }

  if (targetIds.length === 0) {
    throw badRequest("No products selected.");
  }

  const currentProducts =
    await prisma.product.findMany({
      where: {
        id: {
          in: targetIds,
        },
      },
      select: {
        id: true,
        isFeatured: true,
        isFlashSale: true,
        isNewArrival: true,
      },
    });

  if (currentProducts.length === 0) {
    throw notFound("No matching products found.");
  }

  const changes = currentProducts.map(
    (product) => {
      let oldValue = false;

      switch (dbField) {
        case "isFeatured":
          oldValue = product.isFeatured;
          break;

        case "isFlashSale":
          oldValue = product.isFlashSale;
          break;

        case "isNewArrival":
          oldValue = product.isNewArrival;
          break;
      }

      return {
        productId: product.id,
        oldValue,
        newValue: !oldValue,
      };
    }
  );

  await prisma.$transaction(
    changes.map((change) =>
      prisma.product.update({
        where: {
          id: change.productId,
        },
        data: {
          [dbField]: change.newValue,
        },
      })
    )
  );

  await AuditService.productFlagsBulkChanged({
    actorId,
    oldValues: {
      updateType,
      field: dbField,
      changes: changes.map((change) => ({
        productId: change.productId,
        value: change.oldValue,
      })),
    },
    newValues: {
      updateType,
      field: dbField,
      changes: changes.map((change) => ({
        productId: change.productId,
        value: change.newValue,
      })),
      count: changes.length,
    },
  });

  return {
    affectedIds: changes.map(
      (change) => change.productId
    ),
    count: changes.length,
  };
}

//SLUG/VARIANTS
static async getProductVariants(
  slug: string
) {
  const product = await prisma.product.findUnique({
    where: {
      slug,
    },
    include: {
      variants: {
        orderBy: {
          name: "asc",
        },
      },
    },
  });

  if (!product) {
    throw notFound("Product not found.");
  }

  return product.variants;
}

//COMMAND VARIANTS 
static async createVariant(
  productId: string,
  data: {
    name: string;
    price?: number;
    stock?: number;
    attributes?: Record<string, string>;
  },
  actorId: string
) {
  if (!actorId) {
    throw badRequest(
      "Audit actor is required."
    );
  }

  const variant =
    await prisma.variant.create({
      data: {
        name: data.name,
        price: data.price ?? 0,
        stock: data.stock ?? 0,
        attributes: data.attributes ?? {},
        productId,
      },
    });

  await AuditService.variantCreated({
    actorId,
    entityId: variant.id,
    newValues: {
      productId: variant.productId,
      name: variant.name,
      price: variant.price,
      stock: variant.stock,
      attributes: variant.attributes,
    },
  });

  return variant;
}


//DELETE VARIANTS
static async deleteVariant(
  variantId: string,
  actorId: string
) {
  if (!actorId) {
    throw badRequest(
      "Audit actor is required."
    );
  }

  const variant =
    await prisma.variant.findUnique({
      where: {
        id: variantId,
      },
    });

  if (!variant) {
    throw notFound(
      "Variant not found."
    );
  }

  await prisma.variant.delete({
    where: {
      id: variantId,
    },
  });

  await AuditService.variantDeleted({
    actorId,
    entityId: variant.id,
    oldValues: {
      productId: variant.productId,
      name: variant.name,
      price: variant.price,
      stock: variant.stock,
      attributes: variant.attributes,
    },
  });
}


//PRODUCT REVIEW ROUTE

static async getProductReviews(
  slug: string,
  page: number,
  limit: number
) {
  const product = await prisma.product.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!product) {
    throw notFound("Product not found.");
  }

  const [reviews, total] =
    await Promise.all([
      prisma.review.findMany({
        where: {
          productId: product.id,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      }),

      prisma.review.count({
        where: {
          productId: product.id,
        },
      }),
    ]);

  return {
    reviews,
    total,
  };
}

//PRODUCT REVIEW COMMANDS
static async createReview(
  slug: string,
  userId: string,
  data: any
) {
  const product = await prisma.product.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!product) {
    throw notFound("Product not found.");
  }

  const existingReview =
    await prisma.review.findFirst({
      where: {
        productId: product.id,
        userId,
      },
    });

  if (existingReview) {
    throw badRequest(
      "You have already reviewed this product."
    );
  }

  const purchased =
    await prisma.order.findFirst({
      where: {
        userId,
        status: "DELIVERED",
        items: {
          some: {
            productId: product.id,
          },
        },
      },
      select: {
        id: true,
      },
    });

  return prisma.review.create({
    data: {
      ...data,
      userId,
      productId: product.id,
      isVerified: !!purchased,
      approved: true,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });
}

  //SLUG IMAGE ROUTE

  static async getProductImages(
  slug: string
) {
  const product =
    await prisma.product.findUnique({
      where: {
        slug,
      },
      include: {
        images: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

  if (!product) {
    throw notFound(
      "Product not found."
    );
  }

  return product.images;
}

//IMAGE SLUG COMMANDS
  
static async createProductImage(
  productId: string,
  data: {
    url: string;
    alt?: string;
    order?: number;
  },
  actorId: string
) {
  if (!actorId) {
    throw badRequest(
      "Audit actor is required."
    );
  }

  const image =
    await prisma.productImage.create({
      data: {
        url: data.url,
        alt: data.alt,
        order: data.order ?? 0,
        productId,
      },
    });

  await AuditService.productImageAdded({
    actorId,
    entityId: image.id,
    newValues: {
      productId: image.productId,
      url: image.url,
      alt: image.alt,
      order: image.order,
    },
  });

  return image;
}

  
static async createProductImages(
  productId: string,
  images: {
    url: string;
    alt?: string;
    order: number;
  }[],
  actorId: string
) {
  if (!actorId) {
    throw badRequest(
      "Audit actor is required."
    );
  }

  const createdImages =
    await prisma.$transaction(
      images.map((image) =>
        prisma.productImage.create({
          data: {
            ...image,
            productId,
          },
        })
      )
    );

  await AuditService.productImagesAdded({
    actorId,
    newValues: {
      productId,
      images: createdImages.map(
        (image) => ({
          id: image.id,
          url: image.url,
          alt: image.alt,
          order: image.order,
        })
      ),
      count: createdImages.length,
    },
  });

  return createdImages;
}

static async deleteProductImage(
  imageId: string,
  actorId: string
) {
  if (!actorId) {
    throw badRequest(
      "Audit actor is required."
    );
  }

  const image =
    await prisma.productImage.findUnique({
      where: {
        id: imageId,
      },
    });

  if (!image) {
    throw notFound(
      "Image not found."
    );
  }

  try {
    await deleteFromCloudinary(
      image.url
    );
  } catch {
    // Ignore cleanup failures
  }

  await prisma.productImage.delete({
    where: {
      id: imageId,
    },
  });

  await AuditService.productImageDeleted({
    actorId,
    entityId: image.id,
    oldValues: {
      productId: image.productId,
      url: image.url,
      alt: image.alt,
      order: image.order,
    },
  });
}





static async updateRating(productId: string) {
  const reviews = await prisma.review.findMany({
    where: {
      productId,
    },
    select: {
      rating: true,
    },
  });

  const ratingCount = reviews.length;

  const averageRating =
    ratingCount > 0
      ? reviews.reduce(
          (sum, review) => sum + review.rating,
          0
        ) / ratingCount
      : 5.0;

  const updatedProduct =
    await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        rating: Number(
          averageRating.toFixed(1)
        ),
        ratingCount,
      },
    });

  return {
    averageRating,
    ratingCount,
    updatedProduct,
  };
}


static async togglePublicationStatus(
  productId: string,
  vendorProfileId: string,
  actorId: string
) {
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        vendorProfileId,
      },
      select: {
        id: true,
        isPublished: true,
      },
    });

    if (!product) {
      throw notFound("Product not found.");
    }

    const newValue = !product.isPublished;

    const updatedProduct = await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        isPublished: newValue,
      },
      select: {
        id: true,
        isPublished: true,
      },
    });

    await AuditService.productPublicationChanged({
      actorId,
      entityId: product.id,
      oldValues: {
        isPublished: product.isPublished,
      },
      newValues: {
        isPublished: updatedProduct.isPublished,
      },
    });

    return updatedProduct;
  }

/* -------------------------------------------------------------------------- */
/*                           GET ADMIN PRODUCT PAG                             */
/* -------------------------------------------------------------------------- */


static async getAdminProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: {
        orderBy: {
          order: "asc",
        },
      },
      category: true,
    },
  });

  if (!product) {
    throw notFound("Product not found.");
  }

  return {
    ...product,
    price: Number(product.price),
    discountPrice: product.discountPrice
      ? Number(product.discountPrice)
      : null,
  };
}



/* -------------------------------------------------------------------------- */
/*                               FETCH QUERIES                                */
/* -------------------------------------------------------------------------- */
static async getFlashSaleProducts(limit = 8) {
  return prisma.product.findMany({
    where: {
      isFlashSale: true,
      isPublished: true,
    },
    take: limit,
    include: {
      images: true,
      vendorProfile: true,
    },
  });
}

static async getNewArrivalProducts(limit = 8) {
  return prisma.product.findMany({
    where: {
      isPublished: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
    include: {
      images: {
        select: {
          url: true,
        },
      },
      vendorProfile: {
        select: {
          storeName: true,
          isVerified: true,
        },
      },
    },
  });
}

static async getFeaturedProducts(limit = 8) {
  return prisma.product.findMany({
    where: {
      isFeatured: true,
      isPublished: true,
    },
    take: limit,
    include: {
      images: {
        select: {
          url: true,
        },
      },
      vendorProfile: {
        select: {
          storeName: true,
          isVerified: true,
        },
      },
    },
  });
}


/* -------------------------------------------------------------------------- */
/*                               FETCH QUERIES                                */
/* -------------------------------------------------------------------------- */

static async getHomepageTrendingProducts(limit = 12) {
  const now = new Date();

  return prisma.product.findMany({
    where: {
      isPublished: true,
      OR: [
        {
          isTrending: true,
        },
        {
          boostUntil: {
            gte: now,
          },
        },
      ],
    },
    orderBy: [
      {
        boostUntil: {
          sort: "desc",
          nulls: "last",
        },
      },
      {
        salesCount: "desc",
      },
    ],
    take: limit,
    include: {
      images: {
        select: {
          url: true,
        },
      },
      vendorProfile: {
        select: {
          storeName: true,
          isVerified: true,
        },
      },
    },
  });
}


/* -------------------------------------------------------------------------- */
/*                               FETCH QUERIES                                */
/* -------------------------------------------------------------------------- */

static async getShopProducts(filters: {
  category?: string;
  subcategory?: string;
  brand?: string;
  minPrice?: string;
  maxPrice?: string;
}) {
  const where: Prisma.ProductWhereInput = {
    isPublished: true,
  };

  if (filters.category) {
    where.category = {
      slug: filters.category,
    };
  }

  if (filters.subcategory) {
    where.category = {
      slug: filters.subcategory,
    };
  }

  if (filters.brand) {
    where.brand = filters.brand;
  }

  if (filters.minPrice || filters.maxPrice) {
    where.price = {
      gte: filters.minPrice
        ? new Prisma.Decimal(filters.minPrice)
        : new Prisma.Decimal(0),

      lte: filters.maxPrice
        ? new Prisma.Decimal(filters.maxPrice)
        : new Prisma.Decimal(9999999),
    };
  }

  return prisma.product.findMany({
    where,
    include: {
      images: true,
      variants: true,
      category: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}



/* -------------------------------------------------------------------------- */
/*                        GET SIMILAR PRODUCTS FRONTEND                        */
/* -------------------------------------------------------------------------- */  

static async getSimilarProducts(
  categoryId: string,
  productId: string
) {
  return prisma.product.findMany({
    where: {
      categoryId,
      id: {
        not: productId,
      },
      status: "ACTIVE",
    },

    take: 4,

    select: {
      id: true,
      title: true,
      slug: true,
      price: true,
      discountPrice: true,

      images: {
        take: 1,
        select: {
          url: true,
        },
      },
    },
  });
}



/* -------------------------------------------------------------------------- */
/*                        BUILD SHOP FILTERS FRONTEND                        */
/* -------------------------------------------------------------------------- */

static buildShopFilters(filters: {
  category?: string;
  subcategory?: string;
  brand?: string;
  minPrice?: string;
  maxPrice?: string;
}) {
  const where: Prisma.ProductWhereInput = {};

  if (filters.category) {
    where.category = {
      slug: filters.category,
    };
  }

  if (filters.subcategory) {
    where.category = {
      slug: filters.subcategory,
    };
  }

  if (filters.brand) {
    where.brand = filters.brand;
  }

  if (filters.minPrice || filters.maxPrice) {
    where.price = {
      gte: filters.minPrice
        ? parseFloat(filters.minPrice)
        : 0,

      lte: filters.maxPrice
        ? parseFloat(filters.maxPrice)
        : 9999999,
    };
  }

  return where;
}

/* -------------------------------------------------------------------------- */
/*                        GET ADMIN PRODUCT FOR EDIT                        */
/* -------------------------------------------------------------------------- */
static async getProductForEdit(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: {
        orderBy: {
          order: "asc",
        },
      },
      category: true,
    },
  });

  if (!product) {
    throw notFound("Product not found.");
  }

  return product;
}

/* -------------------------------------------------------------------------- */
/*                        GET TRNDING PRODUCTS FOR ADMIN                       */
/* -------------------------------------------------------------------------- */
static async getTrendingProductsForAdmin(
  query: string,
  skip: number,
  take: number
) {
  const where: Prisma.ProductWhereInput = {
    status: "ACTIVE",
    OR: [
      {
        title: {
          contains: query,
          mode: "insensitive",
        },
      },
      {
        sku: {
          contains: query,
          mode: "insensitive",
        },
      },
    ],
  };

  const [products, totalCount] =
    await Promise.all([
      prisma.product.findMany({
        where,
        select: {
          id: true,
          title: true,
          sku: true,
          isTrending: true,
          price: true,
          images: {
            take: 1,
            select: {
              url: true,
            },
          },
        },
        orderBy: [
          {
            isTrending: "desc",
          },
          {
            title: "asc",
          },
        ],
        skip,
        take,
      }),

      prisma.product.count({
        where,
      }),
    ]);

  return {
    products,
    totalCount,
  };
}



/* -------------------------------------------------------------------------- */
/*                        ADMIN TRENDING PRODUCT TOGGLE                       */
/* -------------------------------------------------------------------------- */
static async toggleTrendingStatus(
  id: string,
  currentStatus: boolean,
  actorId: string
) {
  const updatedProduct = await prisma.product.update({
  where: {
    id,
  },
  data: {
    isTrending: !currentStatus,
  },
});

await AuditService.productTrendingChanged({
  actorId,
  entityId: updatedProduct.id,
  oldValues: {
    isTrending: currentStatus,
  },
  newValues: {
    isTrending: updatedProduct.isTrending,
  },
});

return updatedProduct;
  
}

}
import { prisma } from "@/app/lib/prisma";
import { Prisma } from "@prisma/client";
import { deleteFromCloudinary } from "@/app/lib/cloudinary";
import {
  badRequest,
  forbidden,
  notFound
} from "@/app/lib/auth/errors";

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
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        variants: {
          orderBy: {
            name: "asc",
          },
        },
        reviews: {
          include: {
            user: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        },
        vendorProfile: {
          select: {
            id: true,
            storeName: true,
            logoUrl: true,
            status: true,
            isSuspended: true,
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
    product.vendorProfile.status !==
      "APPROVED"
  ) {
    throw forbidden(
      "Product is unavailable."
    );
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

  return prisma.product.update({
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
}: {
  ids: string[];
  updateType: string;
  applyToAll?: boolean;
  filters?: any;
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
    throw badRequest(
      "No products selected."
    );
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

  await prisma.$transaction(
    currentProducts.map((product) => {
      let value = false;

      switch (dbField) {
        case "isFeatured":
          value = !product.isFeatured;
          break;

        case "isFlashSale":
          value = !product.isFlashSale;
          break;

        case "isNewArrival":
          value = !product.isNewArrival;
          break;
      }

      return prisma.product.update({
        where: {
          id: product.id,
        },
        data: {
          [dbField]: value,
        },
      });
    })
  );

  return {
    affectedIds: targetIds,
    count: targetIds.length,
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
  }
) {
  return prisma.variant.create({
    data: {
      name: data.name,
      price: data.price ?? 0,
      stock: data.stock ?? 0,
      attributes: data.attributes ?? {},
      productId,
    },
  });
}

//DELETE VARIANTS
static async deleteVariant(
  variantId: string
) {
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
  }
) {
  return prisma.productImage.create({
    data: {
      url: data.url,
      alt: data.alt,
      order: data.order ?? 0,
      productId,
    },
  });
}

    static async createProductImages(
  productId: string,
  images: {
    url: string;
    alt?: string;
    order: number;
  }[]
) {
  return prisma.$transaction(
    images.map((image) =>
      prisma.productImage.create({
        data: {
          ...image,
          productId,
        },
      })
    )
  );
}


static async deleteProductImage(
  imageId: string
) {
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
  productId: string
) {
  const product =
    await prisma.product.findUnique({
      where: {
        id: productId,
      },
      select: {
        id: true,
        isPublished: true,
      },
    });

  if (!product) {
    throw notFound("Product not found.");
  }

  return prisma.product.update({
    where: {
      id: productId,
    },
    data: {
      isPublished: !product.isPublished,
    },
    select: {
      id: true,
      isPublished: true,
    },
  });
}

  
}
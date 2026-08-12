import type { Prisma } from "@prisma/client";

import { prisma } from "@/app/lib/prisma";

import { badRequest, notFound } from "@/app/lib/auth/errors";

type CategorySortField =
  | "position"
  | "name"
  | "slug"
  | "createdAt"
  | "updatedAt";

const categoryInclude = {
  parent: true,
  children: true,
} satisfies Prisma.CategoryInclude;


type CategoryTree = {
  id: string;
  name: string;
  slug: string;
  children: CategoryTree[];
};

export class CategoryService {
  
static async createCategory(data: {
  name: string;
  slug: string;
  parentId?: string | null;
  position?: number;
  imageUrl?: string | null;
  isFeatured?: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
}) {
  const normalizedData = {
  name: data.name,
  slug: data.slug,

  parentId:
    data.parentId &&
    data.parentId.trim() !== ""
      ? data.parentId
      : null,

  position: data.position ?? 0,

  imageUrl:
    data.imageUrl &&
    data.imageUrl.trim() !== ""
      ? data.imageUrl
      : null,

  isFeatured:
    data.isFeatured ?? false,

  metaTitle:
    data.metaTitle &&
    data.metaTitle.trim() !== ""
      ? data.metaTitle
      : null,

  metaDescription:
    data.metaDescription &&
    data.metaDescription.trim() !== ""
      ? data.metaDescription
      : null,
};

  if (normalizedData.parentId) {
    const parent =
      await prisma.category.findUnique({
        where: {
          id: normalizedData.parentId,
        },
        select: {
          id: true,
        },
      });

    if (!parent) {
      throw badRequest(
        "Parent category does not exist."
      );
    }
  }

  return prisma.category.create({
    data: normalizedData,
  });
}


static async updateCategory(
  id: string,
  data: {
    name?: string;
    slug?: string;
    parentId?: string | null;
    position?: number;
    imageUrl?: string | null;
    isFeatured?: boolean;
    metaTitle?: string | null;
    metaDescription?: string | null;
  }
) {
  const existingCategory =
    await prisma.category.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });

  if (!existingCategory) {
    throw notFound(
      "Category not found."
    );
  }

  const normalizedData = {
  ...data,

  parentId:
    data.parentId &&
    data.parentId.trim() !== ""
      ? data.parentId
      : null,

  position:
    data.position ?? 0,

  imageUrl:
    data.imageUrl &&
    data.imageUrl.trim() !== ""
      ? data.imageUrl
      : null,

  isFeatured:
    data.isFeatured ?? false,

  metaTitle:
    data.metaTitle &&
    data.metaTitle.trim() !== ""
      ? data.metaTitle
      : null,

  metaDescription:
    data.metaDescription &&
    data.metaDescription.trim() !== ""
      ? data.metaDescription
      : null,
};

  if (normalizedData.slug) {
    const slugConflict =
      await prisma.category.findUnique({
        where: {
          slug: normalizedData.slug,
        },
        select: {
          id: true,
        },
      });

    if (
      slugConflict &&
      slugConflict.id !== id
    ) {
      throw badRequest(
        "Slug already exists."
      );
    }
  }

  // Prevent self-parenting
  if (
    normalizedData.parentId === id
  ) {
    throw badRequest(
      "A category cannot be its own parent."
    );
  }

  // Validate parent and prevent circular hierarchy
  if (normalizedData.parentId) {
    let current =
      await prisma.category.findUnique({
        where: {
          id: normalizedData.parentId,
        },
        select: {
          id: true,
          parentId: true,
        },
      });

    if (!current) {
      throw badRequest(
        "Parent category does not exist."
      );
    }

    while (current) {
      if (current.id === id) {
        throw badRequest(
          "Circular category hierarchy is not allowed."
        );
      }

      if (!current.parentId) {
        break;
      }

      current =
        await prisma.category.findUnique({
          where: {
            id: current.parentId,
          },
          select: {
            id: true,
            parentId: true,
          },
        });
    }
  }

  return prisma.category.update({
    where: {
      id,
    },
    data: normalizedData,
  });
}

    static async deleteCategory(
  id: string
) {
  const category =
    await prisma.category.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });

  if (!category) {
    throw notFound(
      "Category not found."
    );
  }

  const [
    childCount,
    productCount,
  ] = await Promise.all([
    prisma.category.count({
      where: {
        parentId: id,
      },
    }),

    prisma.product.count({
      where: {
        categoryId: id,
      },
    }),
  ]);

  if (childCount > 0) {
    throw badRequest(
      "Cannot delete a category that has child categories."
    );
  }

  if (productCount > 0) {
    throw badRequest(
      "Cannot delete a category that contains products."
    );
  }

  await prisma.category.delete({
    where: {
      id,
    },
  });

  return {
    success: true,
  };
}
  

static async getCategories(options: {
    all: boolean;
    page: number;
    pageSize: number;
    search: string;
    sortBy: CategorySortField;
    sortOrder: "asc" | "desc";
  }) {
    const {
      all,
      page,
      pageSize,
      search,
      sortBy,
      sortOrder,
    } = options;

    const where:
      | Prisma.CategoryWhereInput
      | undefined = search
      ? {
          OR: [
            {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              slug: {
                contains: search,
                mode: "insensitive",
              },
            },
          ],
        }
      : undefined;

    const orderBy: Prisma.CategoryOrderByWithRelationInput =
      {
        [sortBy]: sortOrder,
      };

    if (all) {
      const categories =
        await prisma.category.findMany({
          where,
          include: categoryInclude,
          orderBy,
        });

      return {
        success: true,
        categories,
      };
    }

    const [categories, total] =
      await Promise.all([
        prisma.category.findMany({
          where,
          include: categoryInclude,
          orderBy,
          skip:
            (page - 1) * pageSize,
          take: pageSize,
        }),

        prisma.category.count({
          where,
        }),
      ]);

    return {
      categories,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(
        total / pageSize
      ),
      sortBy,
      sortOrder,
    };
  }


  static async reorderCategories(
  updates: {
    id: string;
    position: number;
  }[]
) {
  if (updates.length === 0) {
    throw badRequest(
      "No category updates were provided."
    );
  }

  const ids = updates.map(
    ({ id }) => id
  );

  const uniqueIds = new Set(ids);

  if (uniqueIds.size !== ids.length) {
    throw badRequest(
      "Duplicate category IDs were provided."
    );
  }

  const existingCount =
    await prisma.category.count({
      where: {
        id: {
          in: ids,
        },
      },
    });

  if (existingCount !== ids.length) {
    throw badRequest(
      "One or more categories do not exist."
    );
  }

  await prisma.$transaction(
    updates.map(
      ({ id, position }) =>
        prisma.category.update({
          where: {
            id,
          },
          data: {
            position,
          },
        })
    )
  );

  return {
    success: true,
  };
}

    

    static async categorySlugExists(
  slug: string
) {
  const normalizedSlug =
    slug.trim();

  if (!normalizedSlug) {
    throw badRequest(
      "Slug is required."
    );
  }

  const category =
    await prisma.category.findUnique({
      where: {
        slug: normalizedSlug,
      },
      select: {
        id: true,
      },
    });

  return !!category;
}

    static async getCategoryById(
    id: string
    ) {
    const category =
        await prisma.category.findUnique({
        where: {
            id,
        },
        include: categoryInclude,
        });

    if (!category) {
        throw notFound(
        "Category not found."
        );
    }

    return category;
    }

  

  static async getCategoryTree() {
  return prisma.category.findMany({
    where: {
      parentId: null,
    },
    orderBy: {
      position: "asc",
    },
    include: {
      children: {
        orderBy: {
          position: "asc",
        },
        include: {
          children: {
            orderBy: {
              position: "asc",
            },
          },
        },
      },
    },
  });
}

static async searchCategories(
  query: string
) {
  if (!query) {
    throw badRequest(
      "Search query is required."
    );
  }

  if (query.length < 3) {
    return [];
  }

  return prisma.category.findMany({
    where: {
      OR: [
        {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          slug: {
            contains: query,
            mode: "insensitive",
          },
        },
      ],
    },
    select: {
      id: true,
      name: true,
      slug: true,
    },
    take: 6,
  });
}

static async getCategoryBySlug(
  slug: string
) {
  const category =
    await prisma.category.findUnique({
      where: {
        slug,
      },
      include: {
        products: {
          include: {
            images: true,
            variants: true,
          },
        },
        children: {
          orderBy: {
            position: "asc",
          },
        },
      },
    });

  if (!category) {
    throw notFound(
      "Category not found."
    );
  }

  return {
    ...category,

    products:
      category.products.map(
        (product) => ({
          ...product,

          price: Number(
            product.price
          ),

          discountPrice:
            product.discountPrice
              ? Number(
                  product.discountPrice
                )
              : null,

          variants:
            product.variants.map(
              (variant) => ({
                ...variant,

                price: Number(
                  variant.price
                ),
              })
            ),
        })
      ),
  };
}


static async getAdminCategoryDirectory(options: {
  page: number;
  pageSize: number;
  search: string;
  sortBy: CategorySortField;
  sortOrder: "asc" | "desc";
}) {
  const {
    page,
    pageSize,
    search,
    sortBy,
    sortOrder,
  } = options;

  const where: Prisma.CategoryWhereInput =
    search
      ? {
          OR: [
            {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              slug: {
                contains: search,
                mode: "insensitive",
              },
            },
          ],
        }
      : {};

  const [
    total,
    categories,
    featuredCount,
  ] = await Promise.all([
    prisma.category.count({
      where,
    }),

    prisma.category.findMany({
      where,

      orderBy: {
        [sortBy]: sortOrder,
      },

      skip: (page - 1) * pageSize,
      take: pageSize,

      select: {
        id: true,
        name: true,
        slug: true,
        position: true,
        isFeatured: true,
        createdAt: true,

        parent: {
          select: {
            name: true,
          },
        },

        children: {
          orderBy: {
            position: "asc",
          },

          select: {
            id: true,
            name: true,
            slug: true,

            children: {
              orderBy: {
                position: "asc",
              },

              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    }),

    prisma.category.count({
      where: {
        isFeatured: true,
      },
    }),
  ]);

  return {
    categories,
    total,
    featuredCount,
  };
}


static async getCategoryOptions() {
  return prisma.category.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}



static async getFeaturedCategories(limit = 6) {
  return prisma.category.findMany({
    where: {
      isFeatured: true,
    },
    take: limit,
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });
}

/* -------------------------------------------------------------------------- */
/*                               FETCH QUERIES                                */
/* -------------------------------------------------------------------------- */

static async getRootCategories() {
  return prisma.category.findMany({
    where: {
      parentId: null,
    },
    include: {
      children: true,
    },
    orderBy: {
      position: "asc",
    },
  });
}


/* -------------------------------------------------------------------------- */
/*                         PUBLIC CATEGORY QUERIES                            */
/* -------------------------------------------------------------------------- */
static async getPublicCategoryBySlug(
  slug: string
) {
  return prisma.category.findUnique({
    where: {
      slug,
    },

    include: {
      children: true,

      products: {
        include: {
          images: true,
          variants: true,
        },
      },
    },
  });
}



/* -------------------------------------------------------------------------- */
/*                      PUBLIC NAVIGATION SECTION                              */
/* -------------------------------------------------------------------------- */

static async getNavigationCategories() {
  return prisma.category.findMany({
    where: {
      OR: [
        {
          parentId: null,
        },
        {
          parentId: "",
        },
      ],
    },
    include: {
      children: {
        include: {
          children: true,
        },
      },
    },
    orderBy: {
      position: "asc",
    },
  });
}


/* -------------------------------------------------------------------------- */
/*                      TOGGLE FEATURED STATUS                                */
/* -------------------------------------------------------------------------- */

static async toggleFeaturedStatus(
  id: string,
  currentStatus: boolean
) {
  return prisma.category.update({
    where: {
      id,
    },
    data: {
      isFeatured: !currentStatus,
    },
  });
}



}

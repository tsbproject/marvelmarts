import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { productSchema } from "@/app/lib/validations/product";
import { deleteFromCloudinary } from "@/app/lib/cloudinary";

import {
  requireVendor,
  requireAdmin,
  handleApiError,
} from "@/app/lib/auth/api";

import {
  forbidden,
  notFound,
} from "@/app/lib/auth/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* -------------------------------------------------------------------------- */
/* SERIALIZER                                                                 */
/* -------------------------------------------------------------------------- */

function serializeProduct(product: any) {
  return {
    ...product,
    price: Number(product.price),
    discountPrice:
      product.discountPrice != null
        ? Number(product.discountPrice)
        : null,

    variants:
      product.variants?.map((variant: any) => ({
        ...variant,
        price:
          variant.price != null
            ? Number(variant.price)
            : null,
      })) ?? [],
  };
}

/* -------------------------------------------------------------------------- */
/* VENDOR HELPER                                                              */
/* -------------------------------------------------------------------------- */

async function getVendorProfileId(
  userId: string
) {
  const vendor = await prisma.vendorProfile.findUnique({
    where: {
      userId,
    },
    select: {
      id: true,
    },
  });

  return vendor?.id ?? null;
}

/* -------------------------------------------------------------------------- */
/* GET PRODUCT                                                                */
/* -------------------------------------------------------------------------- */

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      slug: string;
    }>;
  }
) {
  try {
    const { slug } = await params;

    const product = await prisma.product.findUnique({
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
      throw notFound("Product not found.");
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

    return NextResponse.json({
      success: true,
      product: serializeProduct(product),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/* -------------------------------------------------------------------------- */
/* UPDATE PRODUCT                                                             */
/* -------------------------------------------------------------------------- */

export async function PUT(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      slug: string;
    }>;
  }
) {
  try {
    const session = await requireVendor();

    const { slug } = await params;

    const existingProduct = await prisma.product.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
        vendorProfileId: true,
      },
    });

    if (!existingProduct) {
      throw notFound("Product not found.");
    }

    const vendorProfileId = await getVendorProfileId(
      session.user.id
    );

    const isAdmin =
      session.user.role === "ADMIN" ||
      session.user.role === "SUPER_ADMIN";

    if (
      !isAdmin &&
      vendorProfileId !== existingProduct.vendorProfileId
    ) {
      throw forbidden(
        "You do not have permission to update this product."
      );
    }

    const body = await request.json();

    const parsed = productSchema.parse(body);

    const updatedProduct = await prisma.product.update({
      where: {
        slug,
      },

      data: {
        title: parsed.title,
        description: parsed.description,
        brand: parsed.brand,
        price: parsed.price,
        discountPrice: parsed.discountPrice,
        categoryId: parsed.categoryId,
        status: parsed.status,
        isFeatured: parsed.isFeatured,
        metaTitle:
          parsed.metaTitle || parsed.title,
        metaDescription:
          parsed.metaDescription ||
          parsed.description?.substring(0, 160),
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

    return NextResponse.json({
      success: true,
      product: serializeProduct(updatedProduct),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/* -------------------------------------------------------------------------- */
/* DELETE PRODUCT                                                             */
/* -------------------------------------------------------------------------- */

export async function DELETE(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      slug: string;
    }>;
  }
) {
  try {
    const session = await requireVendor();

    const { slug } = await params;

    const existingProduct = await prisma.product.findUnique({
      where: {
        slug,
      },

      include: {
        images: true,
      },
    });

    if (!existingProduct) {
      throw notFound("Product not found.");
    }

    const vendorProfileId = await getVendorProfileId(
      session.user.id
    );

    const isAdmin =
      session.user.role === "ADMIN" ||
      session.user.role === "SUPER_ADMIN";

    if (
      !isAdmin &&
      vendorProfileId !== existingProduct.vendorProfileId
    ) {
      throw forbidden(
        "You do not have permission to delete this product."
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.productImage.deleteMany({
        where: {
          productId: existingProduct.id,
        },
      });

      await tx.variant.deleteMany({
        where: {
          productId: existingProduct.id,
        },
      });

      await tx.product.delete({
        where: {
          id: existingProduct.id,
        },
      });
    });

    await Promise.allSettled(
      existingProduct.images.map(async (image) => {
        try {
          await deleteFromCloudinary(image.url);
        } catch {
          // Ignore Cloudinary cleanup failures
        }
      })
    );

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/app/lib/prisma";

import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "@/app/lib/cloudinary";

import {
  handleApiError,
  requireVendor,
} from "@/app/lib/auth/api";

import {
  badRequest,
  notFound,
} from "@/app/lib/auth/errors";

import { requireProductOwnershipBySlug } from "@/app/lib/products/ownership";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* -------------------------------------------------------------------------- */
/* SCHEMA                                                                     */
/* -------------------------------------------------------------------------- */

const imageSchema = z.object({
  url: z.string().url(),
  alt: z.string().optional(),
  order: z.number().optional(),
});

/* -------------------------------------------------------------------------- */
/* GET                                                                        */
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

    return NextResponse.json({
      success: true,
      images: product.images,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/products/[slug]/images
/* -------------------------------------------------------------------------- */
/* POST IMAGES                                                                */
/* -------------------------------------------------------------------------- */

export async function POST(
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

    const product =
      await requireProductOwnershipBySlug(
        slug,
        session
      );

    const contentType =
      request.headers.get("content-type") ?? "";

    /* ---------------------------------------------------------------------- */
    /* JSON REQUEST                                                           */
    /* ---------------------------------------------------------------------- */

    if (contentType.includes("application/json")) {
      const body = await request.json();

      const parsed =
        imageSchema.parse(body);

      const image =
        await prisma.productImage.create({
          data: {
            url: parsed.url,
            alt: parsed.alt,
            order: parsed.order ?? 0,
            productId: product.id,
          },
        });

      return NextResponse.json(
        {
          success: true,
          image,
        },
        {
          status: 201,
        }
      );
    }

    /* ---------------------------------------------------------------------- */
    /* FORM DATA                                                              */
    /* ---------------------------------------------------------------------- */

    if (
      contentType.includes(
        "multipart/form-data"
      )
    ) {
      const formData =
        await request.formData();

      const uploadedImages = [];

      const mainImage =
        formData.get(
          "mainImage"
        ) as File | null;

      const extraImages =
        formData.getAll(
          "extraImages"
        ) as File[];

      if (
        mainImage &&
        mainImage.size > 0
      ) {
        const url =
          await uploadToCloudinary(
            mainImage,
            "products"
          );

        if (url) {
          uploadedImages.push({
            url,
            alt: "Main image",
            order: 0,
          });
        }
      }

      for (
        let i = 0;
        i < extraImages.length;
        i++
      ) {
        const file = extraImages[i];

        if (!file || file.size === 0) {
          continue;
        }

        const url =
          await uploadToCloudinary(
            file,
            "products"
          );

        if (url) {
          uploadedImages.push({
            url,
            alt: `Extra image ${i + 1}`,
            order: i + 1,
          });
        }
      }

      const createdImages =
        await prisma.$transaction(
          uploadedImages.map((image) =>
            prisma.productImage.create({
              data: {
                ...image,
                productId: product.id,
              },
            })
          )
        );

      return NextResponse.json(
        {
          success: true,
          images: createdImages,
        },
        {
          status: 201,
        }
      );
    }

    throw badRequest(
      "Unsupported content type."
    );
  } catch (error) {
    return handleApiError(error);
  }
}

/* -------------------------------------------------------------------------- */
/* DELETE IMAGE                                                               */
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
    const session =
      await requireVendor();

    const { slug } =
      await params;

    await requireProductOwnershipBySlug(
      slug,
      session
    );

    const { searchParams } =
      new URL(request.url);

    const imageId =
      searchParams.get("id");

    if (!imageId) {
      throw badRequest(
        "Image ID is required."
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
      // Ignore Cloudinary cleanup failures
    }

    await prisma.productImage.delete({
      where: {
        id: imageId,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "Image deleted successfully.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { uploadToCloudinary } from "@/app/lib/cloudinary";

import {
  handleApiError,
  requireVendor,
} from "@/app/lib/auth/api";

import { badRequest } from "@/app/lib/auth/errors";

import { requireProductOwnershipBySlug } from "@/app/lib/products/ownership";

import { ProductService } from "@/app/lib/services/product.service";

import { verifyOrigin } from "@/app/lib/auth/csrf";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";

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

export const GET = withApiLogging(
  async (
    request: NextRequest,
    {
      params,
    }: {
      params: Promise<{
        slug: string;
      }>;
    }
  ) => {
    try {
      const { slug } =
        await params;

      const images =
        await ProductService.getProductImages(
          slug
        );

      return NextResponse.json({
        success: true,
        images,
      });
    } catch (error) {
      return handleApiError(error);
    }
  }
);

/* -------------------------------------------------------------------------- */
/* POST IMAGES                                                                */
/* -------------------------------------------------------------------------- */

export const POST = withApiLogging(
  async (
    request: NextRequest,
    {
      params,
    }: {
      params: Promise<{
        slug: string;
      }>;
    }
  ) => {
    try {
      verifyOrigin(request);

      const session =
        await requireVendor();

      const { slug } =
        await params;

      const product =
        await requireProductOwnershipBySlug(
          slug,
          session
        );

      const contentType =
        request.headers.get(
          "content-type"
        ) ?? "";

      /* ---------------------------------------------------------------------- */
      /* JSON REQUEST                                                           */
      /* ---------------------------------------------------------------------- */

      if (
        contentType.includes(
          "application/json"
        )
      ) {
        const body =
          await request.json();

        const parsed =
          imageSchema.parse(body);

        const image =
          await ProductService.createProductImage(
            product.id,
            parsed,
            session.user.id
          );

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
          const file =
            extraImages[i];

          if (
            !file ||
            file.size === 0
          ) {
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
          await ProductService.createProductImages(
            product.id,
            uploadedImages,
            session.user.id
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
);

/* -------------------------------------------------------------------------- */
/* DELETE IMAGE                                                               */
/* -------------------------------------------------------------------------- */

export const DELETE = withApiLogging(
  async (
    request: NextRequest,
    {
      params,
    }: {
      params: Promise<{
        slug: string;
      }>;
    }
  ) => {
    try {
      verifyOrigin(request)
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

      await ProductService.deleteProductImage(
        imageId,
        session.user.id
      );
      return NextResponse.json({
        success: true,
        message:
          "Image deleted successfully.",
      });
    } catch (error) {
      return handleApiError(error);
    }
  }
);
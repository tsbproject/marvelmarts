import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { ProductStatus } from "@prisma/client";
import { z } from "zod";

import {
  badRequest,
  notFound,
  forbidden,
} from "@/app/lib/auth/errors";

import { ProductService } from "@/app/lib/services/product.service";

import {
  requireVendor,
  handleApiError,
} from "@/app/lib/auth/api";

import { ProductValidationService } from "@/app/lib/services/product-validation.service";
import { CloudinaryService } from "@/app/lib/services/cloudinary.service";
import { VendorService } from "@/app/lib/services/vendor.service";
import { verifyOrigin } from "@/app/lib/auth/csrf";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ===========================
   Zod Schema
=========================== */

const productSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  brand: z.string().optional().nullable(),
  price: z.coerce.number().positive(),
  discountPrice: z.coerce.number().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  categoryIds: z.any().optional(),
  status: z
    .nativeEnum(ProductStatus)
    .default(ProductStatus.ACTIVE),
  stock: z.coerce.number().int().default(0),
  sku: z.string().trim().optional().nullable(),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  isFeatured: z
    .preprocess(
      (val) => val === "true" || val === true,
      z.boolean()
    )
    .optional(),
  isFlashSale: z
    .preprocess(
      (val) => val === "true" || val === true,
      z.boolean()
    )
    .optional(),
  isNewArrival: z
    .preprocess(
      (val) => val === "true" || val === true,
      z.boolean()
    )
    .optional(),
  shippingMethod: z.string().optional().nullable(),
  weight: z.coerce.number().optional().nullable(),

  tags: z.any().optional(),
});

/* ===========================
   POST: Create Product
=========================== */

export const POST = withApiLogging(
  async (request: NextRequest) => {
    try {
      verifyOrigin(request);

      const session =
        await requireVendor();

      if (!session?.user) {
        return NextResponse.json(
          {
            success: false,
            error: "Unauthorized",
          },
          {
            status: 401,
          }
        );
      }

      const vendor =
        await VendorService.getActiveVendor(
          session.user.id,
          session.user.role
        );

      if (!vendor) {
        return NextResponse.json(
          {
            success: false,
            error: "Vendor profile not found",
          },
          {
            status: 404,
          }
        );
      }

      if (vendor.isSuspended) {
        return NextResponse.json(
          {
            success: false,
            error: "Account suspended",
          },
          {
            status: 403,
          }
        );
      }

      // ── Parse FormData ──────────────────────────────────────────────────────
      const formData =
        await request.formData();

      const fields: Record<string, any> = {};
      const files: File[] = [];

      for (
        const [key, value]
        of formData.entries()
      ) {
        if (value instanceof File) {
          if (value.size > 0) {
            files.push(value);
          }
        } else {
          fields[key] = value;
        }
      }

      // ── Validate main product data ─────────────────────────────────────────
      const parsed =
        productSchema.safeParse(fields);

      if (!parsed.success) {
        const fieldErrors =
          parsed.error.flatten().fieldErrors;

        return NextResponse.json(
          {
            success: false,
            error: "Validation error",
            errors: fieldErrors,
          },
          {
            status: 400,
          }
        );
      }

      const data = parsed.data;

      const parsedTags =
        ProductValidationService.parseTags(
          fields.tags
        );

      // ── Parse variants safely ───────────────────────────────────────────────
      let variants = [];

      try {
        variants = JSON.parse(
          (fields.variants as string) || "[]"
        );
      } catch (jsonErr) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Invalid variants JSON format",
          },
          {
            status: 400,
          }
        );
      }

      for (const variant of variants) {
        if (
          !variant.name ||
          typeof variant.name !== "string" ||
          !variant.name.trim()
        ) {
          throw badRequest(
            "Every variant must have a name."
          );
        }

        if (
          variant.stock != null &&
          (
            isNaN(Number(variant.stock)) ||
            Number(variant.stock) < 0
          )
        ) {
          throw badRequest(
            `Invalid stock value for variant "${variant.name}".`
          );
        }

        if (
          variant.price != null &&
          (
            isNaN(Number(variant.price)) ||
            Number(variant.price) < 0
          )
        ) {
          throw badRequest(
            `Invalid price for variant "${variant.name}".`
          );
        }
      }

      const submittedSkus = [
        data.sku,
        ...variants.map(
          (v: any) => v.sku
        ),
      ]
        .filter(
          (sku): sku is string =>
            typeof sku === "string" &&
            sku.trim().length > 0
        )
        .map((sku) => sku.trim());

      const duplicateSkus =
        submittedSkus.filter(
          (sku, index) =>
            submittedSkus.indexOf(sku) !==
            index
        );

      if (duplicateSkus.length > 0) {
        throw badRequest(
          `Duplicate SKU detected: ${duplicateSkus.join(", ")}`
        );
      }

      if (submittedSkus.length > 0) {
        const existingSkus =
          await prisma.product.findMany({
            where: {
              sku: {
                in: submittedSkus,
              },
            },
            select: {
              sku: true,
            },
          });

        if (existingSkus.length > 0) {
          throw badRequest(
            `SKU already exists: ${existingSkus
              .map((p) => p.sku)
              .filter(Boolean)
              .join(", ")}`
          );
        }
      }

      const existingVariantSkus =
        await prisma.variant.findMany({
          where: {
            sku: {
              in: submittedSkus,
            },
          },
          select: {
            sku: true,
          },
        });

      if (existingVariantSkus.length > 0) {
        throw badRequest(
          `Variant SKU already exists: ${existingVariantSkus
            .map((v) => v.sku)
            .filter(Boolean)
            .join(", ")}`
        );
      }

      const parsedCategoryIds =
        ProductValidationService.parseCategoryIds(
          fields.categoryIds,
          fields.categoryId
        );

      await ProductValidationService.validateCategories(
        parsedCategoryIds
      );

      const slug =
        `${data.title
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]+/g, "")}-${Date.now()}`;

      // ── Upload images ───────────────────────────────────────────────────────
      const imageUrls =
        await CloudinaryService.uploadMany(
          files,
          "products"
        );

      // ── Transaction ─────────────────────────────────────────────────────────
      let product;

      try {
        product =
          await ProductService.createProduct({
            userId: session.user.id,
            vendorId: vendor.id,
            data,
            slug,
            parsedTags,
            parsedCategoryIds,
            imageUrls,
            variants,
          });
      } catch (error) {
        await CloudinaryService.deleteMany(
          imageUrls
        );

        throw error;
      }

      return NextResponse.json(
        {
          success: true,
          product,
        },
        {
          status: 201,
        }
      );
    } catch (error) {
      return handleApiError(error);
    }
  }
);

/* ===========================
   GET: Fetching
=========================== */

export const GET = withApiLogging(
  async (request: NextRequest) => {
    try {
      const { searchParams } =
        new URL(request.url);

      const id =
        searchParams.get("id");

      const viewOwn =
        searchParams.get("own") === "true";

      let session = null;

      if (viewOwn) {
        session =
          await requireVendor();
      }

      let vendorIdFilter:
        string | undefined;

      if (viewOwn) {
        const profile =
          await VendorService.getVendorProfileOrThrow(
            session!.user.id
          );

        vendorIdFilter =
          profile.id;

        if (!profile) {
          throw notFound(
            "Vendor profile not found."
          );
        }

        vendorIdFilter =
          profile.id;
      }

      if (id) {
        const product =
          await ProductService.getProduct(
            id
          );

        if (!product) {
          throw notFound(
            "Product not found."
          );
        }

        if (
          !viewOwn &&
          (
            product.vendorProfile.isSuspended ||
            product.vendorProfile.status !==
              "APPROVED"
          )
        ) {
          throw forbidden(
            "Product is unavailable."
          );
        }

        const serializedProduct = {
          ...product,
          price: Number(product.price),
          discountPrice:
            product.discountPrice != null
              ? Number(
                  product.discountPrice
                )
              : null,
          variants:
            product.variants.map(
              (variant) => ({
                ...variant,
                price:
                  variant.price != null
                    ? Number(
                        variant.price
                      )
                    : null,
              })
            ),
        };

        return NextResponse.json({
          success: true,
          product:
            serializedProduct,
        });
      }

      const items =
        await ProductService.listProducts(
          vendorIdFilter
        );

      const serializedItems =
        items.map((product) => ({
          ...product,
          price: Number(product.price),
          discountPrice:
            product.discountPrice != null
              ? Number(
                  product.discountPrice
                )
              : null,
        }));

      return NextResponse.json({
        success: true,
        items: serializedItems,
      });
    } catch (error) {
      return handleApiError(error);
    }
  }
);

/* ===========================
   PUT: Update
=========================== */

export const PUT = withApiLogging(
  async (request: NextRequest) => {
    try {
      verifyOrigin(request);

      const session =
        await requireVendor();

      const { searchParams } =
        new URL(request.url);

      const id =
        searchParams.get("id");

      if (!id) {
        throw badRequest(
          "Product ID is required."
        );
      }

      const vendor =
        await VendorService.getActiveVendor(
          session.user.id,
          session.user.role
        );

      const formData =
        await request.formData();

      const images =
        formData
          .getAll("images")
          .filter(
            (file): file is File =>
              file instanceof File &&
              file.size > 0
          );

      const fields:
        Record<string, unknown> = {};

      formData.forEach(
        (value, key) => {
          if (!(value instanceof File)) {
            fields[key] = value;
          }
        }
      );

      const parsed =
        productSchema.safeParse(
          fields
        );

      if (!parsed.success) {
        throw parsed.error;
      }

      const data = parsed.data;

      /* ------------------------------------------------------------------ */
      /* TAGS                                                               */
      /* ------------------------------------------------------------------ */

      const parsedTags =
        ProductValidationService.parseTags(
          fields.tags
        );

      /* ------------------------------------------------------------------ */
      /* CATEGORIES                                                         */
      /* ------------------------------------------------------------------ */

      const parsedCategoryIds =
        ProductValidationService.parseCategoryIds(
          fields.categoryIds,
          fields.categoryId
        );

      await ProductValidationService.validateCategories(
        parsedCategoryIds
      );

      /* ------------------------------------------------------------------ */
      /* VARIANTS                                                           */
      /* ------------------------------------------------------------------ */

      const variants =
        ProductValidationService.parseVariants(
          formData.get("variants")
        );

      ProductValidationService.validateVariants(
        variants
      );

      /* ------------------------------------------------------------------ */
      /* DELETED IMAGES                                                     */
      /* ------------------------------------------------------------------ */

      const deletedImageIds =
        ProductValidationService.parseDeletedImageIds(
          formData.get(
            "deletedImageIds"
          )
        );

      /* ------------------------------------------------------------------ */
      /* PRODUCT                                                            */
      /* ------------------------------------------------------------------ */

      const existingProduct =
        await prisma.product.findUnique({
          where: {
            id,
          },
        });

      if (!existingProduct) {
        throw notFound(
          "Product not found."
        );
      }

      const isAdmin =
        session.user.role === "ADMIN" ||
        session.user.role ===
          "SUPER_ADMIN";

      if (
        existingProduct.vendorProfileId !==
          vendor.id &&
        !isAdmin
      ) {
        throw forbidden(
          "You do not have permission to update this product."
        );
      }

      /* ------------------------------------------------------------------ */
      /* SKU VALIDATION                                                     */
      /* ------------------------------------------------------------------ */

      ProductValidationService.validateSku(
        data.sku,
        variants
      );

      /* ------------------------------------------------------------------ */
      /* IMAGE UPLOAD                                                       */
      /* ------------------------------------------------------------------ */

      const uploadedUrls =
        await CloudinaryService.uploadMany(
          images,
          "products"
        );

      const newImageOperations =
        uploadedUrls.map(
          (url, index) => ({
            url,
            order: index,
            alt: data.title,
          })
        );

      let updated;

      try {
        updated =
          await ProductService.updateProduct({
            userId:
              session.user.id,
            productId: id,
            data,
            parsedTags,
            parsedCategoryIds,
            deletedImageIds,
            newImageOperations,
            variants,
          });
      } catch (error) {
        await CloudinaryService.deleteMany(
          uploadedUrls
        );

        throw error;
      }

      const serializedProduct = {
        ...updated,
        price: Number(
          updated.price
        ),
        discountPrice:
          updated.discountPrice != null
            ? Number(
                updated.discountPrice
              )
            : null,
        variants:
          updated.variants.map(
            (variant) => ({
              ...variant,
              price:
                variant.price != null
                  ? Number(
                      variant.price
                    )
                  : null,
            })
          ),
      };

      return NextResponse.json(
        {
          success: true,
          product:
            serializedProduct,
        },
        {
          status: 200,
        }
      );
    } catch (error) {
      return handleApiError(error);
    }
  }
);

/* ===========================
   DELETE ROUTE
=========================== */

export const DELETE = withApiLogging(
  async (request: NextRequest) => {
    try {
      verifyOrigin(request);

      const session =
        await requireVendor();

      const { searchParams } =
        new URL(request.url);

      const id =
        searchParams.get("id");

      if (!id) {
        throw badRequest(
          "Product ID is required."
        );
      }

      const vendor =
        await VendorService.getActiveVendor(
          session.user.id,
          session.user.role
        );

      if (
        vendor.isSuspended &&
        session.user.role !== "ADMIN"
      ) {
        throw forbidden(
          "Vendor account is suspended."
        );
      }

      const product =
        await ProductService.deleteProduct(
          session.user.id,
          id
        );

      const isAdmin =
        session.user.role === "ADMIN" ||
        session.user.role ===
          "SUPER_ADMIN";

      if (
        product.vendorProfileId !==
          vendor.id &&
        !isAdmin
      ) {
        throw forbidden(
          "You do not have permission to delete this product."
        );
      }

      await CloudinaryService.deleteMany(
        product.images.map(
          (image) => image.url
        )
      );

      return NextResponse.json(
        {
          success: true,
          message:
            "Product deleted successfully.",
        },
        {
          status: 200,
        }
      );
    } catch (error) {
      return handleApiError(error);
    }
  }
);
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { Prisma, ProductStatus } from "@prisma/client";
import { z } from "zod";
import { uploadToCloudinary, deleteFromCloudinary } from "@/app/lib/cloudinary";
import  { badRequest, notFound, forbidden } from "@/app/lib/auth/errors"
import{
  requireVendor,
  handleApiError}
 from "@/app/lib/auth/api";



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
  status: z.nativeEnum(ProductStatus).default(ProductStatus.ACTIVE),
  stock: z.coerce.number().int().default(0),
  sku: z.string().trim().optional().nullable(),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  isFeatured: z.preprocess((val) => val === "true" || val === true, z.boolean()).optional(),
  isFlashSale: z.preprocess((val) => val === "true" || val === true, z.boolean()).optional(),
  isNewArrival: z.preprocess((val) => val === "true" || val === true, z.boolean()).optional(),
  shippingMethod: z.string().optional().nullable(),
  weight: z.coerce.number().optional().nullable(),

  tags: z.any().optional(), // add this
});

/* ===========================
   POST: Create Product
=========================== */


export async function POST(request: NextRequest) {
  try {
   

    const session = await requireVendor();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const vendor = await prisma.vendorProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true, isSuspended: true }
    });

    if (!vendor) {

      return NextResponse.json({ success: false, error: "Vendor profile not found" }, { status: 404 });
    }

    if (vendor.isSuspended) {
      return NextResponse.json({ success: false, error: "Account suspended" }, { status: 403 });
    }


    // ── Parse FormData ──────────────────────────────────────────────────────
    const formData = await request.formData();

    const fields: Record<string, any> = {};
    const files: File[] = [];

    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        if (value.size > 0) files.push(value);
      } else {
        fields[key] = value;
      }
    }

    // ── Validate main product data ─────────────────────────────────────────
    const parsed = productSchema.safeParse(fields);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;

        return NextResponse.json(
          {
            success: false,
            error: "Validation error",
            errors: fieldErrors,
          },
          { status: 400 }
        );
    }

    const data = parsed.data;

    

    const parsedTags =
      typeof fields.tags === "string"
        ? fields.tags
            .split(",")
            .map((tag: string) => tag.trim())
            .filter(Boolean)
        : Array.isArray(fields.tags)
        ? fields.tags
            .map((tag: string) => String(tag).trim())
            .filter(Boolean)
        : [];

    // ── Parse variants safely ───────────────────────────────────────────────
    let variants = [];
    try {
      variants = JSON.parse((fields.variants as string) || "[]");
    } catch (jsonErr) {
      return NextResponse.json(
        { success: false, error: "Invalid variants JSON format" },
        { status: 400 }
      );
    }


    for (const variant of variants) {
      if (
        !variant.name ||
        typeof variant.name !== "string" ||
        !variant.name.trim()
      ) {
        throw badRequest("Every variant must have a name.");
      }

      if (
        variant.stock != null &&
        (isNaN(Number(variant.stock)) || Number(variant.stock) < 0)
      ) {
        throw badRequest(
          `Invalid stock value for variant "${variant.name}".`
        );
      }

      if (
        variant.price != null &&
        (isNaN(Number(variant.price)) || Number(variant.price) < 0)
      ) {
        throw badRequest(
          `Invalid price for variant "${variant.name}".`
        );
      }
    }


    const submittedSkus = [
        data.sku,
        ...variants.map((v: any) => v.sku),
      ]
        .filter((sku): sku is string => typeof sku === "string" && sku.trim().length > 0)
        .map((sku) => sku.trim());

      const duplicateSkus = submittedSkus.filter(
        (sku, index) => submittedSkus.indexOf(sku) !== index
      );

      if (duplicateSkus.length > 0) {
        throw badRequest(
          `Duplicate SKU detected: ${duplicateSkus.join(", ")}`
        );
      }


      if (submittedSkus.length > 0) {
        const existingSkus = await prisma.product.findMany({
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


      const existingVariantSkus = await prisma.variant.findMany({
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
  typeof fields.categoryIds === "string"
    ? (() => {
        try {
          const parsed = JSON.parse(fields.categoryIds);
          return Array.isArray(parsed)
            ? parsed.map((id: string) => String(id).trim()).filter(Boolean)
            : [];
        } catch {
          return fields.categoryIds
            .split(",")
            .map((id: string) => id.trim())
            .filter(Boolean);
        }
      })()
    : Array.isArray(fields.categoryIds)
    ? fields.categoryIds.map((id: string) => String(id).trim()).filter(Boolean)
    : fields.categoryId
    ? [fields.categoryId]
    : [];

    if (parsedCategoryIds.length > 0) {
      const existingCategories = await prisma.category.findMany({
        where: {
          id: {
            in: parsedCategoryIds,
          },
        },
        select: {
          id: true,
        },
      });

      if (existingCategories.length !== parsedCategoryIds.length) {
        throw badRequest(
          "One or more selected categories no longer exist."
        );
      }
    }

    const slug = `${data.title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")}-${Date.now()}`;


      

    // ── Upload images ───────────────────────────────────────────────────────
    const imageUrls: string[] = [];
    for (const file of files) {
      try {
        const url = await uploadToCloudinary(file, "products");
        if (url) imageUrls.push(url as string);
      } catch (uploadErr) {
        // Continue with other files – don't fail entire request
      }
    }
  

    // ── Transaction ─────────────────────────────────────────────────────────
    let product;
    try {
     product = await prisma.$transaction(async (tx) => {

      const newProduct = await tx.product.create({
        data: {
          title: data.title,
          slug,
          tags: parsedTags,
          sku: data.sku || null,
          description: data.description,
          brand: data.brand,
          price: new Prisma.Decimal(data.price.toString()),
          discountPrice: data.discountPrice ? new Prisma.Decimal(data.discountPrice.toString()) : null,
          stock: data.stock,
          status: data.status,
          metaTitle: data.metaTitle,
          metaDescription: data.metaDescription,
          isFeatured: data.isFeatured ?? false,
          isFlashSale: data.isFlashSale ?? false,
          isNewArrival: data.isNewArrival ?? false,
          shippingMethod: data.shippingMethod,
          weight: data.weight,
          vendorProfile: { connect: { id: vendor.id } },

          category:
            parsedCategoryIds[0] || data.categoryId
              ? { connect: { id: parsedCategoryIds[0] || data.categoryId! } }
              : undefined,
          categories:
            parsedCategoryIds.length > 0
              ? { connect: parsedCategoryIds.map((id) => ({ id })) }
              : undefined,
          
          
              images: {
            create: imageUrls.map((url, index) => ({ url, order: index, alt: data.title })),
          },
          variants: {
            create: variants.map((v: any) => ({
              name: v.name,
              sku: v.sku || `${slug}-${Math.random().toString(36).substring(7)}`,
              price: v.price ? new Prisma.Decimal(v.price.toString()) : null,
              stock: Number(v.stock) || 0,
              attributes: v.attributes || { name: v.name }
            }))
          }
        },
              });


      await tx.vendorOnboarding.updateMany({
        where: { vendorProfileId: vendor.id },
        data: { productDone: true }
      });


          return newProduct;
              });
          } catch (error) {
              await Promise.allSettled(
                imageUrls.map(async (url) => {
                  try {
                    await deleteFromCloudinary(url);
                  } catch (cleanupError) {
                    console.error(
                      "Failed to clean up Cloudinary image:",
                      cleanupError
                    );
                  }
                })
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


/* ===========================
   GET: Fetching
=========================== */
export async function GET(request: NextRequest) {
  try {
      const { searchParams } = new URL(request.url);
      const id = searchParams.get("id");
      const viewOwn = searchParams.get("own") === "true";

      let session = null;

      if (viewOwn) {
          session = await requireVendor();
      }


      let vendorIdFilter: string | undefined;

        if (viewOwn) {
          const profile = await prisma.vendorProfile.findUnique({
            where: {
              userId: session!.user.id,
            },
            select: {
              id: true,
            },
          });

          if (!profile) {
            throw notFound("Vendor profile not found.");
          }

          vendorIdFilter = profile.id;
        }

        if (id) {
          const product = await prisma.product.findUnique({
              where: { id },
              include: { 
            category: { select: { id: true, name: true } },
            categories: { select: { id: true, name: true } },
            images: { orderBy: { order: "asc" } }, 
            variants: {
            orderBy: {
              name: "asc",
            },
          },
            vendorProfile: { select: { isSuspended: true, status: true, id: true } }
          },
        });

      if (!product) throw notFound("Product not found.");

      if (!viewOwn && (product.vendorProfile.isSuspended || product.vendorProfile.status !== "APPROVED")) {
        throw forbidden("Product is unavailable.");
      }

      const serializedProduct = {
        ...product,
        price: Number(product.price),
        discountPrice:
          product.discountPrice != null
            ? Number(product.discountPrice)
            : null,
        variants: product.variants.map((variant) => ({
          ...variant,
          price:
            variant.price != null
              ? Number(variant.price)
              : null,
        })),
      };

      return NextResponse.json({
        success: true,
        product: serializedProduct,
      });

      
    }

    const items = await prisma.product.findMany({
        where: { 
          vendorProfileId: vendorIdFilter, 
          status: viewOwn ? undefined : "ACTIVE",
          vendorProfile: viewOwn ? undefined : { isSuspended: false, status: "APPROVED" }
        },
        orderBy: { createdAt: "desc" },
        include: {
          category: { select: { id: true, name: true } },
          categories: { select: { id: true, name: true } },
          images: { orderBy: { order: "asc" } }
        },
      });

      const serializedItems = items.map((product) => ({
      ...product,
      price: Number(product.price),
      discountPrice:
        product.discountPrice != null
          ? Number(product.discountPrice)
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

/* ===========================
   PUT: Update
=========================== */
      export async function PUT(request: NextRequest) {
        try {
          const session = await requireVendor();

          const { searchParams } = new URL(request.url);
          const id = searchParams.get("id");

          if (!id) {
            throw badRequest("Product ID is required.");
          }

          const vendor = await prisma.vendorProfile.findUnique({
            where: {
              userId: session.user.id,
            },
            select: {
              id: true,
              isSuspended: true,
            },
          });

          if (!vendor) {
            throw notFound("Vendor profile not found.");
          }

          if (vendor.isSuspended && session.user.role !== "ADMIN") {
            throw forbidden("Vendor account is suspended.");
          }

          const formData = await request.formData();

          const fields: Record<string, unknown> = {};

          formData.forEach((value, key) => {
            if (!(value instanceof File)) {
              fields[key] = value;
            }
          });

          const parsed = productSchema.safeParse(fields);

          if (!parsed.success) {
            throw parsed.error;
          }

          const data = parsed.data;

          /* ------------------------------------------------------------------ */
          /* TAGS                                                               */
          /* ------------------------------------------------------------------ */

          let parsedTags: string[] = [];

          try {
            parsedTags =
              typeof fields.tags === "string"
                ? JSON.parse(fields.tags)
                : Array.isArray(fields.tags)
                ? fields.tags.map(String)
                : [];

            parsedTags = parsedTags
              .map((tag) => tag.trim())
              .filter(Boolean);
          } catch {
            parsedTags =
              typeof fields.tags === "string"
                ? fields.tags
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter(Boolean)
                : [];
          }

          /* ------------------------------------------------------------------ */
          /* CATEGORIES                                                         */
          /* ------------------------------------------------------------------ */

          const parsedCategoryIds =
            typeof fields.categoryIds === "string"
              ? (() => {
                  try {
                    const parsed = JSON.parse(fields.categoryIds);

                    return Array.isArray(parsed)
                      ? parsed
                          .map((id: string) => String(id).trim())
                          .filter(Boolean)
                      : [];
                  } catch {
                    return fields.categoryIds
                      .split(",")
                      .map((id: string) => id.trim())
                      .filter(Boolean);
                  }
                })()
              : Array.isArray(fields.categoryIds)
              ? fields.categoryIds
                  .map((id) => String(id).trim())
                  .filter(Boolean)
              : fields.categoryId
              ? [String(fields.categoryId)]
              : [];

          if (parsedCategoryIds.length > 0) {
            const existingCategories = await prisma.category.findMany({
              where: {
                id: {
                  in: parsedCategoryIds,
                },
              },
              select: {
                id: true,
              },
            });

            if (existingCategories.length !== parsedCategoryIds.length) {
              throw badRequest(
                "One or more selected categories no longer exist."
              );
            }
          }

          /* ------------------------------------------------------------------ */
          /* VARIANTS                                                           */
          /* ------------------------------------------------------------------ */

          let variants: any[] = [];

          try {
            variants = JSON.parse(
              (formData.get("variants") as string) || "[]"
            );
          } catch {
            throw badRequest(
              "Invalid variants JSON format."
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
              (isNaN(Number(variant.stock)) ||
                Number(variant.stock) < 0)
            ) {
              throw badRequest(
                `Invalid stock for variant "${variant.name}".`
              );
            }

            if (
              variant.price != null &&
              (isNaN(Number(variant.price)) ||
                Number(variant.price) < 0)
            ) {
              throw badRequest(
                `Invalid price for variant "${variant.name}".`
              );
            }
          }

          /* ------------------------------------------------------------------ */
          /* DELETED IMAGES                                                     */
          /* ------------------------------------------------------------------ */

          let deletedImageIds: string[] = [];

          try {
            deletedImageIds = JSON.parse(
              (formData.get("deletedImageIds") as string) || "[]"
            );
          } catch {
            throw badRequest(
              "Invalid deletedImageIds JSON."
            );
          }

          /* ------------------------------------------------------------------ */
          /* PRODUCT                                                            */
          /* ------------------------------------------------------------------ */

          const existingProduct = await prisma.product.findUnique({
            where: {
              id,
            },
          });

          if (!existingProduct) {
            throw notFound("Product not found.");
          }

          const isAdmin =
            session.user.role === "ADMIN" ||
            session.user.role === "SUPER_ADMIN";

          if (
            existingProduct.vendorProfileId !== vendor.id &&
            !isAdmin
          ) {
            throw forbidden(
              "You do not have permission to update this product."
            );
          }

          /* ------------------------------------------------------------------ */
          /* SKU VALIDATION                                                     */
          /* ------------------------------------------------------------------ */

          const submittedSkus = [
            data.sku,
            ...variants.map((v) => v.sku),
          ]
            .filter(
              (sku): sku is string =>
                typeof sku === "string" &&
                sku.trim().length > 0
            )
            .map((sku) => sku.trim());

          const duplicateSkus = submittedSkus.filter(
            (sku, index) =>
              submittedSkus.indexOf(sku) !== index
          );

          if (duplicateSkus.length > 0) {
            throw badRequest(
              `Duplicate SKU detected: ${duplicateSkus.join(", ")}`
            );
          }

          /* ------------------------------------------------------------------ */
          /* IMAGE UPLOAD                                                       */
          /* ------------------------------------------------------------------ */

          const uploadedUrls: string[] = [];

          const newImageOperations: Prisma.ProductImageCreateWithoutProductInput[] = [];

          for (const [key, value] of formData.entries()) {
            if (!(value instanceof File) || value.size === 0) {
              continue;
            }

            const url = await uploadToCloudinary(
              value,
              "products"
            );

            uploadedUrls.push(url);

            newImageOperations.push({
              url,
              order: key === "mainImage" ? 0 : 1,
              alt: data.title,
            });
          }

 let updated;

try {
  updated = await prisma.$transaction(async (tx) => {
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
        productId: id,
      },
    });

    return tx.product.update({
      where: {
        id,
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

        metaTitle: data.metaTitle || null,
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
          parsedCategoryIds[0] || data.categoryId
            ? {
                connect: {
                  id:
                    parsedCategoryIds[0] ??
                    data.categoryId!,
                },
              }
            : {
                disconnect: true,
              },

        categories: {
          set: parsedCategoryIds.map((id) => ({
            id,
          })),
        },

        images:
          newImageOperations.length > 0
            ? {
                create: newImageOperations,
              }
            : undefined,

        variants: {
          create: variants.map((variant) => ({
            name: variant.name,

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
              Number(variant.stock) || 0,

            attributes:
              variant.attributes || {
                name: variant.name,
              },
          })),
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
} catch (error) {
  await Promise.allSettled(
    uploadedUrls.map(async (url) => {
      try {
        await deleteFromCloudinary(url);
      } catch {
        // Ignore cleanup failures
      }
    })
  );

  throw error;
}

const serializedProduct = {
  ...updated,

  price: Number(updated.price),

  discountPrice:
    updated.discountPrice != null
      ? Number(updated.discountPrice)
      : null,

  variants: updated.variants.map((variant) => ({
    ...variant,

    price:
      variant.price != null
        ? Number(variant.price)
        : null,
  })),
};

return NextResponse.json(
  {
    success: true,
    product: serializedProduct,
  },
  {
    status: 200,
  }
);
} catch (error) {
  return handleApiError(error);
}

      }




/* ===========================
   DELETE ROUTE
=========================== */

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireVendor();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      throw badRequest("Product ID is required.");
    }

    const vendor = await prisma.vendorProfile.findUnique({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        isSuspended: true,
      },
    });

    if (!vendor) {
      throw notFound("Vendor profile not found.");
    }

    if (vendor.isSuspended && session.user.role !== "ADMIN") {
      throw forbidden("Vendor account is suspended.");
    }

    const product = await prisma.product.findUnique({
      where: {
        id,
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
      throw notFound("Product not found.");
    }

    const isAdmin =
      session.user.role === "ADMIN" ||
      session.user.role === "SUPER_ADMIN";

    if (
      product.vendorProfileId !== vendor.id &&
      !isAdmin
    ) {
      throw forbidden(
        "You do not have permission to delete this product."
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.productImage.deleteMany({
        where: {
          productId: id,
        },
      });

      await tx.variant.deleteMany({
        where: {
          productId: id,
        },
      });

      await tx.product.delete({
        where: {
          id,
        },
      });
    });

    if (product.images.length > 0) {
      await Promise.allSettled(
        product.images.map(async (image) => {
          try {
            await deleteFromCloudinary(image.url);
          } catch {
            // Ignore Cloudinary cleanup failures
          }
        })
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Product deleted successfully.",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
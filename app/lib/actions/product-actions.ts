"use server";

import { revalidatePath } from "next/cache";

import {
  requireVendorProfile,
} from "@/app/lib/auth/api";

import { forbidden } from "@/app/lib/auth/errors";

import { ProductService } from "@/app/lib/services/product.service";

export async function createProduct(
  vendorProfileId: string,
  data: any
) {
  try {
    const { session, vendor } =
      await requireVendorProfile();

    if (vendorProfileId !== vendor.id) {
      throw forbidden(
        "You do not have permission to create products for this vendor."
      );
    }

    const product =
      await ProductService.createProduct({
        userId: session.user.id,
        vendorId: vendor.id,
        data,
        slug: data.slug,
        parsedTags: Array.isArray(data.tags)
          ? data.tags
          : [],
        parsedCategoryIds:
          Array.isArray(data.categoryIds)
            ? data.categoryIds
            : data.categoryId
              ? [data.categoryId]
              : [],
        imageUrls:
          Array.isArray(data.imageUrls)
            ? data.imageUrls
            : [],
        variants:
          Array.isArray(data.variants)
            ? data.variants
            : [],
      });

    revalidatePath("/account/vendor");

    return {
      success: true,
      product,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create product.",
    };
  }
}

export async function updateProductRating(
  productId: string
) {
  const result =
    await ProductService.updateRating(
      productId
    );

  revalidatePath(
    `/product/${productId}`
  );

  return result;
}

export async function toggleProductStatus(
  productId: string
) {
  try {
    const { vendor } =
      await requireVendorProfile();

    const updated =
      await ProductService.togglePublicationStatus(
        productId,
        vendor.id
      );

    revalidatePath(
      "/account/vendor"
    );

    revalidatePath(
      `/product/${updated.id}`
    );

    return {
      success: true,
      newState:
        updated.isPublished,
    };
  } catch {
    return {
      success: false,
      error:
        "Failed to update product status",
    };
  }
}
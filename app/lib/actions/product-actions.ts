"use server";

import { revalidatePath } from "next/cache";

import { requireVendorProfile } from "@/app/lib/auth/api";
import { ProductService } from "@/app/lib/services/product.service";

export async function createProduct(
  vendorProfileId: string,
  data: any
) {
  try {
    await requireVendorProfile();

    const product =
      await ProductService.createProduct(
        {
          vendorId: vendorProfileId,
          data,
          slug: data.slug,
          parsedTags: Array.isArray(data.tags)
            ? data.tags
            : [],
          parsedCategoryIds: Array.isArray(data.categoryIds)
            ? data.categoryIds
            : data.categoryId
              ? [data.categoryId]
              : [],
          imageUrls: Array.isArray(data.imageUrls)
            ? data.imageUrls
            : [],
          variants: Array.isArray(data.variants)
            ? data.variants
            : [],
        }
      );

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
          : "Failed to list product.",
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

  revalidatePath(`/product/${productId}`);

  return result;
}

export async function toggleProductStatus(
  productId: string
) {
  try {
    await requireVendorProfile();

    const updated =
      await ProductService.togglePublicationStatus(
        productId
      );

    revalidatePath("/account/vendor");
    revalidatePath(`/product/${updated.id}`);

    return {
      success: true,
      newState: updated.isPublished,
    };
  } catch {
    return {
      success: false,
      error:
        "Failed to update product status",
    };
  }
}

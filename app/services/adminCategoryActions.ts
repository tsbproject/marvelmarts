"use server";

import { revalidatePath } from "next/cache";
import { CategoryService } from "@/app/lib/services/category.service";

export async function toggleCategoryFeatured(
  id: string,
  currentStatus: boolean
) {
  try {
    await CategoryService.toggleFeaturedStatus(
      id,
      currentStatus
    );

    revalidatePath("/dashboard/admins/categories");
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    console.error("Tactical Toggle Error:", error);

    return {
      success: false,
      error:
        error.message ??
        "Failed to update feature status.",
    };
  }
}

export async function updateCategoryAction(
  id: string,
  data: {
    name: string;
    slug: string;
    imageUrl?: string | null;
    isFeatured?: boolean;
    parentId?: string | null;
    position?: number;
    metaTitle?: string | null;
    metaDescription?: string | null;
  }
) {
  try {
    await CategoryService.updateCategory(
      id,
      data
    );

    revalidatePath("/dashboard/admins/categories");
    revalidatePath(
      `/dashboard/admins/categories/${id}/edit`
    );
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    console.error("Tactical Update Error:", error);

    return {
      success: false,
      error:
        error.message ??
        "Failed to update category.",
    };
  }
}

export async function deleteCategoryAction(
  id: string
) {
  try {
    await CategoryService.deleteCategory(id);

    revalidatePath("/dashboard/admins/categories");
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    console.error(
      "Category Deletion Error:",
      error
    );

    return {
      success: false,
      error:
        error.message ??
        "Could not delete category.",
    };
  }
}

export async function createCategoryAction(
  data: {
    name: string;
    slug: string;
    imageUrl?: string | null;
    isFeatured?: boolean;
    parentId?: string | null;
    position?: number;
    metaTitle?: string | null;
    metaDescription?: string | null;
  }
) {
  try {
    const category =
      await CategoryService.createCategory(
        data
      );

    revalidatePath("/dashboard/admins/categories");
    revalidatePath("/");

    return {
      success: true,
      id: category.id,
    };
  } catch (error: any) {
    console.error(
      "Tactical Creation Error:",
      error
    );

    return {
      success: false,
      error:
        error.message ??
        "Failed to create category.",
    };
  }
}
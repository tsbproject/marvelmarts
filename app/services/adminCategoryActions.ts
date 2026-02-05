






// app/services/adminCategoryActions.ts
"use server";

import prisma from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Toggles the 'isFeatured' status for the Homepage display.
 */
export async function toggleCategoryFeatured(id: string, currentStatus: boolean) {
  try {
    await prisma.category.update({
      where: { id },
      data: { isFeatured: !currentStatus },
    });

    // Trigger incremental static regeneration for affected paths
    revalidatePath("/dashboard/admins/categories");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Tactical Toggle Error:", error);
    return { success: false, error: "Failed to update feature status." };
  }
}

/**
 * Updates a category's core details including SEO and Imagery.
 */
export async function updateCategoryAction(id: string, data: {
  name: string;
  slug: string;
  imageUrl?: string | null;
  isFeatured?: boolean;
  parentId?: string | null;
  position?: number;
  metaTitle?: string | null;
  metaDescription?: string | null;
}) {
  try {
    await prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        imageUrl: data.imageUrl || null,
        isFeatured: Boolean(data.isFeatured),
        parentId: data.parentId === "" ? null : data.parentId,
        position: Number(data.position) || 0,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
      },
    });

    // Clear Next.js cache for these routes
    revalidatePath("/dashboard/admins/categories");
    revalidatePath(`/dashboard/admins/categories/${id}/edit`);
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    console.error("Tactical Update Error:", error);
    return { success: false, error: error.message || "Failed to update category details." };
  }
}

/**
 * Deletes a category.
 * Note: Prisma will handle children based on your schema's referential integrity.
 */
export async function deleteCategoryAction(id: string) {
  try {
    await prisma.category.delete({
      where: { id },
    });

    revalidatePath("/dashboard/admins/categories");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Category Deletion Error:", error);
    return { success: false, error: "Could not delete category. Ensure it has no dependencies." };
  }
}




/**
 * Creates a new category with sanitized data.
 */
export async function createCategoryAction(data: {
  name: string;
  slug: string;
  imageUrl?: string | null;
  isFeatured?: boolean;
  parentId?: string | null;
  position?: number;
  metaTitle?: string | null;
  metaDescription?: string | null;
}) {
  try {
    const newCategory = await prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        imageUrl: data.imageUrl || null,
        isFeatured: Boolean(data.isFeatured),
        parentId: data.parentId === "" ? null : data.parentId,
        position: Number(data.position) || 0,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
      },
    });

    revalidatePath("/dashboard/admins/categories");
    revalidatePath("/");
    
    return { success: true, id: newCategory.id };
  } catch (error: any) {
    console.error("Tactical Creation Error:", error);
    return { success: false, error: error.message || "Failed to create category." };
  }
}

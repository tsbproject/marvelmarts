import { prisma } from "@/app/lib/prisma";
import { badRequest } from "@/app/lib/auth/errors";

export class ProductValidationService {
  static parseTags(value: unknown): string[] {
    try {
      const tags: string[] =
        typeof value === "string"
          ? JSON.parse(value)
          : Array.isArray(value)
          ? value.map(String)
          : [];

      return tags
        .map((tag: string) => tag.trim())
        .filter(Boolean);
    } catch {
      return typeof value === "string"
        ? value
            .split(",")
            .map((tag: string) => tag.trim())
            .filter(Boolean)
        : [];
    }
  }

  static parseCategoryIds(
    categoryIds: unknown,
    categoryId?: unknown
  ): string[] {
    if (typeof categoryIds === "string") {
      try {
        const parsed = JSON.parse(categoryIds);

        if (Array.isArray(parsed)) {
          return parsed
            .map(String)
            .map((id: string) => id.trim())
            .filter(Boolean);
        }
      } catch {
        return categoryIds
          .split(",")
          .map((id: string) => id.trim())
          .filter(Boolean);
      }
    }

    if (Array.isArray(categoryIds)) {
      return categoryIds
        .map(String)
        .map((id: string) => id.trim())
        .filter(Boolean);
    }

    return categoryId ? [String(categoryId)] : [];
  }

  static async validateCategories(
    categoryIds: string[]
  ) {
    if (!categoryIds.length) return;

    const existing =
      await prisma.category.findMany({
        where: {
          id: {
            in: categoryIds,
          },
        },
        select: {
          id: true,
        },
      });

    if (existing.length !== categoryIds.length) {
      throw badRequest(
        "One or more selected categories no longer exist."
      );
    }
  }

  static parseDeletedImageIds(
    value: unknown
  ): string[] {
    try {
      const parsed =
        typeof value === "string"
          ? JSON.parse(value)
          : [];

      return Array.isArray(parsed)
        ? parsed.map(String)
        : [];
    } catch {
      throw badRequest(
        "Invalid deletedImageIds JSON."
      );
    }
  }

  static parseVariants(
    value: unknown
  ): any[] {
    try {
      if (!value) return [];

      return JSON.parse(
        String(value)
      );
    } catch {
      throw badRequest(
        "Invalid variants JSON format."
      );
    }
  }

  static validateVariants(
    variants: any[]
  ) {
    for (const variant of variants) {
      if (
        !variant.name ||
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
          `Invalid stock for variant "${variant.name}".`
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
  }

  static validateSku(
    productSku: string | null | undefined,
    variants: any[]
  ) {
    const submittedSkus = [
      productSku,
      ...variants.map(
        (variant) => variant.sku
      ),
    ]
      .filter(
        (sku): sku is string =>
          typeof sku === "string" &&
          sku.trim().length > 0
      )
      .map((sku) => sku.trim());

    const duplicates =
      submittedSkus.filter(
        (sku, index) =>
          submittedSkus.indexOf(sku) !== index
      );

    if (duplicates.length) {
      throw badRequest(
        `Duplicate SKU detected: ${duplicates.join(", ")}`
      );
    }
  }
}
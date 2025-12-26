import { z } from "zod";

export const productSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  brand: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  discountPrice: z.number().positive().optional(),
  categoryId: z.string().min(1, "Category ID is required"),
  images: z.array(z.string().url()).optional(),
  variants: z.array(
    z.object({
      name: z.string().min(1),
      sku: z.string().optional(),
      price: z.number().nonnegative(),
    })
  ).optional(),
  status: z.enum(["ACTIVE", "DRAFT", "ARCHIVED"]).optional(),
  isFeatured: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
});

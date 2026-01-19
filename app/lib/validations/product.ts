import { z } from "zod";

export const productSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  brand: z.string().optional(),
  // ⚡ Use .coerce to handle strings from FormData
  price: z.coerce.number().positive("Price must be positive"),
  discountPrice: z.coerce.number().nonnegative().optional().nullable(),
  stock: z.coerce.number().nonnegative().default(0),
  sku: z.string().optional().nullable(),
  
  categoryId: z.string().min(1, "Category is required"),
  
  // Enums must match your DB exactly
  status: z.enum(["ACTIVE", "DRAFT", "ARCHIVED"]).default("ACTIVE"),
  
  // ⚡ Coerce booleans because FormData sends them as strings "true"/"false"
  isFeatured: z.preprocess((val) => val === "true" || val === true, z.boolean()).optional(),
  
  metaTitle: z.string().max(60).optional().nullable(),
  metaDescription: z.string().max(160).optional().nullable(),
  
  // Optional: if you plan to use these later
  images: z.array(z.string().url()).optional(),
  variants: z.array(
    z.object({
      name: z.string().min(1),
      sku: z.string().optional(),
      price: z.number().nonnegative(),
    })
  ).optional(),
});
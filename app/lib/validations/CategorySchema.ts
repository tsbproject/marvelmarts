import { z } from "zod";

// 1. Define the base schema without the children first
// Use a union for dates to handle both ISO strings and Date objects
const DateSchema = z.union([
  z.date(),
  z.string().transform((str) => new Date(str))
]);

// 2. Define the recursive schema
export const CategoryTreeSchema: any = z.lazy(() =>
  z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    parentId: z.string().nullable(),
    position: z.number().default(0),
    createdAt: DateSchema,
    updatedAt: DateSchema,
    imageUrl: z.preprocess(
      (val) => (val === "" ? null : val),
      z.string().nullable().optional()
    ),
    metaTitle: z.string().nullable().optional(),
    metaDescription: z.string().nullable().optional(),
    // We use lazy here to allow the recursion
    children: z.array(CategoryTreeSchema).default([]),
  })
);

// 3. Extract the Type directly from Zod
// This replaces the manual 'export type CategoryTree' in your Menu file
export type CategoryTree = z.infer<typeof CategoryTreeSchema>;

export const CategoryTreeArraySchema = z.array(CategoryTreeSchema);

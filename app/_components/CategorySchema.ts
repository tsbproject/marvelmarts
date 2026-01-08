import { z } from "zod";
import type { CategoryTree } from "./CategoryMenu";

export const CategoryTreeSchema: z.ZodType<CategoryTree> = z.lazy(() =>
  z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    parentId: z.string().nullable(),
    position: z.number(),
    createdAt: z.string().transform((d) => new Date(d)),
    updatedAt: z.string().transform((d) => new Date(d)),
    imageUrl: z.string().nullable(),
    metaTitle: z.string().nullable(),
    metaDescription: z.string().nullable(),
    children: z.array(CategoryTreeSchema),
  })
);

export const CategoryTreeArraySchema = z.array(CategoryTreeSchema);

// schemas/cart.ts
import { z } from "zod";

// For updating quantity of a cart item
export const cartItemUpdateSchema = z.object({
  id: z.number().int().positive(),
  qty: z.number().int().min(1),
});

// For deleting a cart item
export const cartItemDeleteSchema = z.object({
  id: z.number().int().positive(),
});

// For adding a new cart item (example)
export const cartItemAddSchema = z.object({
  productId: z.string().uuid(),   // adjust based on your schema
  qty: z.number().int().min(1),
});

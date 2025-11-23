// app/types/product.ts

export interface ProductUpdate {
  id: string;       // Change to 'string' based on your Prisma schema
  title: string;
  description: string;
  price: number;    // Converting Prisma Decimal to number
  discountPrice?: number | null;  // Optional, converting Prisma Decimal to number
  stock: number;
  // Add any other fields that are relevant for updating a product
}

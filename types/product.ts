// types/product.ts

export interface ProductUpdate {
  id: string; // Product ID, assuming it exists for updates
  title: string;
  description: string;
  price: number;
  discountPrice?: number | null;
  categoryId: string;  // Add categoryId here
  images?: string[];  // Array of image URLs
  variants?: string[];  // Array of variant identifiers
}

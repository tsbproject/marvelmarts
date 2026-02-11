// types/product.ts
// 1. Define exactly what the Client Component expects
export interface SerializedProduct {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  discountPrice: number | null;
  categoryName: string;
  images: { url: string }[];
  imageUrl: string;
  rating?: number;
  reviewCount?: number;
  stock: number;
  brand?: string | null;
  createdAt?: string; 
  updatedAt?: string;
  variantId?: string;
  isTrending?: boolean;
  isPublished: boolean;


}

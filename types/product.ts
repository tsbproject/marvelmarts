



// types/product.ts

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
  shippingMethod?: string | null;
  brand?: string | null;
  createdAt?: string; 
  updatedAt?: string;
  variantId?: string;
  isTrending?: boolean;
  isPublished: boolean;

  
  // Vendor-related data
  vendorProfileId: string;
  
  // This object represents the relation to the VendorProfile model
  vendorProfile?: {
    storeName: string;
    isVerified: boolean;
    // Phase 5 Store relation where the actual store slug is stored
    store?: {
      slug: string;
    };
  };

  // Keep these if you flatten them during serialization on the server
  name: string; 

  boostUntil?: string | Date | null;
}


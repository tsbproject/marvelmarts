import { SerializedProduct } from "@/types/product";

export interface ProductImageProps {
  product: SerializedProduct;
  imageUrl: string;
  isList: boolean;
  isOwner: boolean;
  isWishlisted: boolean;
  isBoosted: boolean;
  discountPercentage?: number;
  onWishlist: () => void;
  onQuickView: () => void;
}
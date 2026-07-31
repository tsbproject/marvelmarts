import { SerializedProduct } from "@/types/product";

export interface ProductCardProps {
  product: SerializedProduct;
  onQuickView?: (p: SerializedProduct) => void;
  onViewDetails?: () => void;
  viewMode?: "grid" | "list";
  isOwner?: boolean;
}

export interface PriceState {
  rawPrice: number;
  rawDiscountPrice: number;
  displayPrice: number;
  hasRealDiscount: boolean;
  discountPercentage: number | null;
}
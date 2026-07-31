import { SerializedProduct } from "@/types/product";

export interface BaseCardProps {
  product: SerializedProduct;
  isList?: boolean;
  isOwner?: boolean;
}

export interface ProductCardProps extends BaseCardProps {
  onQuickView?: (p: SerializedProduct) => void;
  onViewDetails?: () => void;
  viewMode?: "grid" | "list";
}
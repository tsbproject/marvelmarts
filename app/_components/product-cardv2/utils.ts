import { SerializedProduct } from "@/types/product";
import { getDaysRemaining } from "@/app/lib/utils/boost-utils";
import { PriceState } from "./types";

export function getValidImage(product: SerializedProduct): string {
  if (typeof product.imageUrl === "string" && product.imageUrl.trim()) {
    return product.imageUrl;
  }

  if (Array.isArray(product.images) && product.images.length > 0) {
    const firstValidImage = product.images.find(
      (img: any) => typeof img?.url === "string" && img.url.trim()
    );
    if (firstValidImage?.url) return firstValidImage.url;
  }

  return "/placeholder-image.png";
}

export function getProductSlug(product: SerializedProduct): string | undefined {
  return typeof product.slug === "string"
    ? product.slug
    : (product.slug as any)?.current;
}

export function getPriceState(product: SerializedProduct): PriceState {
  const rawPrice = Number(product.price) || 0;
  const rawDiscountPrice = Number(product.discountPrice) || 0;
  const displayPrice = rawDiscountPrice > 0 ? rawDiscountPrice : rawPrice;
  const hasRealDiscount = rawDiscountPrice > 0 && rawDiscountPrice < rawPrice;
  const discountPercentage = hasRealDiscount
    ? Math.round(((rawPrice - rawDiscountPrice) / rawPrice) * 100)
    : null;

  return {
    rawPrice,
    rawDiscountPrice,
    displayPrice,
    hasRealDiscount,
    discountPercentage,
  };
}

export function getBoostState(product: SerializedProduct) {
  const daysLeft = getDaysRemaining((product as any).boostUntil);
  return {
    daysLeft,
    isBoosted: daysLeft > 0,
  };
}
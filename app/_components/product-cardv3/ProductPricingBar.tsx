"use client";

import React from "react";
import { ShoppingCart } from "lucide-react";
import { formatNaira } from "@/app/lib/FormatNaira";
import { BaseCardProps } from "./ProductCardTypes";

interface PricingBarProps extends BaseCardProps {
  handleAddToCart: (e: React.MouseEvent) => void;
}

export const ProductPricingBar: React.FC<PricingBarProps> = ({
  product,
  isOwner,
  handleAddToCart,
}) => {
  const rawPrice = Number(product.price) || 0;
  const rawDiscountPrice = Number(product.discountPrice) || 0;
  const displayPrice = rawDiscountPrice > 0 ? rawDiscountPrice : rawPrice;
  const hasRealDiscount = rawDiscountPrice > 0 && rawDiscountPrice < rawPrice;

  return (
    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
      <div className="flex flex-col">
        <span className="text-sm font-extrabold text-accent-navy tracking-tight leading-none">
          {formatNaira(displayPrice)}
        </span>
        {hasRealDiscount && (
          <span className="text-[10px] text-slate-400 line-through font-medium mt-0.5">
            {formatNaira(rawPrice)}
          </span>
        )}
      </div>

      {!isOwner && (
        <button
          onClick={handleAddToCart}
          aria-label="Add to cart"
          className="bg-accent-navy hover:bg-brand-primary hover:text-accent-navy text-white p-2 rounded-xl transition-all duration-200 shadow-sm active:scale-95 flex items-center justify-center shrink-0"
          title="Add to Cart"
        >
          <ShoppingCart size={14} />
        </button>
      )}
    </div>
  );
};
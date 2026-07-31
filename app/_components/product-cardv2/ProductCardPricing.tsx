"use client";

import { formatNaira } from "@/app/lib/FormatNaira";
import { PriceState } from "./types";

interface ProductCardPricingProps {
  price: PriceState;
}

export default function ProductCardPricing({ price }: ProductCardPricingProps) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-sm md:text-[15px] font-black text-[var(--accent-navy)] tracking-tight">
        {formatNaira(price.displayPrice)}
      </span>
      {price.hasRealDiscount && (
        <span className="text-[10px] text-slate-400 line-through font-medium">
          {formatNaira(price.rawPrice)}
        </span>
      )}
    </div>
  );
}
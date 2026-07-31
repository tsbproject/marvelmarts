"use client";

import React, { memo } from "react";

interface ProductPriceProps {
  displayPrice: number;
  rawPrice: number;
  hasRealDiscount: boolean;
  discountPercentage: number | null;
  isList: boolean;
  formatNaira: (amount: number) => string;
}

const ProductPrice = ({
  displayPrice,
  rawPrice,
  hasRealDiscount,
  discountPercentage,
  isList,
  formatNaira,
}: ProductPriceProps) => {
  return (
    <div
      className={`mt-4 flex items-end gap-2 ${
        isList ? "" : "justify-between"
      }`}
    >
      <div className="flex flex-col">
        <span className="text-[10px] font-extrabold tracking-tight text-accent-navy lg:text-xl">
          {formatNaira(displayPrice)}
        </span>

        {hasRealDiscount && (
          <span className="text-xs text-slate-400 line-through">
            {formatNaira(rawPrice)}
          </span>
        )}
      </div>

      {discountPercentage && (
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
          Save {discountPercentage}%
        </span>
      )}
    </div>
  );
};

export default memo(ProductPrice);
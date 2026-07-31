"use client";

import React from "react";
import { Zap } from "lucide-react";
import { BaseCardProps } from "./ProductCardTypes";
import { getDaysRemaining } from "@/app/lib/utils/boost-utils";

export const ProductBadges: React.FC<BaseCardProps> = ({ product, isOwner }) => {
  const rawPrice = Number(product.price) || 0;
  const rawDiscountPrice = Number(product.discountPrice) || 0;
  const hasRealDiscount = rawDiscountPrice > 0 && rawDiscountPrice < rawPrice;
  const discountPercentage = hasRealDiscount
    ? Math.round(((rawPrice - rawDiscountPrice) / rawPrice) * 100)
    : null;

  const daysLeft = getDaysRemaining((product as any).boostUntil);
  const isBoosted = daysLeft > 0;

  if (isOwner && !isBoosted) return null;

  return (
    <div className="absolute top-2.5 left-2.5 z-20 flex flex-col gap-1 pointer-events-none">
      {discountPercentage && !isOwner && (
        <span className="bg-red-600/90 text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow-sm uppercase tracking-wider backdrop-blur-md border border-white/20">
          -{discountPercentage}%
        </span>
      )}

      {isBoosted && (
        <span className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-[8.5px] font-black px-2 py-0.5 rounded-md shadow-sm uppercase tracking-wider flex items-center gap-0.5 border border-amber-300">
          <Zap size={9} className="fill-current text-slate-950" /> Boosted
        </span>
      )}
    </div>
  );
};
"use client";

import { Zap } from "lucide-react";

interface ProductCardBadgesProps {
  discountPercentage: number | null;
  isBoosted: boolean;
  isOwner?: boolean;
}

export default function ProductCardBadges({
  discountPercentage,
  isBoosted,
  isOwner = false,
}: ProductCardBadgesProps) {
  if ((!discountPercentage || isOwner) && !isBoosted) return null;

  return (
    <div className="absolute top-2.5 left-2.5 z-20 flex flex-col gap-1 pointer-events-none">
      {discountPercentage && !isOwner && (
        <span className="bg-gradient-to-r from-red-600 to-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm uppercase tracking-wider">
          -{discountPercentage}%
        </span>
      )}

      {isBoosted && (
        <span className="bg-gradient-to-r from-amber-400 to-[var(--brand-primary)] text-[var(--accent-navy)] text-[8px] font-black px-2 py-0.5 rounded-full shadow-sm uppercase tracking-wider flex items-center gap-0.5">
          <Zap size={9} className="fill-current" />
          Boost
        </span>
      )}
    </div>
  );
}
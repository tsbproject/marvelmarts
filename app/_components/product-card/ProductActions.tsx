"use client";

import React, { memo } from "react";
import { ShoppingCart } from "lucide-react";

interface ProductActionsProps {
  isOwner: boolean;
  isList: boolean;
  onAddToCart: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const ProductActions = ({
  isOwner,
  isList,
  onAddToCart,
}: ProductActionsProps) => {
  if (isOwner) return null;

  return (
    <div
      className={`mt-5 transition-all duration-300 ${
        isList
          ? ""
          : "translate-y-3 opacity-0 group-hover:translate-y-2 group-hover:opacity-100"
      }`}
    >
      <button
        onClick={onAddToCart}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-accent-navy text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:bg-brand-primary active:scale-[0.98]"
      >
        <ShoppingCart size={18} />
        Add to Cart
      </button>
    </div>
  );
};

export default memo(ProductActions);
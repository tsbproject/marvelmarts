"use client";

import { ShoppingCart } from "lucide-react";

interface ProductCardCustomerActionsProps {
  onAddToCart: (e: React.MouseEvent) => void;
}

export default function ProductCardCustomerActions({
  onAddToCart,
}: ProductCardCustomerActionsProps) {
  return (
    <button
      onClick={onAddToCart}
      className="w-full bg-[var(--accent-navy)] hover:bg-[var(--brand-primary)] hover:text-[var(--accent-navy)] text-white py-2 px-3 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-1.5 active:scale-[0.98]"
    >
      <ShoppingCart size={13} />
      <span>Add to Cart</span>
    </button>
  );
}
"use client";

import React from "react";

interface Variant {
  id: string;
  name: string;
  price: number | string | null;
  stock: number;
  attributes: any; // e.g., { "Size": "XL", "Color": "Navy" }
}

interface VariantSelectorProps {
  variants: Variant[];
  selectedVariant: Variant | null;
  onSelect: (variant: Variant) => void;
}

export default function VariantSelector({ 
  variants, 
  selectedVariant, 
  onSelect 
}: VariantSelectorProps) {
  
  if (!variants || variants.length === 0) return null;

  // Group attributes to show unique options (e.g., all available Sizes)
  // For a simpler "List" version, we'll map the variant names directly:
  
  return (
    <div className="space-y-4 my-6">
      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4B4B4B]">
        Select Configuration
      </h3>
      
      <div className="flex flex-wrap gap-3">
        {variants.map((variant) => {
          const isSelected = selectedVariant?.id === variant.id;
          const isOutOfStock = variant.stock <= 0;

          return (
            <button
              key={variant.id}
              disabled={isOutOfStock}
              onClick={() => onSelect(variant)}
              className={`
                px-5 py-3 rounded-xl border-2 font-bold text-xs uppercase tracking-widest transition-all
                ${isSelected 
                  ? "border-[#F7931E] bg-[#FFE8CC] text-[#1E1E1E]" 
                  : "border-[#F8F8F8] bg-white text-[#4B4B4B] hover:border-gray-200"}
                ${isOutOfStock ? "opacity-40 cursor-not-allowed grayscale" : "active:scale-95"}
              `}
            >
              <div className="flex flex-col items-start">
                <span>{variant.name}</span>
                {variant.price && (
                  <span className={`text-[9px] mt-1 ${isSelected ? "text-[#F7931E]" : "text-gray-400"}`}>
                    {isSelected ? "Selected" : `+ ${variant.price}`}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
      
      {/* Inventory Check (Phase 3 Requirement) */}
      {selectedVariant && (
        <div className="flex items-center gap-2 mt-2">
          <div className={`h-1.5 w-1.5 rounded-full ${selectedVariant.stock > 5 ? 'bg-green-500' : 'bg-[#F7931E]'} animate-pulse`} />
          <p className="text-[9px] font-black uppercase text-[#4B4B4B] tracking-tighter">
            {selectedVariant.stock > 0 
              ? `Stock Level: ${selectedVariant.stock} Units Secure` 
              : "Deployment Unavailable - Out of Stock"}
          </p>
        </div>
      )}
    </div>
  );
}
"use client";

import React from "react";
import Image from "next/image";
import { Eye, Heart } from "lucide-react";
import { BaseCardProps } from "./ProductCardTypes";

interface ImageContainerProps extends BaseCardProps {
  validImage: string;
  isWishlisted: boolean;
  handleWishlistToggle: (e: React.MouseEvent) => void;
  onQuickView?: (p: any) => void;
}

export const ProductImageContainer: React.FC<ImageContainerProps> = ({
  product,
  isList,
  isOwner,
  validImage,
  isWishlisted,
  handleWishlistToggle,
  onQuickView,
}) => {
  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-slate-50/80 shrink-0 border border-slate-100/80 transition-colors ${
        isList ? "w-full sm:w-40 h-40" : "w-full aspect-square"
      }`}
    >
      <Image
        src={validImage}
        alt={product.title}
        fill
        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
        className="object-contain p-3 group-hover:scale-105 transition-transform duration-300 ease-out"
      />

      {/* Mobile Quick Wishlist Button */}
      {!isOwner && (
        <button
          onClick={handleWishlistToggle}
          aria-label="Wishlist"
          className={`absolute top-2.5 right-2.5 z-20 md:hidden flex h-7 w-7 items-center justify-center rounded-full shadow-sm backdrop-blur-md transition-all active:scale-90 ${
            isWishlisted ? "bg-red-500 text-white" : "bg-white/90 text-slate-700"
          }`}
        >
          <Heart size={13} fill={isWishlisted ? "currentColor" : "none"} />
        </button>
      )}

      {/* Desktop Micro Actions (Fade Overlay) */}
      {!isOwner && (
        <div className="absolute inset-0 z-20 bg-slate-950/20 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden md:flex items-center justify-center gap-1.5">
          {onQuickView && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickView(product);
              }}
              className="p-2 bg-white text-slate-900 rounded-lg shadow-md hover:bg-brand-primary hover:text-accent-navy transition-all transform scale-95 group-hover:scale-100 duration-150"
              title="Quick View"
            >
              <Eye size={14} />
            </button>
          )}
          <button
            onClick={handleWishlistToggle}
            className={`p-2 rounded-lg shadow-md transition-all transform scale-95 group-hover:scale-100 duration-150 ${
              isWishlisted
                ? "bg-red-500 text-white"
                : "bg-white text-slate-800 hover:bg-red-50 hover:text-red-500"
            }`}
            title="Wishlist"
          >
            <Heart size={14} fill={isWishlisted ? "currentColor" : "none"} />
          </button>
        </div>
      )}
    </div>
  );
};
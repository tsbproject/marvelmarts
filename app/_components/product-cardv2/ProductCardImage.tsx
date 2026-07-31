"use client";

import Image from "next/image";
import { Eye, Heart } from "lucide-react";
import { SerializedProduct } from "@/types/product";

interface ProductCardImageProps {
  product: SerializedProduct;
  imageSrc: string;
  isList: boolean;
  isOwner: boolean;
  isWishlisted: boolean;
  onQuickView?: (p: SerializedProduct) => void;
  onWishlistToggle: (e: React.MouseEvent) => void;
}

export default function ProductCardImage({
  product,
  imageSrc,
  isList,
  isOwner,
  isWishlisted,
  onQuickView,
  onWishlistToggle,
}: ProductCardImageProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-slate-50 shrink-0 ${
        isList ? "w-full sm:w-36 h-36" : "w-full aspect-[1/1]"
      }`}
    >
      <Image
        src={imageSrc}
        alt={product.title}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        className="object-contain p-2.5 group-hover:scale-[1.04] transition-transform duration-500 ease-out"
      />

      {/* Mobile wishlist */}
      {!isOwner && (
        <button
          onClick={onWishlistToggle}
          aria-label="Wishlist"
          className={`absolute top-2 right-2 z-20 md:hidden flex h-8 w-8 items-center justify-center rounded-full shadow-sm backdrop-blur-md transition-all active:scale-90 ${
            isWishlisted
              ? "bg-red-500 text-white"
              : "bg-white/95 text-slate-600"
          }`}
        >
          <Heart size={14} fill={isWishlisted ? "currentColor" : "none"} />
        </button>
      )}

      {/* Desktop hover actions */}
      {!isOwner && (
        <div className="absolute inset-0 z-20 bg-slate-900/15 opacity-0 group-hover:opacity-100 transition-opacity duration-250 hidden md:flex items-center justify-center gap-2">
          {onQuickView && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickView(product);
              }}
              className="p-2.5 bg-white rounded-xl text-[var(--accent-navy)] shadow-md hover:bg-[var(--brand-primary)] transition-all"
              title="Quick View"
            >
              <Eye size={16} />
            </button>
          )}
          <button
            onClick={onWishlistToggle}
            className={`p-2.5 rounded-xl shadow-md transition-all ${
              isWishlisted
                ? "bg-red-500 text-white"
                : "bg-white text-slate-700 hover:bg-red-50 hover:text-red-500"
            }`}
            title="Wishlist"
          >
            <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
          </button>
        </div>
      )}
    </div>
  );
}
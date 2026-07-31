"use client";

import React, { memo } from "react";
import Image from "next/image";
import { Eye, Heart } from "lucide-react";
import { SerializedProduct } from "@/types/product";

interface ProductImageProps {
  product: SerializedProduct;
  imageUrl: string;
  isList: boolean;
  isOwner: boolean;
  isWishlisted: boolean;
  discountPercentage: number | null;
  onWishlist: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onQuickView?: (product: SerializedProduct) => void;
}

const ProductImage = ({
  product,
  imageUrl,
  isList,
  isOwner,
  isWishlisted,
  discountPercentage,
  onWishlist,
  onQuickView,
}: ProductImageProps) => {
  return (
    <>
      {/* SALE BADGE */}
      {discountPercentage && !isOwner && (
        <div className="absolute left-3 top-3 z-30 rounded-full bg-gradient-to-r from-red-500 to-rose-500 px-3 py-1 text-[11px] font-bold text-white shadow-lg backdrop-blur">
          {discountPercentage}% OFF
        </div>
      )}

      <div
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-50 to-white ${
          isList ? "h-52 w-52 shrink-0" : "aspect-square w-full"
        }`}
      >
        <Image
          src={imageUrl}
          alt={product.title}
          fill
          className="object-contain p-2 md:p-4 transition-transform duration-700 group-hover:scale-105"
        />

        {!isOwner && (
          <button
            onClick={onWishlist}
            className={`absolute right-3 top-3 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-white/40 backdrop-blur-md shadow-lg transition-all md:hidden ${
              isWishlisted
                ? "bg-red-500 text-white"
                : "bg-white/80 text-slate-900"
            }`}
          >
            <Heart
              size={18}
              fill={isWishlisted ? "currentColor" : "none"}
            />
          </button>
        )}

                <div className="absolute inset-0 z-20 hidden items-center justify-center gap-3 bg-gradient-to-t from-slate-900/20 via-transparent to-transparent backdrop-blur-[2px] opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:flex">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView?.(product);
            }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-xl backdrop-blur transition-all duration-300 hover:bg-brand-primary hover:text-white translate-y-3 group-hover:translate-y-0 lg:h-11 lg:w-11"
          >
            <Eye size={20} />
          </button>

          <button
            onClick={onWishlist}
            className={`flex h-10 w-10 items-center justify-center rounded-full shadow-xl backdrop-blur transition-all duration-500 delay-75 translate-y-3 group-hover:translate-y-0 lg:h-11 lg:w-11 ${
              isWishlisted
                ? "bg-red-500 text-white"
                : "bg-white text-slate-900 hover:bg-red-50"
            }`}
          >
            <Heart
              size={20}
              fill={isWishlisted ? "currentColor" : "none"}
            />
          </button>
        </div>
      </div>
    </>
  );
};

export default memo(ProductImage);
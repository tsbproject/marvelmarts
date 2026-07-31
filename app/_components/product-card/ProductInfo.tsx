"use client";

import React, { memo } from "react";
import Link from "next/link";
import { CheckCircle2, Star } from "lucide-react";
import { SerializedProduct } from "@/types/product";

interface ProductInfoProps {
  product: SerializedProduct;
  isOwner: boolean;
  isList: boolean;
}

const ProductInfo = ({
  product,
  isOwner,
  isList,
}: ProductInfoProps) => {
  return (
    <>
      {/* BRAND & STORE */}
      <div
        className={`flex items-center gap-2 text-xs ${
          isList ? "" : "justify-between"
        }`}
      >
        <span className="hidden text-xs font-bold uppercase tracking-wide text-brand-primary">
          {product.brand || "Original"}
        </span>

        {!isOwner && product.vendorProfile?.storeName && (
          <>
            <span className="h-1 w-1 rounded-full bg-gray-300" />

            <Link
              href={`/store/${
                product.vendorProfile?.store?.slug ||
                product.vendorProfileId
              }`}
              onClick={(e) => e.stopPropagation()}
              className="group/store flex items-center gap-1 overflow-hidden"
            >
              <span className="truncate text-xs font-medium text-slate-500 transition-colors group-hover/store:text-brand-primary">
                {product.vendorProfile.storeName}
              </span>

              {product.vendorProfile.isVerified && (
                <CheckCircle2
                  size={14}
                  className="text-blue-500"
                />
              )}
            </Link>
          </>
        )}
      </div>

      {/* TITLE */}
      <h3
        className={`mt-0 line-clamp-5 font-medium leading-snug text-slate-900 transition-colors group-hover:text-brand-primary ${
          isList
            ? "text-sm"
            : "max-h-[15px] text-xs lg:text-xs"
        }`}
      >
        {product.title}
      </h3>

      {/* RATING */}
      <div
        className={`mt-2 flex items-center gap-2 ${
          isList ? "" : "hidden justify-center"
        }`}
      >
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={14}
              className={
                star <= Math.round(product.rating || 5)
                  ? "fill-[#F7931E] text-[#F7931E]"
                  : "fill-gray-200 text-gray-200"
              }
            />
          ))}
        </div>

        <span className="text-xs font-medium text-slate-500">
          ({product.reviewCount || 0})
        </span>
      </div>
    </>
  );
};

export default memo(ProductInfo);
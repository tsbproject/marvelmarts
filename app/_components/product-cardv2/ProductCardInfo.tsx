"use client";

import Link from "next/link";
import { CheckCircle2, Star } from "lucide-react";
import { SerializedProduct } from "@/types/product";

interface ProductCardInfoProps {
  product: SerializedProduct;
  isList: boolean;
  isOwner: boolean;
}

export default function ProductCardInfo({
  product,
  isList,
  isOwner,
}: ProductCardInfoProps) {
  return (
    <div className="min-w-0">
      {/* Brand + Vendor */}
      <div className="flex items-center justify-between gap-1.5 mb-1 text-[10px]">
        <span className="font-extrabold text-[var(--brand-primary)] uppercase tracking-wider truncate">
          {product.brand || "Original"}
        </span>

        {!isOwner && product.vendorProfile?.storeName && (
          <Link
            href={`/store/${
              product.vendorProfile?.store?.slug || product.vendorProfileId
            }`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-0.5 overflow-hidden max-w-[48%]"
          >
            <span className="font-medium text-slate-400 hover:text-[var(--accent-navy)] transition-colors truncate">
              {product.vendorProfile.storeName}
            </span>
            {product.vendorProfile?.isVerified && (
              <CheckCircle2
                size={11}
                className="text-blue-500 shrink-0 fill-blue-500/10"
              />
            )}
          </Link>
        )}
      </div>

      {/* Title */}
      <h3
        className={`font-semibold text-slate-800 leading-snug line-clamp-2 group-hover:text-[var(--brand-primary)] transition-colors ${
          isList ? "text-sm mb-1.5" : "text-[11px] md:text-xs mb-1 min-h-[2.25rem]"
        }`}
      >
        {product.title}
      </h3>

      {/* Ratings */}
      <div className="flex items-center gap-1">
        <div className="flex items-center gap-px">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={10}
              className={
                star <= (product.rating || 5)
                  ? "text-amber-400 fill-amber-400"
                  : "text-slate-200 fill-slate-200"
              }
            />
          ))}
        </div>
        <span className="text-[10px] font-semibold text-slate-400">
          ({product.reviewCount || 0})
        </span>
      </div>
    </div>
  );
}
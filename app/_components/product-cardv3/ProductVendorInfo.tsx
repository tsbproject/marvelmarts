"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { BaseCardProps } from "./ProductCardTypes";

export const ProductVendorInfo: React.FC<BaseCardProps> = ({ product, isOwner }) => {
  return (
    <div className="flex items-center justify-between gap-1 mb-1 text-[10px]">
      <span className="font-extrabold text-brand-primary uppercase tracking-wider truncate">
        {product.brand || "Original"}
      </span>

      {!isOwner && product.vendorProfile?.storeName && (
        <Link
          href={`/store/${
            product.vendorProfile?.store?.slug || product.vendorProfileId
          }`}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-0.5 group/store overflow-hidden max-w-[55%]"
        >
          <span className="font-medium text-slate-400 group-hover/store:text-slate-900 transition-colors truncate">
            {product.vendorProfile?.storeName}
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
  );
};
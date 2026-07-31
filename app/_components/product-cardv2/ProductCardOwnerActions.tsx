"use client";

import Link from "next/link";
import { Power } from "lucide-react";
import { SerializedProduct } from "@/types/product";

interface ProductCardOwnerActionsProps {
  product: SerializedProduct;
  onToggleStatus: (e: React.MouseEvent) => void;
}

export default function ProductCardOwnerActions({
  product,
  onToggleStatus,
}: ProductCardOwnerActionsProps) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={onToggleStatus}
        className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg border text-[10px] font-bold transition-all ${
          product.isPublished
            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
        }`}
      >
        <Power size={11} />
        <span>{product.isPublished ? "Live" : "Draft"}</span>
      </button>

      <Link
        href={`/dashboard/vendor/products/edit/${product.id}`}
        onClick={(e) => e.stopPropagation()}
        className="py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[10px] font-bold transition-all"
      >
        Edit
      </Link>
    </div>
  );
}
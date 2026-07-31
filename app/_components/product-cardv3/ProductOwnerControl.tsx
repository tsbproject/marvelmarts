"use client";

import React from "react";
import Link from "next/link";
import { Power } from "lucide-react";
import { BaseCardProps } from "./ProductCardTypes";

interface OwnerControlsProps extends BaseCardProps {
  handleToggleStatus: (e: React.MouseEvent) => void;
}

export const ProductOwnerControls: React.FC<OwnerControlsProps> = ({
  product,
  handleToggleStatus,
}) => {
  return (
    <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 mt-auto">
      <button
        onClick={handleToggleStatus}
        className={`p-1.5 flex-1 rounded-lg border text-[10px] font-bold transition-all flex items-center justify-center gap-1 ${
          product.isPublished
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : "bg-slate-50 text-slate-600 border-slate-200"
        }`}
        title="Toggle Status"
      >
        <Power size={11} />
        <span>{product.isPublished ? "Live" : "Draft"}</span>
      </button>

      <Link
        href={`/dashboard/vendor/products/edit/${product.id}`}
        onClick={(e) => e.stopPropagation()}
        className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[10px] font-bold transition-all text-center"
      >
        Edit
      </Link>
    </div>
  );
};
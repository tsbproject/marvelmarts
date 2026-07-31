"use client";

import React, { memo } from "react";

interface ProductOwnerFooterProps {
  isOwner: boolean;
  isPublished: boolean;
}

const ProductOwnerFooter = ({
  isOwner,
  isPublished,
}: ProductOwnerFooterProps) => {
  if (!isOwner) return null;

  return (
    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
      <div
        className={`h-2.5 w-2.5 rounded-full ${
          isPublished ? "bg-green-500 animate-pulse" : "bg-red-500"
        }`}
      />

      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
        {isPublished ? "Live on Mart" : "Draft Mode"}
      </span>
    </div>
  );
};

export default memo(ProductOwnerFooter);
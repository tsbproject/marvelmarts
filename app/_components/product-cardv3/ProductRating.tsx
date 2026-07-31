"use client";

import React from "react";
import { Star } from "lucide-react";

interface ProductRatingProps {
  rating?: number;
  reviewCount?: number;
}

export const ProductRating: React.FC<ProductRatingProps> = ({
  rating = 5,
  reviewCount = 0,
}) => {
  return (
    <div className="flex items-center gap-1 mb-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={10}
            className={
              star <= rating
                ? "text-amber-400 fill-amber-400"
                : "text-slate-200 fill-slate-200"
            }
          />
        ))}
      </div>
      <span className="text-[10px] font-semibold text-slate-400">
        ({reviewCount})
      </span>
    </div>
  );
};
// app/dashboard/admins/categories/FeaturedToggle.tsx
"use client";

import { useState } from "react";
import { toggleCategoryFeatured } from "@/app/services/adminCategoryActions";
import { useNotification } from "@/app/_context/NotificationContext";
import { Star } from "lucide-react";

export default function FeaturedToggle({ 
  categoryId, 
  initialStatus 
}: { 
  categoryId: string; 
  initialStatus: boolean 
}) {
  const [isFeatured, setIsFeatured] = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const { notifySuccess, notifyError } = useNotification();

  const handleToggle = async () => {
    setLoading(true);
    const result = await toggleCategoryFeatured(categoryId, isFeatured);

    if (result.success) {
      const newStatus = !isFeatured;
      setIsFeatured(newStatus);
      notifySuccess(
        newStatus 
          ? "Mission Success: Category Featured on Home Page" 
          : "Category Removed from Home Page"
      );
    } else {
      notifyError("Tactical Error: Could not update category status.");
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`p-2 rounded-xl transition-all ${
        isFeatured 
          ? "bg-yellow-50 text-yellow-500 shadow-inner" 
          : "bg-gray-50 text-gray-300 hover:text-gray-400"
      }`}
      title={isFeatured ? "Unfeature Category" : "Feature Category"}
    >
      <Star 
        size={18} 
        className={`${isFeatured ? "fill-yellow-500" : ""} ${loading ? "animate-pulse" : ""}`} 
      />
    </button>
  );
}
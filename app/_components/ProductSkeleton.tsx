"use client";

export default function ProductSkeleton() {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col items-center animate-pulse h-full">
      {/* Image Area Skeleton */}
      <div className="w-full h-64 bg-gray-200 rounded-t-lg mb-4" />
      
      {/* Title Skeleton */}
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
      
      {/* Price Skeleton */}
      <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
      
      {/* Rating Skeleton */}
      <div className="flex gap-1 mb-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-3 h-3 bg-gray-100 rounded-full" />
        ))}
      </div>
      
      {/* Button Skeleton */}
      <div className="w-full h-10 bg-gray-200 rounded-full" />
    </div>
  );
}
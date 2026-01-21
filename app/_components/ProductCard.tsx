"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, Eye, ShoppingCart } from "lucide-react";
import { formatNaira } from "@/app/lib/FormatNaira";
import { SerializedProduct } from "@/types/product";
import { useDispatch } from "react-redux";
import { addToCart } from "@/store/cartSlice";
import { useNotification } from "@/app/_context/NotificationContext";

export default function ProductCard({ 
  product, 
  onQuickView 
}: { 
  product: SerializedProduct; 
  onQuickView: (p: SerializedProduct) => void 
}) {
  const dispatch = useDispatch();
  const { notifySuccess } = useNotification();

  // Calculate discount percentage
  const discountPercentage = product.discountPrice 
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : null;

  const displayPrice = product.discountPrice ?? product.price;

  // Handle Add to Cart
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); 
    
 
    // to match what your cartSlice expects.
    dispatch(addToCart({ 
      product: product, 
      quantity: 1 
    }));

    notifySuccess(`${product.title} added to your stash!`);
  };
  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden flex flex-col items-center p-4 shadow-sm hover:shadow-md transition-shadow group h-full relative">
      
      {/* 1. Sales Label */}
      {discountPercentage && (
        <div className="absolute top-3 left-3 z-10 bg-red-600 text-white text-[10px] font-black w-10 h-10 flex items-center justify-center rounded-full shadow-sm uppercase tracking-tighter">
          -{discountPercentage}%
        </div>
      )}

      {/* 2. Image Container */}
      <div className="relative w-full h-64 overflow-hidden rounded-t-lg bg-gray-50 group">
        <Link href={`/products/${product.slug}`} className="w-full h-full block">
          <Image 
            src={product.imageUrl} 
            alt={product.title}
            fill 
            className="object-contain transition-transform duration-500 group-hover:scale-110 p-4" 
            priority
          />
        </Link>
        
        <button 
          onClick={() => onQuickView(product)}
          className="absolute bottom-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-700 shadow-sm opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all hover:bg-blue-600 hover:text-white"
          title="Quick View"
        >
          <Eye size={18} />
        </button>
      </div>

      {/* 3. Product Info */}
      <div className="flex-1 flex flex-col items-center text-center w-full px-2 mt-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-sm font-medium text-gray-800 line-clamp-2 h-10 mb-1 hover:text-blue-600 transition-colors">
            {product.title}
          </h3>
        </Link>

        <div className="flex items-center gap-2 mb-2">
          <p className="text-lg font-bold text-blue-600">
            {formatNaira(displayPrice)}
          </p>
          {product.discountPrice && (
            <p className="text-xs text-gray-400 line-through font-medium">
              {formatNaira(product.price)}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 mb-4">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={12} fill={i < 4 ? "currentColor" : "none"} />
            ))}
          </div>
          <span className="text-[10px] text-gray-400">(120)</span>
        </div>
      </div>

      {/* 4. Functional Add to Cart Button */}
      <button 
        onClick={handleAddToCart}
        className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white py-2.5 rounded-full font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
      >
        <ShoppingCart size={16} />
        Add to Cart
      </button>
    </div>
  );
}
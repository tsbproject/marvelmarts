"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, CheckCircle, AlertCircle, ChevronRight } from "lucide-react";
import { SerializedProduct } from "@/types/product";
import { formatNaira } from "@/app/lib/FormatNaira";

interface QuickViewProps {
  product: SerializedProduct | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductQuickView({ product, isOpen, onClose }: QuickViewProps) {
  // Initialize with null to prevent the "" src error during hydration
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(true);

  // Sync state when product opens or changes
  useEffect(() => {
    if (product) {
      setActiveImage(product.imageUrl);
      setIsImageLoading(true); // Reset loading state for the new image
    }
  }, [product]);

  if (!product) return null;

  const discountPercentage = product.discountPrice 
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-100 cursor-zoom-out"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-x-4 top-[10%] bottom-[10%] md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-4xl md:h-auto max-h-[90vh] bg-white z-101 rounded-3xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col md:flex-row"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-md rounded-full shadow-md hover:bg-red-50 hover:text-red-600 transition-all z-10"
            >
              <X size={20} />
            </button>

            {/* Left: Image Gallery Section */}
            <div className="w-full md:w-1/2 bg-gray-50 p-6 flex flex-col gap-4">
              <div className="relative aspect-square bg-white rounded-2xl overflow-hidden border border-gray-100 flex items-center justify-center">
                
                {/* SKELETON SHIMMER */}
                {isImageLoading && (
                  <div className="absolute inset-0 z-10 bg-gray-100">
                    <div className="w-full h-full bg-linear-to-r from-gray-100 via-gray-200 to-gray-100 animate-[shimmer_1.5s_infinite] bg-length:200%_100%" />
                  </div>
                )}

                {/* MAIN IMAGE - Only renders if activeImage is not null */}
                {activeImage ? (
                  <img 
                    src={activeImage} 
                    alt={product.title} 
                    onLoad={() => setIsImageLoading(false)}
                    className={`w-full h-full object-contain p-4 transition-opacity duration-500 ${
                      isImageLoading ? "opacity-0" : "opacity-100"
                    }`}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-300" />
                )}
              </div>
              
              {/* Thumbnail List */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (activeImage !== img.url) {
                        setIsImageLoading(true);
                        setActiveImage(img.url);
                      }
                    }}
                    className={`relative w-16 h-16 rounded-lg border-2 overflow-hidden shrink-0 transition-all ${
                      activeImage === img.url ? "border-blue-600 shadow-sm" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img.url} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Product Details Section */}
            <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto">
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-widest px-2 py-1 bg-blue-50 rounded">
                    {product.categoryName}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-black text-gray-900 mt-3 leading-tight">
                    {product.title}
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-3xl font-black text-gray-900 italic">
                    {formatNaira(product.discountPrice ?? product.price)}
                  </span>
                  {product.discountPrice && (
                    <>
                      <span className="text-lg text-gray-400 line-through">
                        {formatNaira(product.price)}
                      </span>
                      <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">
                        Save {discountPercentage}%
                      </span>
                    </>
                  )}
                </div>

                <p className="text-gray-500 leading-relaxed line-clamp-4 text-sm">
                  {product.description || "No detailed description available for this item."}
                </p>

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 mb-6">
                    {product.stock > 0 ? (
                      <span className="flex items-center gap-1.5 text-sm font-bold text-green-600">
                        <CheckCircle size={16} /> In Stock ({product.stock})
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-sm font-bold text-red-600">
                        <AlertCircle size={16} /> Out of Stock
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-3">
                    <button 
                      disabled={product.stock <= 0}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      <ShoppingCart size={20} />
                      Add to Cart
                    </button>
                    
                    <a 
                      href={`/products/${product.slug}`}
                      className="w-full text-center py-2 text-sm font-bold text-gray-400 hover:text-blue-600 flex items-center justify-center gap-1 transition-colors"
                    >
                      View Full Details <ChevronRight size={16} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, CheckCircle, AlertCircle, ChevronRight } from "lucide-react";
import { SerializedProduct } from "@/types/product";
import { formatNaira } from "@/app/lib/FormatNaira";
import { useDispatch } from "react-redux";
import { addToCart } from "@/store/cartSlice";
import { useNotification } from "@/app/_context/NotificationContext";

interface QuickViewProps {
  product: SerializedProduct | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductQuickView({ product, isOpen, onClose }: QuickViewProps) {
  const dispatch = useDispatch();
  const { notifySuccess } = useNotification();
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(true);

  useEffect(() => {
    if (product) {
      setActiveImage(product.imageUrl);
      setIsImageLoading(true);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [product]);

  if (!product) return null;

  // Handle Add to Cart
  const handleAddToCart = () => {
    dispatch(addToCart({ product, quantity: 1 }));
    notifySuccess(`${product.title} added to stash!`);
    onClose();
  };

  const discountPercentage = product.discountPrice 
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - Increased Z-Index */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-999 cursor-zoom-out"
          />

          {/* Modal Content - Fixed mobile sizing and high Z-index */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            className="fixed inset-x-2 top-[5%] bottom-[5%] md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-4xl md:h-[600px] bg-white z-[1000] rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-md rounded-full shadow-lg hover:bg-red-50 hover:text-red-600 transition-all z-50"
            >
              <X size={24} />
            </button>

            {/* Left: Image Section (Scrollable on mobile if needed) */}
            <div className="w-full md:w-1/2 bg-gray-50 p-4 md:p-8 flex flex-col gap-4 overflow-y-auto">
              <div className="relative aspect-square bg-white rounded-3xl overflow-hidden border border-gray-100 flex items-center justify-center shadow-inner">
                {isImageLoading && (
                  <div className="absolute inset-0 z-10 bg-gray-100 animate-pulse" />
                )}
                <img 
                  src={activeImage || ""} 
                  alt={product.title} 
                  onLoad={() => setIsImageLoading(false)}
                  className={`w-full h-full object-contain p-6 transition-opacity duration-500 ${
                    isImageLoading ? "opacity-0" : "opacity-100"
                  }`}
                />
              </div>
              
              <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {product.images?.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setIsImageLoading(true);
                      setActiveImage(img.url);
                    }}
                    className={`relative w-20 h-20 rounded-2xl border-2 overflow-hidden shrink-0 transition-all ${
                      activeImage === img.url ? "border-blue-600 scale-95" : "border-transparent opacity-50"
                    }`}
                  >
                    <img src={img.url} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Details Section */}
            <div className="w-full md:w-1/2 p-6 md:p-12 overflow-y-auto bg-white">
              <div className="flex flex-col h-full">
                <div className="mb-6">
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] px-3 py-1 bg-blue-50 rounded-full">
                    {product.categoryName}
                  </span>
                  <h2 className="text-2xl md:text-4xl font-black text-gray-900 mt-4 leading-none italic uppercase">
                    {product.title}
                  </h2>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <span className="text-3xl font-black text-gray-900">
                    {formatNaira(product.discountPrice ?? product.price)}
                  </span>
                  {product.discountPrice && (
                    <span className="text-lg text-gray-400 line-through font-bold">
                      {formatNaira(product.price)}
                    </span>
                  )}
                </div>

                <p className="text-gray-500 text-sm leading-relaxed mb-8">
                  {product.description || "Premium quality item from our latest collection."}
                </p>

                <div className="mt-auto space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    {product.stock > 0 ? (
                      <span className="text-xs font-bold text-green-600 uppercase flex items-center gap-1">
                        <CheckCircle size={14} /> In Stock ({product.stock})
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-red-600 uppercase flex items-center gap-1">
                        <AlertCircle size={14} /> Out of Stock
                      </span>
                    )}
                  </div>

                  <button 
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white py-5 rounded-[2rem] font-black text-xl shadow-xl shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-3 uppercase italic tracking-tighter"
                  >
                    <ShoppingCart size={24} />
                    Add to Cart
                  </button>
                  
                  <a 
                    href={`/shop/${shop.slug}`}
                    className="w-full text-center py-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-1"
                  >
                    View Full Specs <ChevronRight size={14} />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
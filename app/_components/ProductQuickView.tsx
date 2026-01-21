


"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [product]);

  if (!product) return null;

  const handleAddToCart = () => {
    dispatch(addToCart({ product, quantity: 1 }));
    notifySuccess(`${product.title} added to stash!`);
    onClose();
  };
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with Accent Navy tint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-neutral-dark/80 backdrop-blur-sm z-[999] cursor-zoom-out"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-2 top-[15%] bottom-[15%] md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-4xl md:h-auto md:max-h-[70vh] bg-neutral-white z-[1000] rounded-[2rem] overflow-hidden shadow-2xl flex flex-col md:flex-row border border-accent-navy/10"
          >
            {/* Close Button - Using Brand Primary on hover */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-neutral-white rounded-full shadow-lg hover:bg-brand-primary hover:text-neutral-white transition-all z-50 text-accent-navy"
            >
              <X size={20} />
            </button>

            {/* Left: Image Section */}
            <div className="w-full md:w-5/12 bg-neutral-light p-4 md:p-6 flex flex-col gap-4 overflow-y-auto border-r border-accent-navy/5">
              <div className="relative aspect-square bg-neutral-white rounded-2xl overflow-hidden flex items-center justify-center shadow-sm">
                {isImageLoading && (
                  <div className="absolute inset-0 z-10 bg-neutral-light animate-pulse" />
                )}
                <Image 
                  src={activeImage || product.imageUrl || "/placeholder.png"} 
                  alt={product.title} 
                  onLoad={() => setIsImageLoading(false)}
                  fill 
                  className="object-contain p-6"
                />
              </div>
              
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {product.images?.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setIsImageLoading(true);
                      setActiveImage(img.url);
                    }}
                    className={`relative w-14 h-14 rounded-xl border-2 overflow-hidden shrink-0 transition-all ${
                      activeImage === img.url ? "border-brand-primary scale-95" : "border-transparent opacity-60"
                    }`}
                  >
                    <img src={img.url} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Details Section - Blended with Brand Light gradient */}
            <div className="w-full md:w-7/12 p-6 md:p-10 overflow-y-auto bg-gradient-to-br from-neutral-white via-neutral-white to-brand-light/40">
              <div className="flex flex-col h-full">
                <div className="mb-4">
                  <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] px-3 py-1 bg-brand-light rounded-md">
                    {product.categoryName}
                  </span>
                  <h2 className="text-xl md:text-2xl font-black text-accent-navy mt-3 leading-tight uppercase tracking-tighter italic">
                    {product.title}
                  </h2>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <span className="text-2xl font-black text-accent-navy">
                    {formatNaira(product.discountPrice ?? product.price)}
                  </span>
                  {product.discountPrice && (
                    <span className="text-sm text-neutral-gray line-through font-bold opacity-60">
                      {formatNaira(product.price)}
                    </span>
                  )}
                </div>

                <p className="text-neutral-gray text-sm leading-relaxed mb-8">
                  {product.description || "Elite performance gear designed for the modern operative."}
                </p>

                <div className="mt-auto pt-6 border-t border-accent-navy/5 space-y-4">
                  <button 
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0}
                    className="group w-full bg-accent-navy hover:bg-neutral-dark text-neutral-white py-4 rounded-xl font-bold text-base shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest"
                  >
                    <ShoppingCart size={18} className="group-hover:text-brand-primary transition-colors" />
                    Add to Cart
                  </button>
                  
                  <Link 
                    href={`/products/${product.slug}`}
                    onClick={onClose}
                    className="w-full text-center py-1 text-[10px] font-black uppercase tracking-[0.3em] text-accent-navy/40 hover:text-brand-primary transition-colors flex items-center justify-center gap-2"
                  >
                    View Full Detail <ChevronRight size={12} />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, Star, ArrowRight } from "lucide-react"; // Added ArrowRight
import Image from "next/image";
import Link from "next/link"; // Added Link
import { formatNaira } from "@/app/lib/FormatNaira";
import { SerializedProduct } from "@/types/product";
import { useDispatch } from "react-redux";
import { addToCart } from "@/store/cartSlice";
import { useNotification } from "@/app/_context/NotificationContext";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  product: SerializedProduct;
}

export default function ProductQuickViewDrawer({ isOpen, onClose, product }: DrawerProps) {
  const dispatch = useDispatch();
  const { notifySuccess } = useNotification();

  const handleAddToCart = () => {
    dispatch(addToCart({ product, quantity: 1 }));
    notifySuccess(`${product.title} added to stash!`);
    onClose();
  };

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
            className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[2.5rem] z-[101] p-6 pb-10 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* Drag Handle */}
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />

            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full text-gray-500"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col gap-6">
              {/* Image Container */}
              <div className="relative w-full aspect-square bg-gray-50 rounded-[2rem] overflow-hidden">
                <Image
                  src={product.imageUrl || "/placeholder.png"}
                  alt={product.title}
                  fill
                  className="object-contain p-8"
                />
              </div>

              {/* Info */}
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-black text-gray-900 uppercase leading-tight">
                    {product.title}
                  </h2>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex text-yellow-400">
                      <Star size={14} fill="currentColor" />
                    </div>
                    <span className="text-xs font-bold text-gray-400">4.9 (120 Reviews)</span>
                  </div>
                </div>

                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-black text-[#3B82F6] italic">
                    {formatNaira(product.discountPrice ?? product.price)}
                  </span>
                  {product.discountPrice && (
                    <span className="text-lg text-gray-300 line-through font-bold italic">
                      {formatNaira(product.price)}
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
                  High-performance tactical gear designed for elite operators. 
                  Engineered for durability and maximum efficiency in the field.
                </p>

                <div className="flex flex-col gap-3 pt-4">
                  {/* Primary Action: Add to Cart */}
                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-200 active:scale-[0.98] transition-transform"
                  >
                    <ShoppingCart size={18} />
                    Add to stash
                  </button>

                  {/* Secondary Action: View Full Details */}
                  <Link
                    href={`/products/${product.slug}`}
                    onClick={onClose}
                    className="w-full bg-gray-50 text-gray-900 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 border border-gray-100 active:scale-[0.98] transition-transform"
                  >
                    View Full Details
                    <ArrowRight size={16} />
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
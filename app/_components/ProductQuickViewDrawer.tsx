

"use client";

import React, { useEffect } from "react"; 
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, Star, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation"; 
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
  const router = useRouter();
  const { notifySuccess } = useNotification();

  useEffect(() => {
    if (isOpen && product?.slug) {
      router.prefetch(`/products/${product.slug}`);
    }
  }, [isOpen, product?.slug, router]);

  const handleAddToCart = () => {
    dispatch(addToCart({ product, quantity: 1 }));
    notifySuccess(`${product.title} added to stash!`);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm"
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            /* Increased max-width for desktop (md:max-w-2xl) */
            className="fixed bottom-0 left-0 right-0 md:left-1/2 md:-translate-x-1/2 md:max-w-2xl bg-white rounded-t-[3rem] z-[101] p-6 pb-10 shadow-2xl max-h-[90vh] overflow-y-auto border-x border-t border-gray-100"
          >
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />

            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 bg-gray-100 hover:bg-gray-200 transition-colors rounded-full text-gray-500 z-[102]"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col gap-6">
              {/* Increased height (h-64 md:h-96) and better padding for the image */}
              <div className="relative w-full h-64 md:h-96 bg-neutral-light rounded-[2rem] overflow-hidden">
                <Image
                  src={product.imageUrl || product.images?.[0]?.url || "/logo.png"}
                  alt={product.title}
                  fill
                  className="object-contain p-8 transform hover:scale-105 transition-transform duration-500"
                  priority
                />
              </div>

              <div className="space-y-4 px-2">
                <div>
                  <h2 className="text-2xl font-black text-accent-navy uppercase leading-tight italic">
                    {product.title}
                  </h2>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill={i < 4 ? "currentColor" : "none"} />
                      ))}
                    </div>
                    <span className="text-[11px] font-black text-neutral-gray uppercase tracking-widest">
                      4.9 (120 Verified Reviews)
                    </span>
                  </div>
                </div>

                <div className="flex items-baseline gap-4">
                  <span className="text-3xl font-black text-brand-primary italic">
                    {formatNaira(product.discountPrice ?? product.price)}
                  </span>
                  {product.discountPrice && (
                    <span className="text-lg text-gray-300 line-through font-bold italic">
                      {formatNaira(product.price)}
                    </span>
                  )}
                </div>

                <p className="text-sm text-neutral-gray leading-relaxed font-medium">
                  Experience elite performance. This high-grade tactical product is engineered for durability and precision, ensuring you're ready for any mission.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-brand-primary hover:bg-blue-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 shadow-xl shadow-blue-100 active:scale-[0.97] transition-all"
                  >
                    <ShoppingCart size={18} />
                    Add to stash
                  </button>

                  <Link
                    href={`/products/${product.slug}`}
                    prefetch
                    className="w-full bg-accent-navy hover:bg-opacity-90 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 border border-transparent transition-all active:scale-[0.97]"
                  >
                    View in Full
                    <ArrowRight size={18} />
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


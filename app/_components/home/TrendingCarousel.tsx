// app/_components/home/TrendingCarousel.tsx
"use client";

import React from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Flame, ChevronRight, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { SerializedProduct } from "@/types/product";

interface TrendingCarouselProps {
  initialData: SerializedProduct[];
}

export default function TrendingCarousel({ initialData }: TrendingCarouselProps) {
  // Pulling from the slice we just created
  const trendingProducts = useSelector((state: any) => state.trending.items);

  if (!trendingProducts || trendingProducts.length === 0) return null;

  return (
    <section className="py-12 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-orange-600 mb-2">
              <Flame size={18} fill="currentColor" className="animate-pulse" />
              <span className="text-xs font-black uppercase tracking-[0.2em]">Hot Deployment</span>
            </div>
            <h2 className="text-4xl font-black uppercase italic tracking-tighter text-gray-900">
              Trending <span className="text-blue-600">Gear</span>
            </h2>
          </div>
          <Link href="/shop" className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-600 transition-colors">
            View All Armory <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Carousel Rail */}
        <motion.div 
          className="flex gap-6 overflow-x-auto pb-8 snap-x no-scrollbar"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {trendingProducts.map((product: any) => (
            <div 
              key={product.id} 
              className="min-w-[280px] md:min-w-[320px] snap-start group"
            >
              <div className="relative aspect-[4/5] bg-gray-50 rounded-3xl overflow-hidden mb-4 border border-gray-100 transition-all group-hover:shadow-2xl group-hover:shadow-blue-100">
                {product.imageUrl && (
                  <img 
                    src={product.imageUrl} 
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                )}
                
                {/* Tactical Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                   <button className="w-full bg-white text-black py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition-colors">
                     <ShoppingCart size={14} /> Quick Add
                   </button>
                </div>
              </div>

              <div className="space-y-1 px-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{product.category || "Tactical"}</p>
                <h3 className="font-black text-lg uppercase tracking-tight text-gray-900 leading-tight">
                  {product.name}
                </h3>
                <p className="text-blue-600 font-black text-xl">
                  ${product.price?.toLocaleString() || "0.00"}
                </p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
"use client";

import React, { useState, useEffect } from "react";
import { Zap, ShoppingBag } from "lucide-react";
import ProductCardv2 from "../ProductCardv2";
import ProductSkeleton from "../ProductSkeleton";
import { useLoadingOverlay } from "@/app/_context/LoadingOverlayContext";
import { useRouter } from "next/navigation";
import ProductQuickViewDrawer from "../ProductQuickViewDrawer";
import { SerializedProduct } from "@/types/product"; 

interface FlashSalesProps {
  products: SerializedProduct[];
  endTime: string;
}

export default function FlashSales({ products, endTime }: FlashSalesProps) {
  const router = useRouter();
  const { loading } = useLoadingOverlay();
  const [timeLeft, setTimeLeft] = useState({ hrs: 0, mins: 0, secs: 0 });
  const [selectedProduct, setSelectedProduct] = useState<SerializedProduct | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  useEffect(() => {
    if (!endTime) return;
    const target = new Date(endTime).getTime();
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = target - now;
      if (distance <= 0) {
        clearInterval(timer);
        setTimeLeft({ hrs: 0, mins: 0, secs: 0 });
      } else {
        setTimeLeft({
          hrs: Math.floor(distance / (1000 * 60 * 60)),
          mins: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          secs: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  const gridLayoutClass = "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-6 gap-0 md:gap-6";

  return (
    <section className="bg-white p-4 md:p-6 rounded-[2.5rem] shadow-sm border border-red-50">
      {/* Header & Timer UI */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 px-2">
        <div className="flex items-center gap-2 text-red-600">
          <Zap size={24} fill="currentColor" className="animate-pulse" />
          <h2 className="text-sm font-black uppercase tracking-tighter italic">
             Flash <span className="text-(--brand-primary)">Sales</span>
          </h2>
        </div>

        {/* Timer UI */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Ends In:
          </span>
          <div className="flex gap-2 font-mono font-bold text-xs lg:text-md">
            {[
              { label: "hrs", value: timeLeft.hrs },
              { label: "mins", value: timeLeft.mins },
              { label: "secs", value: timeLeft.secs },
            ].map((unit, i) => (
              <div key={unit.label} className="flex items-center">
                <div className="bg-(--accent-navy) text-white px-2 py-1 rounded-xl min-w-[42px] text-center shadow-lg shadow-blue-900/20">
                  {unit.value.toString().padStart(2, "0")}
                </div>
                {i < 2 && <span className="mx-1 text-(--accent-navy) font-black animate-pulse">:</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className={gridLayoutClass}>
          {[...Array(6)].map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      ) : products && products.length > 0 ? (
        <div className={gridLayoutClass}>
          {products.slice(0, 6).map((product) => (
            <ProductCardv2
              key={product.id}
              product={product}
              onQuickView={(p) => {
                setSelectedProduct(p);
                setIsQuickViewOpen(true);
              }}
            />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-[2.5rem] bg-gray-50/50">
          <ShoppingBag className="mx-auto h-12 w-12 text-gray-200 mb-4" />
          <p className="text-gray-400 font-medium italic">
            No Flash Sale products available right now.
          </p>
        </div>
      )}

      {selectedProduct && (
        <ProductQuickViewDrawer
          product={selectedProduct}
          isOpen={isQuickViewOpen}
          onClose={() => setIsQuickViewOpen(false)}
        />
      )}
    </section>
  );
}
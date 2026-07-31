


"use client";

import React, { useState, useEffect } from "react";
import { Zap, ShoppingBag } from "lucide-react";
import ProductCardv3 from "../product-cardv3/ProductCardv3";
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

  // Tight, aligned grid — reduced X & Y spacing
  const gridLayoutClass =
  "grid grid-cols-2 gap-x-1 gap-y-2 sm:gap-x-2 sm:gap-y-3 md:grid-cols-3 md:gap-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-6";

  return (
    <section className="rounded-3xl border border-red-50/80 bg-white p-1 sm:p-3 md:p-5">
      {/* Header & Timer */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-red-600">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-50">
            <Zap size={16} fill="currentColor" className="animate-pulse" />
          </div>
          <h2 className="text-sm font-black uppercase italic tracking-tighter text-[var(--accent-navy)] md:text-base">
            Flash <span className="text-[var(--brand-primary)]">Sales</span>
          </h2>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-2.5">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">
            Ends In
          </span>
          <div className="flex items-center gap-1 font-mono text-xs font-bold md:text-sm">
            {[
              { label: "hrs", value: timeLeft.hrs },
              { label: "mins", value: timeLeft.mins },
              { label: "secs", value: timeLeft.secs },
            ].map((unit, i) => (
              <div key={unit.label} className="flex items-center">
                <div className="min-w-[36px] rounded-lg bg-[var(--accent-navy)] px-1.5 py-1 text-center text-white shadow-md shadow-blue-900/15 md:min-w-[40px]">
                  {unit.value.toString().padStart(2, "0")}
                </div>
                {i < 2 && (
                  <span className="mx-0.5 font-black text-[var(--accent-navy)] opacity-60">
                    :
                  </span>
                )}
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
         <ProductCardv3
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
        <div className="rounded-2xl border-2 border-dashed border-gray-100 bg-gray-50/50 py-14 text-center">
          <ShoppingBag className="mx-auto mb-3 h-10 w-10 text-gray-200" />
          <p className="text-sm font-medium italic text-gray-400">
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
"use client";

import React, { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import ProductQuickView from "./ProductQuickView";
import { Zap, ShoppingBag } from "lucide-react";
import { SerializedProduct } from "@/types/product"; // Ensure this path is correct

interface FlashSalesProps {
  products: SerializedProduct[];
  endTime: string;
}

export default function FlashSales({ products, endTime }: FlashSalesProps) {
  const [timeLeft, setTimeLeft] = useState({ hrs: 0, mins: 0, secs: 0 });
  const [selectedProduct, setSelectedProduct] = useState<SerializedProduct | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  // Timer Logic must be inside the component
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

  return (
    <section className="bg-white p-6 rounded-3xl shadow-sm border border-red-50">
      {/* Header & Timer UI */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-2 text-red-600">
          <Zap size={24} fill="currentColor" />
          <h2 className="text-2xl font-black uppercase tracking-tighter italic">
            Flash Sales
          </h2>
        </div>

        {/* Timer UI */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Ends In:
          </span>
          <div className="flex gap-2 font-mono font-bold text-lg">
            {[
              { label: "hrs", value: timeLeft.hrs },
              { label: "mins", value: timeLeft.mins },
              { label: "secs", value: timeLeft.secs },
            ].map((unit, i) => (
              <div key={unit.label} className="flex items-center">
                <div className="bg-gray-900 text-white px-2 py-1 rounded-lg min-w-[38px] text-center shadow-lg">
                  {unit.value.toString().padStart(2, "0")}
                </div>
                {i < 2 && <span className="mx-1 text-gray-900 animate-pulse">:</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid Fix */}
      {products && products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
          {products.map((product) => (
            <ProductCard
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
        <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/50">
          <ShoppingBag className="mx-auto h-12 w-12 text-gray-200 mb-4" />
          <p className="text-gray-400 font-medium italic">
            No Flash Sale products available right now.
          </p>
        </div>
      )}

      {/* Modal */}
      <ProductQuickView
        product={selectedProduct}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </section>
  );
}
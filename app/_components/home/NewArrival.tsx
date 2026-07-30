"use client";

import React, { useState } from "react";
import ProductCardv2 from "../ProductCardv2";
import ProductSkeleton from "../ProductSkeleton";
import { SerializedProduct } from "@/types/product";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLoadingOverlay } from "@/app/_context/LoadingOverlayContext";
import ProductQuickViewDrawer from "../ProductQuickViewDrawer"; // Updated to Drawer

export default function NewArrival({ products }: { products: SerializedProduct[] }) {
  const router = useRouter();
  const { loading } = useLoadingOverlay();

  // State for Quick View Drawer
  const [selectedProduct, setSelectedProduct] = useState<SerializedProduct | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleQuickView = (product: SerializedProduct) => {
    setSelectedProduct(product);
    setIsDrawerOpen(true);
  };

  const handleViewDetails = (slug: string) => {
    router.push(`/products/${slug}`);
  };

  return (
    <section className="py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 border-b border-neutral-light pb-8 gap-4">
        <div>
          <h2 className="text-md md:text-xl font-black italic text-accent-navy uppercase tracking-tighter">
            New <span className="text-brand-primary">Arrivals</span>
          </h2>
          <p className="text-xs font-bold text-neutral-gray uppercase tracking-[0.3em] mt-2">
            The Latest Deployments to the Harmory
          </p>
        </div>
        
        <Link 
          href="/shop?sort=newest" 
          className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-accent-navy hover:text-brand-primary transition-colors"
        >
          View Full Armory <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
        {loading 
          ? [...Array(8)].map((_, i) => <ProductSkeleton key={i} />)
          : products.map((product) => (
              <ProductCardv2 
                key={product.id} 
                product={product} 
                onQuickView={() => handleQuickView(product)}
                // onViewDetails={() => handleViewDetails(product.slug)} 
              />
            ))
        }
      </div>

      {/* Quick View Bottom Sheet (Better UX for Mobile) */}
      {selectedProduct && (
        <ProductQuickViewDrawer 
          isOpen={isDrawerOpen} 
          onClose={() => setIsDrawerOpen(false)} 
          product={selectedProduct} 
        />
      )}
    </section>
  );
}
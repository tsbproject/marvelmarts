




"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ProductCard from "./ProductCard";
import ProductSkeleton from "./ProductSkeleton"; 
import { SerializedProduct } from "@/types/product";
import { useLoadingOverlay } from "@/app/_context/LoadingOverlayContext"; 
// import ProductQuickView from "./ProductQuickView"; 
import ProductQuickViewDrawer from "./ProductQuickViewDrawer";

export default function FeaturedProducts({ products }: { products: SerializedProduct[] }) {
  const router = useRouter();
  const { loading } = useLoadingOverlay(); 
  
  // State for the Quick View Drawer/Bottom Sheet
  const [selectedProduct, setSelectedProduct] = useState<SerializedProduct | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleQuickView = (product: SerializedProduct) => {
    setSelectedProduct(product);
    setIsDrawerOpen(true);
  };

  const handleViewDetails = (slug: string) => {
    router.push(`/shop/${slug}`);
  };

  return (
    <section className="py-12">
      <div className="mb-10 text-center md:text-left">
        <h2 className="text-4xl md:text-5xl font-black italic text-accent-navy uppercase tracking-tighter">
          Featured <span className="text-brand-primary">Products</span>
        </h2>
        <p className="text-xs font-bold text-neutral-gray uppercase tracking-[0.3em] mt-2">
          Elite Gear Hand-Picked for the Frontline
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
        {loading 
          ? [...Array(4)].map((_, i) => <ProductSkeleton key={i} />) 
          : products.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onQuickView={() => handleQuickView(product)} 
                // onViewDetails={() => handleViewDetails(product.slug)}
              />
            ))
        }
      </div>

      {/* Quick View Bottom Sheet (Better for Phone) */}
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
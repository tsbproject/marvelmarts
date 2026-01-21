"use client";

import React from "react";
import ProductCard from "./ProductCard";
import ProductSkeleton from "./ProductSkeleton"; 
import { SerializedProduct } from "@/types/product";
import { useLoadingOverlay } from "@/app/_context/LoadingOverlayContext"; 

export default function FeaturedProducts({ products }: { products: SerializedProduct[] }) {
  const { loading } = useLoadingOverlay(); 

  const handleQuickView = (product: SerializedProduct) => {
    console.log("Quick view for:", product.title);
  };

  return (
    <section className="py-12">
      <div className="mb-10 text-center md:text-left">
        <h2 className="text-4xl md:text-5xl font-black italic text-accent-navy uppercase tracking-tighter">
          Featured <span className="text-brand-primary">Loot</span>
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
                onQuickView={handleQuickView} 
              />
            ))
        }
      </div>
    </section>
  );
}



"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "./ProductCard";
import ProductQuickView from "./ProductQuickView";
import { SerializedProduct } from "@/types/product";

interface FeaturedProductsProps {
  products: SerializedProduct[];
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState<SerializedProduct | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  // 1. Dynamic Category Extraction
  const categories = useMemo(() => {
    // Collect unique category names from real data
    const uniqueCats = Array.from(new Set(products.map((p) => p.categoryName)));
    return [
      { key: "all", label: "All Products" }, 
      ...uniqueCats.map(c => ({ key: c, label: c }))
    ];
  }, [products]);

  // 2. Filter Logic
  const filteredProducts = useMemo(() => {
    return selectedCategory === "all" 
      ? products 
      : products.filter((p) => p.categoryName === selectedCategory);
  }, [selectedCategory, products]);

  const handleQuickView = (product: SerializedProduct) => {
    setSelectedProduct(product);
    setIsQuickViewOpen(true);
  };

  return (
    <section className="py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-black text-gray-900 italic tracking-tighter uppercase">
          🌟 Featured Selections
        </h2>
        <p className="text-gray-500 mt-2">Handpicked quality items from our collection</p>
      </div>

      {/* 3. Category Tabs UI */}
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            className={`px-6 py-2.5 rounded-full font-bold text-[10px] uppercase tracking-widest transition-all duration-300
              ${selectedCategory === cat.key
                ? "bg-blue-600 text-white shadow-xl scale-105"
                : "bg-white text-gray-400 hover:text-gray-900 hover:bg-gray-50 border border-gray-100 shadow-sm"
              }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 4. Animated Product Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedCategory}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: "circOut" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {filteredProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onQuickView={handleQuickView} 
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Empty State Check */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-20 text-gray-400 italic">
          No featured products in this category.
        </div>
      )}

      {/* 5. Shared Modal */}
      <ProductQuickView 
        product={selectedProduct} 
        isOpen={isQuickViewOpen} 
        onClose={() => setIsQuickViewOpen(false)} 
      />
    </section>
  );
}
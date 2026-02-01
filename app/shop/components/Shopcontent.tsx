"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Image from "next/image";
import { LayoutGrid, List, Search, Loader2 } from "lucide-react";
import ProductCard from "@/app/_components/ProductCard";
import ProductQuickViewDrawer from "@/app/_components/ProductQuickViewDrawer"; // Import your drawer
import { SerializedProduct } from "@/types/product";

export default function ShopContent({ initialProducts }: { initialProducts: SerializedProduct[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // --- Drawer State ---
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<SerializedProduct | null>(null);

  // --- UI State ---
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchParams.get("q") || "");

  const handleQuickView = (product: SerializedProduct) => {
    setSelectedProduct(product);
    setIsDrawerOpen(true);
  };

  const handleSearchSync = (term: string) => {
    setLocalSearch(term);
    const params = new URLSearchParams(searchParams.toString());
    term ? params.set("q", term) : params.delete("q");

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const suggestions = useMemo(() => {
    if (localSearch.length < 2) return [];
    return initialProducts
      .filter(p => p.title.toLowerCase().includes(localSearch.toLowerCase()))
      .slice(0, 5);
  }, [localSearch, initialProducts]);

  return (
    <main className="flex-1">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-neutral-light p-4 rounded-[2.5rem] border border-neutral-light shadow-sm">
        <div className="relative w-full md:w-96">
          <div className="relative">
            {isPending ? (
              <Loader2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-primary animate-spin" />
            ) : (
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-gray" />
            )}
            <input 
              type="text"
              placeholder="SEARCH THE ARMORY..."
              value={localSearch}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onChange={(e) => handleSearchSync(e.target.value)}
              className="w-full bg-neutral-white border-none rounded-2xl py-4 pl-12 pr-4 text-[10px] font-black uppercase tracking-widest text-accent-navy outline-none focus:ring-2 ring-brand-primary/20 transition-all"
            />
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white mt-3 rounded-[1.5rem] shadow-2xl border border-neutral-light z-50 overflow-hidden">
              {suggestions.map((p) => (
                <div 
                  key={p.id}
                  onClick={() => router.push(`/products/${p.slug}`)}
                  className="flex items-center gap-4 p-3 hover:bg-neutral-light cursor-pointer group"
                >
                  <div className="w-10 h-10 relative bg-neutral-light rounded-lg overflow-hidden">
                    <Image src={p.imageUrl || "/logo.png"} alt="" fill className="object-contain p-1" />
                  </div>
                  <span className="text-[11px] font-black uppercase text-accent-navy truncate group-hover:text-brand-primary">
                    {p.title}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 bg-neutral-white p-1.5 rounded-2xl">
          <button onClick={() => setViewMode("grid")} className={`p-2.5 rounded-xl ${viewMode === "grid" ? "bg-accent-navy text-white shadow-lg" : "text-neutral-gray"}`}><LayoutGrid size={18}/></button>
          <button onClick={() => setViewMode("list")} className={`p-2.5 rounded-xl ${viewMode === "list" ? "bg-accent-navy text-white shadow-lg" : "text-neutral-gray"}`}><List size={18}/></button>
        </div>
      </div>

      {/* Product Display Area */}
      <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "flex flex-col gap-6"}>
        {initialProducts.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            viewMode={viewMode}
            onQuickView={() => handleQuickView(product)} // Triggers the drawer
          />
        ))}
      </div>

      {/* The Global Quick View Drawer */}
      {selectedProduct && (
        <ProductQuickViewDrawer 
          isOpen={isDrawerOpen} 
          onClose={() => setIsDrawerOpen(false)} 
          product={selectedProduct} 
        />
      )}
    </main>
  );
}
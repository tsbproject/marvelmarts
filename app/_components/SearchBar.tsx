"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, X, Package, Tag, Hash, ArrowRight, Layers, Command } from "lucide-react";
import Image from "next/image";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ products: any[]; categories: any[]; }>({ 
    products: [], 
    categories: [] 
  });
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 1. Keyboard Shortcut (Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // 2. Click Outside to Close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 3. Search Fetching Logic
  useEffect(() => {
    const fetchResults = async () => {
      if (query.trim().length < 2) {
        setResults({ products: [], categories: [] });
        setShowDropdown(false);
        return;
      }

      setIsSearching(true);
      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data);
        setShowDropdown(true);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(fetchResults, 400);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setShowDropdown(false);
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="flex items-center justify-center px-4 w-full relative z-50" ref={dropdownRef}>
      <div className="relative w-full xl:w- 2xl:w-[1600px] max-w-4xl group">
        
        {/* --- INPUT FIELD --- */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-blue-400 transition-colors" size={22} />
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length >= 2 && setShowDropdown(true)}
            placeholder="Search products..."
            className="w-full pl-14 pr-24 py-4 bg-white/10 backdrop-blur-md border border-brand-primary rounded-full 
                       text-xl xl:text-3xl 2xl:text-3xl text-white outline-none ring-offset-2 focus:ring-2 focus:ring-blue-500 
                       transition-all duration-300 placeholder:text-white/30 shadow-2xl"
          />

          <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-3">
            {isSearching ? (
              <Loader2 size={18} className="animate-spin text-blue-400" />
            ) : query ? (
              <button type="button" onClick={() => { setQuery(""); setShowDropdown(false); }} className="text-white/40 hover:text-white transition-colors">
                <X size={20} />
              </button>
            ) : (
              <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md bg-white/10 border border-white/10 text-[10px] font-black text-white/40 uppercase tracking-tighter select-none">
                <Command size={10} /> K
              </div>
            )}
          </div>
        </form>

        {/* --- DROPDOWN RESULTS --- */}
        {showDropdown && (results.products.length > 0 || results.categories.length > 0) && (
          <div className="absolute top-full mt-4 w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="max-h-[65vh] overflow-y-auto p-4 space-y-6">
              
              {/* Categories Section */}
              {results.categories.length > 0 && (
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-4 mb-3 flex items-center gap-2">
                    <Tag size={12} /> Categories
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {results.categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => { router.push(`/categories/${cat.slug}`); setShowDropdown(false); }}
                        className="flex items-center gap-3 p-3 hover:bg-blue-50 rounded-2xl transition-all group text-left"
                      >
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:text-blue-600 transition-colors">
                          <Layers size={18} />
                        </div>
                        <span className="font-bold text-gray-800">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Products Section */}
              {results.products.length > 0 && (
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-4 mb-3 flex items-center gap-2">
                    <Package size={12} /> Products
                  </h3>
                  <div className="space-y-2">
                    {results.products.map((prod) => (
                      <button
                        key={prod.id}
                        onClick={() => { router.push(`/product/${prod.slug}`); setShowDropdown(false); }}
                        className="w-full flex items-center justify-between p-3 hover:bg-blue-50 rounded-2xl transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 border border-gray-50 shrink-0">
                            <Image 
                              src={prod.images[0]?.url || '/placeholder.png'} 
                              alt={prod.title} 
                              fill 
                              className="object-cover"
                            />
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-gray-900 group-hover:text-blue-600 line-clamp-1">{prod.title}</p>
                            <p className="text-[10px] text-gray-400 font-mono flex items-center gap-1 uppercase">
                              <Hash size={10} /> {prod.id.slice(-8)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <p className="font-black text-blue-600 text-sm">${prod.price}</p>
                          <ArrowRight size={14} className="text-gray-200 group-hover:text-blue-400 transition-all group-hover:translate-x-1" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={handleSearchSubmit}
              className="w-full py-4 bg-gray-50 text-center text-xs font-black uppercase tracking-widest text-gray-500 hover:bg-blue-600 hover:text-white transition-all border-t border-gray-100"
            >
              See all results
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Loader2, X, Layers, CornerDownLeft } from "lucide-react";
import { useLoadingOverlay } from "@/app/_context/LoadingOverlayContext";

export default function CategoriesSearch({ initialSearch }: { initialSearch: string }) {
  const [query, setQuery] = useState(initialSearch);
  const [suggestions, setSuggestions] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { setLoading } = useLoadingOverlay();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced API Fetch
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim().length < 3) {
        setSuggestions([]);
        return;
      }

      setIsSearching(true);
      try {
        const res = await fetch(`/api/categories/search?q=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();
        setSuggestions(data);
        setShowDropdown(true);
      } catch (err) {
        console.error("CategoriesSearch Error:", err);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 350);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const executeSearch = (searchTerm: string) => {
    setShowDropdown(false);
    setLoading(true);
    const params = new URLSearchParams(searchParams.toString());
    params.set("search", searchTerm);
    params.set("page", "1"); // Reset to page 1 on new search
    router.push(`/dashboard/admins/categories?${params.toString()}`);
  };

  return (
    <div className="relative w-full max-w-lg mb-8" ref={dropdownRef}>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
          {isSearching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
        </div>
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && executeSearch(query)}
          placeholder="Search categories (e.g. 'Electronics')..."
          className="w-full pl-12 pr-12 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all font-bold text-sm shadow-sm placeholder:text-gray-400 placeholder:font-medium"
          onFocus={() => query.length >= 3 && setShowDropdown(true)}
        />

        {query && (
          <button 
            onClick={() => { setQuery(""); setSuggestions([]); setShowDropdown(false); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-red-500 transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Suggestion Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-3 bg-white border border-gray-100 rounded-2xl shadow-2xl shadow-blue-900/10 overflow-hidden border-t-4 border-t-blue-600 animate-in slide-in-from-top-2 duration-200">
          <div className="p-2">
            <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400">Suggestions</div>
            {suggestions.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setQuery(item.name);
                  executeSearch(item.name);
                }}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-blue-50 text-left rounded-xl transition-all group"
              >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 group-hover:bg-white rounded-lg text-gray-400 group-hover:text-blue-600 transition-colors">
                    <Layers size={16} />
                    </div>
                    <div>
                    <div className="text-sm font-black text-gray-900 uppercase tracking-tight">{item.name}</div>
                    <div className="text-[10px] text-gray-400 font-bold italic lowercase">slug: {item.slug}</div>
                    </div>
                </div>
                <CornerDownLeft size={14} className="text-gray-200 group-hover:text-blue-300 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
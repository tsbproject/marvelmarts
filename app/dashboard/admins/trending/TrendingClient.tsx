"use client";

import React, { useTransition, useState, useEffect } from "react";
import { toggleTrendingAction } from "@/app/services/adminProductActions";
import { useNotification } from "@/app/_context/NotificationContext";
import { Flame, Package, Search, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { useDispatch } from "react-redux";
import { updateProductTrendingStatus } from "@/store/trendingSlice";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface TrendingClientProps {
  products: any[];
  totalPages: number;
  currentPage: number;
}

export default function TrendingClient({ products, totalPages, currentPage }: TrendingClientProps) {
  const { notifySuccess, notifyError } = useNotification();
  const [isPending, startTransition] = useTransition();
  const dispatch = useDispatch();
  
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 1. TACTICAL CAPACITY LOGIC
  // We calculate this based on the current visible products that are trending
  // For a more global count, you'd fetch a dedicated 'count' from the server
  const activeTrendingCount = products.filter(p => p.isTrending).length;
  const TACTICAL_LIMIT = 10;
  const isOverCapacity = activeTrendingCount > TACTICAL_LIMIT;

  // 2. SMART SEARCH STATE
  const [searchTerm, setSearchTerm] = useState(searchParams.get("query") || "");

  // --- DEBOUNCED SEARCH SYNC ---
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (searchTerm) {
        params.set("query", searchTerm);
      } else {
        params.delete("query");
      }
      params.set("page", "1"); 
      router.push(`${pathname}?${params.toString()}`);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, pathname, router, searchParams]);

  // --- PAGINATION SYNC ---
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  // --- TOGGLE ACTION ---
  const handleToggle = (id: string, current: boolean) => {
    startTransition(async () => {
      const result = await toggleTrendingAction(id, current);
      if (result.success) {
        // Update Redux for instant UI feedback across components
        dispatch(updateProductTrendingStatus({ id, status: !current }));
        notifySuccess(current ? "Unit Decommissioned." : "Tactical Priority Assigned.");
        router.refresh(); 
      } else {
        notifyError("System override failed. Try again.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* SECTION: TACTICAL CAPACITY BAR */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
          <div>
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Carousel Load Factor</p>
            <div className="flex items-center gap-3">
               <h3 className={`text-3xl font-black italic tracking-tighter ${isOverCapacity ? 'text-red-500' : 'text-blue-600'}`}>
                {activeTrendingCount} / {TACTICAL_LIMIT}
              </h3>
              <span className="text-[10px] font-black uppercase text-gray-400 bg-gray-50 px-2 py-1 rounded-md">Units Active</span>
            </div>
          </div>
          
          {isOverCapacity && (
            <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-2xl border border-red-100 animate-pulse">
              <AlertTriangle size={14} />
              <span className="text-[9px] font-black uppercase tracking-wider">Warning: High load may impact homepage performance</span>
            </div>
          )}
        </div>
        
        {/* Progress Tracker */}
        <div className="w-full h-3 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
          <div 
            className={`h-full transition-all duration-700 ease-out ${isOverCapacity ? 'bg-red-500' : 'bg-blue-600'}`}
            style={{ width: `${Math.min((activeTrendingCount / TACTICAL_LIMIT) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* SECTION: SMART SEARCH */}
      <div className="relative group max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
        <input
          type="text"
          placeholder="ENTER UNIT NAME OR SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all shadow-sm placeholder:text-gray-300"
        />
      </div>

      {/* SECTION: DATA TABLE */}
      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Product Specification</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Deploy Status</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Command</th>
              </tr>
            </thead>
            <tbody className={isPending ? "opacity-40 pointer-events-none transition-opacity duration-300" : "transition-opacity duration-300"}>
              {products.length > 0 ? (
                products.map((product) => (
                  <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center overflow-hidden border border-gray-100 group-hover:border-blue-200 transition-colors">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} className="w-full h-full object-cover" alt={product.title} />
                          ) : (
                            <Package size={20} className="text-gray-300" />
                          )}
                        </div>
                        <div>
                          <p className="font-black text-gray-900 text-[9px] md:text-[10px] uppercase tracking-tight group-hover:text-blue-600 transition-colors">{product.title}</p>
                          <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">ID: {product.sku || "UNASSIGNED"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      {product.isTrending ? (
                        <div className="flex items-center gap-2 w-fit text-[9px] font-black text-orange-600 bg-orange-50 px-3 py-1.5 rounded-xl uppercase tracking-tighter ring-1 ring-orange-200 shadow-sm shadow-orange-100">
                          <Flame size={12} fill="currentColor" className="animate-pulse" /> Trending Now
                        </div>
                      ) : (
                        <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">In Inventory</span>
                      )}
                    </td>
                    <td className="p-6 text-right">
                      <button
                        onClick={() => handleToggle(product.id, product.isTrending)}
                        disabled={isPending}
                        className={`px-6 py-2.5 rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${
                          product.isTrending
                            ? "bg-red-50 text-red-600 hover:bg-red-500 hover:text-white border border-red-100"
                            : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100"
                        }`}
                      >
                        {product.isTrending ? "Decommission" : "Promote Unit"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="p-32 text-center">
                     <div className="flex flex-col items-center gap-3">
                        <Search size={40} className="text-gray-100" />
                        <p className="text-[10px] font-black uppercase text-gray-300 tracking-[0.4em]">No units found in database.</p>
                     </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* SECTION: TACTICAL PAGINATION */}
        <div className="p-6 bg-gray-50/80 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
            Showing Page <span className="text-gray-900">{currentPage}</span> of <span className="text-gray-900">{totalPages || 1}</span>
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1 || isPending}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 disabled:opacity-30 disabled:grayscale transition-all shadow-sm"
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || isPending}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 disabled:opacity-30 disabled:grayscale transition-all shadow-sm"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
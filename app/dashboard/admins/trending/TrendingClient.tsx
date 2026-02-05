// app/dashboard/admins/trending/TrendingClient.tsx
"use client";

import React, { useTransition } from "react";
import { toggleTrendingAction } from "@/app/services/adminProductActions";
import { useNotification } from "@/app/_context/NotificationContext";
import { Flame, Star, Package } from "lucide-react";
import { useDispatch } from "react-redux";
import { updateProductTrendingStatus } from "@/store//trendingSlice";

export default function TrendingClient({ products }: { products: any[] }) {
  const { notifySuccess, notifyError } = useNotification();
  const [isPending, startTransition] = useTransition();
   const dispatch = useDispatch();



const handleToggle = (id: string, current: boolean) => {
  startTransition(async () => {
    const result = await toggleTrendingAction(id, current);
    if (result.success) {
      // 1. Update DB (Server Action handled this)
      // 2. Update Redux (Local State)
      dispatch(updateProductTrendingStatus({ id, status: !current }));
      notifySuccess("Tactical Priority Adjusted.");
    } else {
      notifyError("Failed to update status.");
    }
  });
};

  return (
    <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Product Details</th>
            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Trending Action</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
              <td className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                    {product.imageUrl ? <img src={product.imageUrl} className="w-full h-full object-cover rounded-xl" /> : <Package size={20} />}
                  </div>
                  <div>
                    <p className="font-black text-gray-900 uppercase tracking-tight">{product.name}</p>
                    <p className="text-[10px] font-bold text-gray-400">SKU: {product.sku || "N/A"}</p>
                  </div>
                </div>
              </td>
              <td className="p-6">
                 {product.isTrending ? (
                   <span className="flex items-center gap-1 text-[9px] font-black text-orange-600 bg-orange-50 px-2 py-1 rounded-md uppercase tracking-tighter">
                     <Flame size={10} fill="currentColor" /> Trending Now
                   </span>
                 ) : (
                   <span className="text-[9px] font-black text-gray-300 uppercase tracking-tighter">Standard Registry</span>
                 )}
              </td>
              <td className="p-6 text-right">
                <button
                  onClick={() => handleToggle(product.id, product.isTrending)}
                  disabled={isPending}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    product.isTrending 
                    ? "bg-red-50 text-red-600 hover:bg-red-100" 
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100"
                  }`}
                >
                  {product.isTrending ? "Remove from Trending" : "Promote to Trending"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
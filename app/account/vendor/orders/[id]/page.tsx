"use client";

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "next/navigation";
import { RootState, AppDispatch } from "@/store";
// Adjusted import to match your standard Redux structure
import { fetchOrderById } from "@/store/vendorSlice"; 
import OrderDetailsUI from "./OrderDetailsUI";
import { Loader2, PackageX, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function OrderDetailsPage() {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const [err, setErr] = useState(false);
  
  // 1. Selector: Find order in state. If user navigated from list, it's already there.
  const order = useSelector((state: RootState) => 
    state.vendor.orders.find((o: any) => o.id === id)
  );
  const loading = useSelector((state: RootState) => state.vendor.loading);

  // 2. Lifecycle: Fetch if missing (on page refresh or direct link)
  useEffect(() => {
    if (!order && id) {
      dispatch(fetchOrderById(id as string))
        .unwrap()
        .then(() => setErr(false))
        .catch(() => setErr(true));
    }
  }, [dispatch, id, order]);

  // 3. Loading State: Full screen MarvelMarts branded loader
  if (loading && !order) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#FBFBFB]">
        <Loader2 className="animate-spin text-brand-primary mb-4" size={40} />
        <p className="text-[10px] font-black uppercase tracking-widest text-accent-navy">
          Retrieving MarvelMarts Secure Data...
        </p>
      </div>
    );
  }

  // 4. Error State: Handled if the API returns 404 or 403 (Forbidden)
  if (err || (!order && !loading)) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#FBFBFB] p-6 text-center">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-6">
          <PackageX size={40} />
        </div>
        <h1 className="text-2xl font-black text-accent-navy uppercase mb-2">Order Not Found</h1>
        <p className="text-xs font-bold text-neutral-gray uppercase mb-8 max-w-xs">
          This order might have been deleted or you do not have permission to view it.
        </p>
        <Link 
          href="/account/vendor/orders"
          className="flex items-center gap-2 px-8 py-4 bg-accent-navy text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-opacity-90 transition-all shadow-lg"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>
    );
  }

  // 5. Success State: Pass data to the unified UI
  return (
    <div className="bg-[#FBFBFB] min-h-screen">
      <OrderDetailsUI 
        order={order} 
        isDrawer={false} 
      />
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Package, AlertTriangle, ExternalLink, Star } from "lucide-react";

export default function VendorIdentityCard({ vendorProfileId }: { vendorProfileId: string }) {
  const [vendor, setVendor] = useState<any>(null);

  useEffect(() => {
    async function fetchVendor() {
      const res = await fetch(`/api/admins/vendors/${vendorProfileId}`);
      if (res.ok) {
        const data = await res.json();
        setVendor(data);
      }
    }
    if (vendorProfileId) fetchVendor();
  }, [vendorProfileId]);

  if (!vendor) return (
    <div className="w-80 bg-neutral-50 rounded-[2.5rem] animate-pulse p-8 border border-neutral-100" />
  );

  return (
    <div className="w-80 flex flex-col gap-4">
      {/* Primary Stats */}
      <div className="bg-[#002B5B] rounded-[2.5rem] p-6 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#F7931E] flex items-center justify-center font-black text-xl">
            {vendor.storeName?.[0] || "V"}
          </div>
          <div>
            <h4 className="font-black uppercase text-xs truncate w-40">{vendor.storeName}</h4>
            <p className="text-[9px] text-blue-200 font-bold tracking-widest uppercase">Certified Vendor</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
          <div>
            <p className="text-[8px] font-black text-blue-300 uppercase mb-1">Trust Score</p>
            <div className="flex items-center gap-1 text-[#F7931E]">
              <Star size={12} fill="currentColor" />
              <span className="text-sm font-black">98%</span>
            </div>
          </div>
          <div>
            <p className="text-[8px] font-black text-blue-300 uppercase mb-1">Products</p>
            <div className="flex items-center gap-1">
              <Package size={12} />
              <span className="text-sm font-black">{vendor._count?.products || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Account Status / Risk Flag */}
      <div className="bg-white rounded-[2.5rem] p-6 border border-neutral-100 shadow-sm">
        <p className="text-[10px] font-black text-[#002B5B] uppercase tracking-widest mb-4">Security Profile</p>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-2xl border border-green-100">
             <span className="text-[10px] font-black text-green-700 uppercase">KYC Verified</span>
             <ShieldCheck size={14} className="text-green-600" />
          </div>

          <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-2xl border border-neutral-100 opacity-50">
             <span className="text-[10px] font-black text-neutral-400 uppercase">Open Disputes</span>
             <span className="text-xs font-black">0</span>
          </div>
        </div>

        <button className="w-full mt-6 py-4 bg-neutral-100 hover:bg-[#002B5B] hover:text-white transition-all rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2 group">
          View Storefront <ExternalLink size={12} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
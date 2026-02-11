


"use client";

import React from "react";
import AdminVendorManager from "./AdminVendorManager"; 
import { ShieldCheck } from "lucide-react";

export default function VendorsPage() {
  return (
    <div className="min-h-screen bg-[#FBFBFB] p-4 md:p-8">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#002B5B] text-white rounded-2xl shadow-lg shadow-[#002B5B]/20">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#002B5B]">Control Center</h1>
            <p className="text-gray-500 font-bold text-sm uppercase tracking-widest">
              Admin / <span className="text-[#F7931E]">Vendor Management</span>
            </p>
          </div>
        </div>
      </div>

      {/* The Table Component */}
      <div className="max-w-7xl mx-auto">
        <AdminVendorManager />
      </div>
    </div>
  );
}
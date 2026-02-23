"use client";

import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchAdminPayouts } from "@/store/vendorSlice";
import TreasurySummary from "../TreasuryStats";
import VendorsPayoutTable from "../PayoutHistoryTable";
import { AppDispatch } from "@/store";
import { WalletCards } from "lucide-react";

export default function AdminTreasuryPage() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // This loads the data into Redux so both child components have it
    dispatch(fetchAdminPayouts());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[#002B5B] rounded-lg text-white">
                <WalletCards size={20} />
              </div>
              <span className="text-[10px] font-black text-[#002B5B] uppercase tracking-[0.3em]">
                Financial Management
              </span>
            </div>
            <h1 className="text-4xl font-black text-[#002B5B] uppercase italic tracking-tighter">
              Treasury <span className="text-gray-300">Vault</span>
            </h1>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
              Review, approve, and track vendor disbursements
            </p>
          </div>
          
          {/* Quick Action or Export Button could go here */}
        </div>

        {/* 1. Statistics Cards (TreasurySummary) */}
        <TreasurySummary />

        {/* 2. Actionable Table (VendorsPayoutTable) */}
        <div className="mt-10">
           <VendorsPayoutTable />
        </div>
      </div>
    </div>
  );
}
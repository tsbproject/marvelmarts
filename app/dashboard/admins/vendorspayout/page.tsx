"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";

import VendorsPayoutTable from "../VendorsPayoutTable";
import PayoutHistoryTable from "../PayoutHistoryTable";

import { ShieldCheck, Filter } from "lucide-react";

import { fetchAdminPayouts } from "@/store/vendorSlice";

export default function VendorsPayoutsPage() {
  const dispatch = useDispatch<any>();

  useEffect(() => {
    dispatch(fetchAdminPayouts());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10">
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 bg-[#002B5B] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-900/20">
              <ShieldCheck size={28} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <p className="text-[10px] font-black text-green-600 uppercase tracking-[0.2em]">
                  Financial Gateway
                </p>
              </div>

              <h1 className="text-3xl font-black text-[#002B5B] uppercase tracking-tighter leading-none">
                Admin <span className="text-red-600">Treasury</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-2xl text-[10px] font-black text-[#002B5B] uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm">
              <Filter size={14} />
              Filter Requests
            </button>

            <div className="hidden md:flex flex-col items-end">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Global Payout Status
              </p>

              <p className="text-sm font-black text-[#002B5B] uppercase tracking-tighter">
                System Operational
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-12">
          <VendorsPayoutTable />
          <PayoutHistoryTable />
        </div>
      </main>

      <footer className="max-w-7xl mx-auto mt-20 border-t border-gray-200 pt-6">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] text-center">
          MarvelMarts © 2026 • Secure Administrative Financial Protocol
        </p>
      </footer>
    </div>
  );
}
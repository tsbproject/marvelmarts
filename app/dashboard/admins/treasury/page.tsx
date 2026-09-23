"use client";

import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { WalletCards } from "lucide-react";

import { fetchAdminPayouts } from "@/store/vendorSlice";
import { AppDispatch } from "@/store";

import FinanceOverview from "./FinanceOverview";

import TreasurySummary from "../TreasuryStats";
import VendorsPayoutTable from "../PayoutHistoryTable";
import FinancialTransactions from "./FinancialTransactions";
import FinancialReconciliation from "./FinancialReconciliation";
import FinancialGeneralLedger from "./FinancialGeneralLedger";
import FinancialVendorPayables from "./FinancialVendorPayables";

export default function AdminTreasuryPage() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // Preserve the existing vendor payout workflow.
    dispatch(fetchAdminPayouts());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="rounded-lg bg-[#002B5B] p-2 text-white">
                <WalletCards size={20} />
              </div>

              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#002B5B]">
                Financial Management
              </span>
            </div>

            <h1 className="text-4xl font-black uppercase italic tracking-tighter text-[#002B5B]">
              Treasury{" "}
              <span className="text-gray-300">
                Command Center
              </span>
            </h1>

            <p className="mt-1 text-xs font-bold uppercase tracking-widest text-gray-400">
              Financial position, revenue, expenses, and
              vendor obligations
            </p>
          </div>
        </div>

        {/* New accounting overview */}
        <FinanceOverview />
        
        <FinancialReconciliation />
        
        <FinancialTransactions />

        <FinancialGeneralLedger />

        <FinancialVendorPayables />

        {/* Existing vendor payout management */}
        <section className="mt-14">
          <div className="mb-6">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">
              Vendor Disbursements
            </p>

            <h2 className="mt-1 text-2xl font-black tracking-tight text-[#002B5B]">
              Payout Management
            </h2>

            <p className="mt-1 text-xs font-semibold text-gray-400">
              Existing vendor payout approval and
              disbursement workflow.
            </p>
          </div>

          <TreasurySummary />

          <div className="mt-10">
            <VendorsPayoutTable />
          </div>
        </section>
      </div>
    </div>
  );
}
"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useSession } from "next-auth/react";
import DashboardHeader from "@/app/_components/DashboardHeader";
import { Zap, ShieldCheck, TrendingUp, Target, BarChart3, Rocket } from "lucide-react";
import CreditTopUp from "../_components/CreditTopUp";

export default function BoostCreditsPage() {
  const { data: session } = useSession();
  const vendorProfile = useSelector((state: RootState) => state.vendor.profile);
  const boostData = vendorProfile?.boost;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/30">
      <DashboardHeader title="Boost Center" showLogout={true} />

      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
        
        {/* HERO SECTION: CREDIT BALANCE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[#002B5B] rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-blue-900/20">
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-[#F7931E] rounded-lg">
                    <Rocket size={20} className="text-[#002B5B]" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70">Growth Engine</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter mb-2">
                  Fuel Your Sales.
                </h1>
                <p className="text-white/60 max-w-md font-medium leading-relaxed">
                  Use credits to boost your products to the top of search results and gain 5x more visibility.
                </p>
              </div>

              <div className="mt-12 flex items-end gap-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Current Balance</p>
                  <div className="flex items-center gap-4">
                    <span className="text-6xl font-black italic tracking-tighter text-[#F7931E]">
                      {boostData?.credits || 0}
                    </span>
                    <Zap size={40} fill="#F7931E" className="text-[#F7931E] animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
            <div className="absolute bottom-0 right-0 p-8 opacity-10">
              <Zap size={200} fill="white" />
            </div>
          </div>

          {/* PERKS CARD */}
          <div className="bg-white rounded-[3rem] p-8 border border-gray-100 shadow-sm flex flex-col justify-between">
            <h3 className="text-xl font-black text-[#002B5B] uppercase italic tracking-tighter mb-6">Why Boost?</h3>
            <ul className="space-y-4">
              {[
                { icon: <TrendingUp size={18} />, text: "Priority Search Ranking" },
                { icon: <Target size={18} />, text: "Targeted Audience Reach" },
                { icon: <BarChart3 size={18} />, text: "Detailed Performance Analytics" }
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-4 text-sm font-bold text-gray-500">
                  <div className="text-[#F7931E]">{item.icon}</div>
                  {item.text}
                </li>
              ))}
            </ul>
            <div className="mt-8 p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Credits never expire
              </p>
            </div>
          </div>
        </div>

        {/* TOP-UP SECTION */}
        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="text-2xl font-extrabold text-[#002B5B] uppercase italic tracking-tighter">Purchase Credits</h3>
              <p className="text-xs font-bold text-gray-400">Select a package to replenish your balance</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full border border-green-100">
               <ShieldCheck size={14} className="text-green-600" />
               <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">Encrypted Checkout</span>
            </div>
          </div>
          
          <div className="p-4 md:p-8">
            {vendorProfile?.id ? (
              <CreditTopUp 
                vendorProfileId={vendorProfile.id} 
                userEmail={session?.user?.email as string} 
              />
            ) : (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#002B5B]" />
              </div>
            )}
          </div>
        </div>

        {/* INFO FOOTER */}
        <div className="text-center pb-12">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
            Transactions processed via Secure Payment Gateway
          </p>
        </div>
      </div>
    </div>
  );
}
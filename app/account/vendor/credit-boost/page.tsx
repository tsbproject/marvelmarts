// "use client";

// import { useSelector } from "react-redux";
// import { RootState } from "@/store";
// import { useSession } from "next-auth/react";
// import DashboardHeader from "@/app/_components/DashboardHeader";
// import { Zap, ShieldCheck, TrendingUp, Target, BarChart3, Rocket, CheckCircle2 } from "lucide-react";
// import CreditTopUp from "../_components/CreditTopUp";

// export default function BoostCreditsPage() {
//   const { data: session } = useSession();
//   const vendorProfile = useSelector((state: RootState) => state.vendor.profile);
//   const boostData = vendorProfile?.boost;

//   // Define the pricing plans to match the Inventory Modal
//   const boostPlans = [
//     { days: 3, credits: 15, label: "Starter" },
//     { days: 7, credits: 30, label: "Popular", discount: "Save 15%" },
//     { days: 30, credits: 100, label: "Pro Growth", discount: "Save 33%" },
//   ];

//   return (
//     <div className="flex flex-col min-h-screen bg-gray-50/30">
//       <DashboardHeader title="Boost Center" showLogout={true} />

//       <div className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
//         {/* HERO SECTION: CREDIT BALANCE */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           <div className="lg:col-span-2 bg-[#002B5B] rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-blue-900/20">
//             <div className="relative z-10 flex flex-col h-full justify-between">
//               <div>
//                 <div className="flex items-center gap-3 mb-4">
//                   <div className="p-2 bg-[#F7931E] rounded-lg">
//                     <Rocket size={20} className="text-[#002B5B]" />
//                   </div>
//                   <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70">Growth Engine</span>
//                 </div>
//                 <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter mb-2">
//                   Fuel Your Sales.
//                 </h1>
//                 <p className="text-white/60 max-w-md font-medium leading-relaxed">
//                   Use credits to boost your products to the top of search results and gain 5x more visibility.
//                 </p>
//               </div>

//               <div className="mt-12 flex items-end gap-6">
//                 <div>
//                   <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Current Balance</p>
//                   <div className="flex items-center gap-4">
//                     <span className="text-6xl font-black italic tracking-tighter text-[#F7931E]">
//                       {boostData?.credits || 0}
//                     </span>
//                     <Zap size={40} fill="#F7931E" className="text-[#F7931E] animate-pulse" />
//                   </div>
//                 </div>
//               </div>
//             </div>
            
//             {/* Decorative Elements */}
//             <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
//             <div className="absolute bottom-0 right-0 p-8 opacity-10">
//               <Zap size={200} fill="white" />
//             </div>
//           </div>

//           {/* PERKS CARD */}
//           <div className="bg-white rounded-[3rem] p-8 border border-gray-100 shadow-sm flex flex-col justify-between">
//             <h3 className="text-xl font-black text-[#002B5B] uppercase italic tracking-tighter mb-6">Why Boost?</h3>
//             <ul className="space-y-4">
//               {[
//                 { icon: <TrendingUp size={18} />, text: "Priority Search Ranking" },
//                 { icon: <Target size={18} />, text: "Targeted Audience Reach" },
//                 { icon: <BarChart3 size={18} />, text: "Detailed Performance Analytics" }
//               ].map((item, i) => (
//                 <li key={i} className="flex items-center gap-4 text-sm font-bold text-gray-500">
//                   <div className="text-[#F7931E]">{item.icon}</div>
//                   {item.text}
//                 </li>
//               ))}
//             </ul>
//             <div className="mt-8 p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center">
//               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
//                 Credits never expire
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* 🚀 NEW: BOOST PLANS OVERVIEW */}
//         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//           {boostPlans.map((plan) => (
//             <div key={plan.days} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group hover:border-[#F7931E] transition-all">
//               <div className="flex justify-between items-start mb-4">
//                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{plan.label}</span>
//                 {plan.discount && (
//                   <span className="bg-green-100 text-green-600 text-[8px] font-black px-2 py-1 rounded-full uppercase">
//                     {plan.discount}
//                   </span>
//                 )}
//               </div>
//               <h4 className="text-2xl font-black text-[#002B5B] italic tracking-tighter">{plan.days} Days</h4>
//               <div className="flex items-center gap-2 mt-1">
//                 <span className="text-lg font-black text-[#F7931E]">{plan.credits}</span>
//                 <span className="text-[10px] font-bold text-gray-400 uppercase">Credits</span>
//               </div>
//               <CheckCircle2 size={40} className="absolute -bottom-2 -right-2 text-gray-50 group-hover:text-[#F7931E]/10 transition-colors" />
//             </div>
//           ))}
//         </div>

//         {/* TOP-UP SECTION */}
//         <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
//           <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
//             <div>
//               <h3 className="text-2xl font-extrabold text-[#002B5B] uppercase italic tracking-tighter">Purchase Credits</h3>
//               <p className="text-xs font-bold text-gray-400">Select a package to replenish your balance</p>
//             </div>
//             <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full border border-green-100">
//                <ShieldCheck size={14} className="text-green-600" />
//                <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">Encrypted Checkout</span>
//             </div>
//           </div>
          
//           <div className="p-4 md:p-8">
//             {vendorProfile?.id ? (
//               <CreditTopUp 
//                 vendorProfileId={vendorProfile.id} 
//                 userEmail={session?.user?.email as string} 
//               />
//             ) : (
//               <div className="h-64 flex items-center justify-center">
//                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#002B5B]" />
//               </div>
//             )}
//           </div>
//         </div>

//         {/* INFO FOOTER */}
//         <div className="text-center pb-12">
//           <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
//             Transactions processed via Secure Payment Gateway
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }



"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useSession } from "next-auth/react";
import DashboardHeader from "@/app/_components/DashboardHeader";
import {
  Zap,
  ShieldCheck,
  TrendingUp,
  Target,
  BarChart3,
  Rocket,
  CheckCircle2,
} from "lucide-react";
import CreditTopUp from "../_components/CreditTopUp";

export default function BoostCreditsPage() {
  const { data: session, status } = useSession();
  const vendorProfile = useSelector((state: RootState) => state.vendor.profile);
  const boostData = vendorProfile?.boost;

  const currentCredits = boostData?.credits ?? 0;
  const vendorProfileId = vendorProfile?.id ?? "";
  const userEmail = session?.user?.email ?? "";

  const boostPlans = [
    { days: 3, credits: 15, label: "Starter" },
    { days: 7, credits: 30, label: "Popular", discount: "Save 15%" },
    { days: 30, credits: 100, label: "Pro Growth", discount: "Save 33%" },
  ];

  const isReady = Boolean(vendorProfileId && userEmail);
  const isLoading = !vendorProfile?.id || status === "loading";

  return (
    <div className="flex min-h-screen flex-col bg-gray-50/30">
      <DashboardHeader title="Boost Center" showLogout={true} />

      <div className="mx-auto w-full max-w-7xl space-y-8 animate-in fade-in slide-in-from-bottom-4 p-4 duration-700 md:p-8">
        {/* HERO SECTION: CREDIT BALANCE */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="relative overflow-hidden rounded-[3rem] bg-[#002B5B] p-8 text-white shadow-2xl shadow-blue-900/20 md:p-12 lg:col-span-2">
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-lg bg-[#F7931E] p-2">
                    <Rocket size={20} className="text-[#002B5B]" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70">
                    Growth Engine
                  </span>
                </div>

                <h1 className="mb-2 text-4xl font-black italic tracking-tighter md:text-5xl">
                  Fuel Your Sales.
                </h1>

                <p className="max-w-md font-medium leading-relaxed text-white/60">
                  Use credits to boost your products to the top of search results
                  and gain more visibility across the marketplace.
                </p>
              </div>

              <div className="mt-12 flex items-end gap-6">
                <div>
                  <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-white/40">
                    Current Balance
                  </p>

                  <div className="flex items-center gap-4">
                    <span className="text-6xl font-black italic tracking-tighter text-[#F7931E]">
                      {currentCredits}
                    </span>
                    <Zap
                      size={40}
                      fill="#F7931E"
                      className="animate-pulse text-[#F7931E]"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute right-0 top-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute bottom-0 right-0 p-8 opacity-10">
              <Zap size={200} fill="white" />
            </div>
          </div>

          {/* PERKS CARD */}
          <div className="flex flex-col justify-between rounded-[3rem] border border-gray-100 bg-white p-8 shadow-sm">
            <h3 className="mb-6 text-xl font-black uppercase italic tracking-tighter text-[#002B5B]">
              Why Boost?
            </h3>

            <ul className="space-y-4">
              {[
                { icon: <TrendingUp size={18} />, text: "Priority Search Ranking" },
                { icon: <Target size={18} />, text: "Targeted Audience Reach" },
                { icon: <BarChart3 size={18} />, text: "Detailed Performance Analytics" },
              ].map((item, i) => (
                <li
                  key={i}
                  className="flex items-center gap-4 text-sm font-bold text-gray-500"
                >
                  <div className="text-[#F7931E]">{item.icon}</div>
                  {item.text}
                </li>
              ))}
            </ul>

            <div className="mt-8 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4 text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Credits update after verified payment
              </p>
            </div>
          </div>
        </div>

        {/* BOOST PLANS OVERVIEW */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {boostPlans.map((plan) => (
            <div
              key={plan.days}
              className="group relative overflow-hidden rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm transition-all hover:border-[#F7931E]"
            >
              <div className="mb-4 flex items-start justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  {plan.label}
                </span>

                {plan.discount && (
                  <span className="rounded-full bg-green-100 px-2 py-1 text-[8px] font-black uppercase text-green-600">
                    {plan.discount}
                  </span>
                )}
              </div>

              <h4 className="text-2xl font-black italic tracking-tighter text-[#002B5B]">
                {plan.days} Days
              </h4>

              <div className="mt-1 flex items-center gap-2">
                <span className="text-lg font-black text-[#F7931E]">
                  {plan.credits}
                </span>
                <span className="text-[10px] font-bold uppercase text-gray-400">
                  Credits
                </span>
              </div>

              <CheckCircle2
                size={40}
                className="absolute -bottom-2 -right-2 text-gray-50 transition-colors group-hover:text-[#F7931E]/10"
              />
            </div>
          ))}
        </div>

        {/* TOP-UP SECTION */}
        <div className="overflow-hidden rounded-[3rem] border border-gray-100 bg-white shadow-sm">
          <div className="flex flex-col items-center justify-between gap-4 border-b border-gray-100 p-8 md:flex-row">
            <div>
              <h3 className="text-2xl font-extrabold uppercase italic tracking-tighter text-[#002B5B]">
                Purchase Credits
              </h3>
              <p className="text-xs font-bold text-gray-400">
                Select a package to replenish your balance
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-green-100 bg-green-50 px-4 py-2">
              <ShieldCheck size={14} className="text-green-600" />
              <span className="text-[10px] font-black uppercase tracking-widest text-green-700">
                Encrypted Checkout
              </span>
            </div>
          </div>

          <div className="p-4 md:p-8">
            {isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#002B5B]" />
              </div>
            ) : isReady ? (
              <CreditTopUp
                vendorProfileId={vendorProfileId}
                userEmail={userEmail}
              />
            ) : (
              <div className="flex min-h-[220px] items-center justify-center rounded-[2rem] border border-dashed border-gray-200 bg-gray-50 px-6 text-center">
                <div>
                  <p className="text-sm font-bold text-[#002B5B]">
                    We could not load your vendor payment details.
                  </p>
                  <p className="mt-2 text-xs font-medium text-gray-500">
                    Refresh the page or log in again to continue purchasing credits.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* INFO FOOTER */}
        <div className="pb-12 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
            Transactions processed via secure payment gateway
          </p>
        </div>
      </div>
    </div>
  );
}
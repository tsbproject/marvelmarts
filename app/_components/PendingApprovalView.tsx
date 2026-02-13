"use client";

import React from "react";
import { Clock, ShieldCheck, Zap } from "lucide-react";

export function PendingApprovalView() {
  return (
    <div className="flex flex-col items-center justify-center p-8 max-w-2xl mx-auto text-center">
      <div className="w-20 h-20 bg-[#FFE8CC] rounded-3xl flex items-center justify-center mb-8 animate-pulse">
        <Clock size={40} className="text-[#F7931E]" />
      </div>
      
      <h2 className="text-3xl font-black text-[#002B5B] uppercase tracking-tight mb-4">
        Application Under Review
      </h2>
      
      <p className="text-[#4B4B4B] font-bold leading-relaxed mb-10">
        Welcome to the Marvelmarts family! Your store details are currently being 
        verified by our compliance team. This usually takes 24–48 hours. 
        You’ll receive an email as soon as your shop is live.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        <div className="p-6 bg-[#F8F8F8] rounded-[2rem] border-2 border-transparent hover:border-[#F7931E]/20 transition-all text-left">
          <ShieldCheck className="text-[#F7931E] mb-3" size={28} />
          <h4 className="font-black text-sm uppercase text-[#002B5B]">Safety First</h4>
          <p className="text-xs font-bold text-[#4B4B4B] mt-1">We verify all merchants to maintain marketplace trust.</p>
        </div>
        <div className="p-6 bg-[#F8F8F8] rounded-[2rem] border-2 border-transparent hover:border-[#F7931E]/20 transition-all text-left">
          <Zap className="text-[#F7931E] mb-3" size={28} />
          <h4 className="font-black text-sm uppercase text-[#002B5B]">Fast Track</h4>
          <p className="text-xs font-bold text-[#4B4B4B] mt-1">Have your documents ready in case our team reaches out.</p>
        </div>
      </div>
    </div>
  );
}
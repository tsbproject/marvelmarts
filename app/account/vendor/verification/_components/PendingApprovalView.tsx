



"use client";

import React from "react";
import { Clock, ShieldCheck, Zap, RefreshCcw } from "lucide-react";
import { VendorStatus } from "@prisma/client";

interface PendingApprovalViewProps {
  status: VendorStatus;
}

export function PendingApprovalView({ status }: PendingApprovalViewProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 min-h-[80vh] max-w-2xl mx-auto text-center animate-in fade-in duration-700">
      <div className="w-20 h-20 bg-[#FFE8CC] rounded-3xl flex items-center justify-center mb-8 animate-pulse shadow-xl shadow-orange-100">
        <Clock size={40} className="text-[#F7931E]" />
      </div>
      
      <h2 className="text-3xl font-black text-[#002B5B] uppercase tracking-tighter mb-4 italic">
        Documents Received<span className="text-[#F7931E]">.</span>
      </h2>
      
      <div className="space-y-6 mb-10">
        <p className="text-[#4B4B4B] font-bold leading-relaxed">
          Welcome to the Marvelmarts family! We have successfully received your verification documents. 
          Our compliance team is currently cross-referencing your uploads with your profile information.
        </p>

        <div className="p-5 bg-[#002B5B]/5 rounded-2xl border-l-4 border-[#F7931E] text-left italic">
          <p className="text-[13px] font-black text-[#002B5B] uppercase tracking-tight">
            The Approval Process:
          </p>
          <p className="text-xs font-bold text-[#4B4B4B] mt-1 leading-relaxed">
            If your documents are relevant and match your submitted details, your store will be approved within 24–48 hours. 
            If there are discrepancies, you may be asked to resubmit specific files until final approval is reached.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        <div className="p-6 bg-[#F8F8F8] rounded-[2rem] border-2 border-transparent hover:border-[#F7931E]/20 transition-all text-left group">
          <ShieldCheck className="text-[#F7931E] mb-3 group-hover:scale-110 transition-transform" size={28} />
          <h4 className="font-black text-sm uppercase text-[#002B5B]">Relevance Check</h4>
          <p className="text-xs font-bold text-[#4B4B4B] mt-1 italic">We ensure all documents are valid and match your business type.</p>
        </div>
        
        <div className="p-6 bg-[#F8F8F8] rounded-[2rem] border-2 border-transparent hover:border-[#F7931E]/20 transition-all text-left group">
          <RefreshCcw className="text-[#F7931E] mb-3 group-hover:rotate-180 transition-transform duration-700" size={28} />
          <h4 className="font-black text-sm uppercase text-[#002B5B]">Easy Resubmission</h4>
          <p className="text-xs font-bold text-[#4B4B4B] mt-1 italic">If rejected, you can instantly upload corrected files for re-review.</p>
        </div>
      </div>

      <p className="mt-12 text-[10px] font-black text-[#9A9A9A] uppercase tracking-[0.2em]">
        Status: {status.replace("_", " ")}
      </p>
    </div>
  );
}
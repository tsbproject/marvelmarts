"use client";

import React from "react";
import { AlertCircle, ArrowRight, Mail } from "lucide-react";
import { useRouter } from "next/navigation";

interface RejectedViewProps {
  reason?: string;
  email?: string | null;
}

export function RejectedView({ reason, email }: RejectedViewProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center p-8 max-w-2xl mx-auto text-center">
      <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mb-8">
        <AlertCircle size={40} className="text-red-500" />
      </div>
      
      <h2 className="text-3xl font-black text-red-600 uppercase tracking-tight mb-2">
        Updates Required
      </h2>
      <p className="text-[#4B4B4B] font-bold mb-8">
        Your application was not approved yet. Please review the feedback below.
      </p>

      <div className="w-full bg-red-50 border-2 border-red-100 p-6 rounded-[2.5rem] mb-10 text-left relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
            <AlertCircle size={80} />
        </div>
        <h4 className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-2">Admin Feedback</h4>
        <p className="text-red-700 font-black italic text-lg leading-snug">
          "{reason || "Please provide a clearer business address and a valid phone number."}"
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full">
        <button
          onClick={() => router.push("/auth/register/vendor")}
          className="flex-[2] py-5 bg-[#002B5B] text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-[#002B5B]/20"
        >
          Fix & Resubmit <ArrowRight size={20} />
        </button>
        <a
          href={`mailto:support@marvelmarts.com?subject=Rejection Appeal - ${email}`}
          className="flex-1 py-5 bg-[#F8F8F8] text-[#4B4B4B] rounded-2xl font-black text-sm uppercase flex items-center justify-center gap-2 hover:bg-gray-200 transition-all"
        >
          <Mail size={18} /> Support
        </a>
      </div>
    </div>
  );
}
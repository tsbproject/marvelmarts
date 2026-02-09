"use client";

import { useState } from "react";
import { CheckCircle, XCircle, ShieldAlert } from "lucide-react";

export default function AdminRefundDecisionModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  action 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: (reason: string) => void;
  action: "approved" | "rejected" | null;
}) {
  const [reason, setReason] = useState("");
  const isApprove = action === "approved";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neutral-dark/80 backdrop-blur-md">
      <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl">
        <div className="flex flex-col items-center text-center mb-8">
          <div className={`p-4 rounded-full mb-4 ${isApprove ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
            {isApprove ? <CheckCircle size={40} /> : <XCircle size={40} />}
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tighter text-accent-navy">
            {isApprove ? "Authorize Reversal" : "Decline Request"}
          </h2>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2 px-10">
            {isApprove 
              ? "This will trigger a financial reversal and notify the asset owner." 
              : "Please justify the rejection. This will be visible to the customer."}
          </p>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-4">
            Decision Justification
          </label>
          <textarea
            className="w-full h-28 p-5 bg-gray-50 border-none rounded-[2rem] text-md font-bold focus:ring-2 focus:ring-accent-navy outline-none transition-all resize-none"
            placeholder={isApprove ? "Internal reason for approval..." : "Reason for rejection..."}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <div className="mt-10 flex flex-col gap-3">
          <button
            disabled={!reason.trim()}
            onClick={() => onConfirm(reason)}
            className={`w-full py-5 rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 ${
              isApprove 
                ? "bg-green-600 text-white hover:bg-green-700 shadow-green-200" 
                : "bg-red-600 text-white hover:bg-red-700 shadow-red-200"
            }`}
          >
            Confirm {action}
          </button>
          <button onClick={onClose} className="py-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors">
            Cancel Mission
          </button>
        </div>
      </div>
    </div>
  );
}
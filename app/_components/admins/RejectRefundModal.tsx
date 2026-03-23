// app/_components/admins/modals/RejectRefundModal.tsx
"use client";

import { useState } from "react";
import { XCircle, AlertTriangle, ShieldX } from "lucide-react";

export default function RejectRefundModal({ 
  isOpen, 
  onClose, 
  onConfirm,
  orderNumber 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: (reason: string) => void;
  orderNumber: string;
}) {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#002B5B]/20 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border border-red-50 animate-in zoom-in duration-200">
        <div className="flex flex-col items-center text-center">
          <div className="p-4 bg-red-50 text-red-600 rounded-full mb-4">
            <ShieldX size={40} />
          </div>
          <h2 className="text-2xl font-black uppercase italic tracking-tighter text-gray-900">
            Decline Request
          </h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
            Order Reference: {orderNumber}
          </p>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2 block ml-2">
              Reason for Rejection (Sent to Customer)
            </label>
            <textarea 
              className="w-full h-32 p-5 bg-gray-50 border-2 border-transparent focus:border-red-100 focus:bg-white rounded-[1.5rem] text-sm font-medium outline-none transition-all resize-none"
              placeholder="e.g., Return window expired or item condition tag missing..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
            <AlertTriangle size={14} className="text-amber-600 shrink-0" />
            <p className="text-[9px] font-bold text-amber-700 leading-tight">
              Declining will notify the customer immediately. This status is logged for audit.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2">
          <button
            onClick={() => onConfirm(reason)}
            disabled={reason.length < 5}
            className="w-full py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-red-100 hover:bg-red-700 transition-all disabled:opacity-30"
          >
            Confirm Rejection
          </button>
          <button 
            onClick={onClose}
            className="w-full py-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
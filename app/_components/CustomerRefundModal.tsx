"use client";

import { useState } from "react";
import { X, AlertCircle, RotateCcw, Ban } from "lucide-react";

export default function CustomerRefundModal({ 
  isOpen, 
  onClose, 
  onConfirm 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md transition-all">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2 rounded-xl text-blue-600">
              <RotateCcw size={20} />
            </div>
            <h2 className="text-xl font-black uppercase tracking-tighter text-accent-navy">Initiate <span className="text-brand-primary">Reversal</span></h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Warning Banner */}
        <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex gap-3 mb-6">
          <AlertCircle className="text-amber-600 shrink-0" size={18} />
          <p className="text-[10px] font-black text-amber-700 leading-relaxed uppercase tracking-wider">
            Critical: Provide a detailed justification. This request will be audited by our tactical command.
          </p>
        </div>

        {/* Text Area */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-navy ml-4">
            Reason for Request
          </label>
          <textarea
            className="w-full h-32 p-5 bg-gray-50 border-2 border-transparent rounded-[2rem] text-md font-bold focus:border-blue-100 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all resize-none placeholder:text-gray-300"
            placeholder="Describe the issue (Min 10 characters)..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <button
            onClick={onClose}
            className="flex items-center justify-center gap-2 py-4 bg-white border-2 border-gray-100 text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 hover:text-gray-600 transition-all active:scale-95"
          >
            <Ban size={14} /> Abort Request
          </button>
          <button
            disabled={reason.length < 10}
            onClick={() => onConfirm(reason)}
            className="flex items-center justify-center gap-2 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 disabled:opacity-30 disabled:grayscale transition-all shadow-lg shadow-blue-200 active:scale-95"
          >
            Submit Order Refund
          </button>
        </div>
      </div>
    </div>
  );
}
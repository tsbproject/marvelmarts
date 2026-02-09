"use client";

import { useState } from "react";
import { X, Trash2, AlertTriangle, Ban } from "lucide-react";

export default function OrderCancelModal({ 
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
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in fade-in zoom-in duration-300 border border-red-50">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-red-50 p-2 rounded-xl text-red-600">
              <Trash2 size={20} />
            </div>
            <h2 className="text-xl font-black uppercase tracking-tighter text-gray-900">
              Abort <span className="text-red-600">Order</span>
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Warning Banner */}
        <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex gap-3 mb-6">
          <AlertTriangle className="text-red-600 shrink-0" size={18} />
          <p className="text-[10px] font-black text-red-700 leading-relaxed uppercase tracking-wider">
            Critical Warning: This action is irreversible. Funds will be returned to your original payment source.
          </p>
        </div>

        {/* Reason Input */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-4">
            Reason for Cancellation
          </label>
          <textarea
            className="w-full h-28 p-5 bg-gray-50 border-2 border-transparent rounded-[2rem] text-lg font-bold focus:border-red-100 focus:bg-white focus:ring-4 focus:ring-red-50 outline-none transition-all resize-none placeholder:text-gray-300"
            placeholder="Tell us why you're canceling..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        {/* Action Buttons */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <button
            onClick={onClose}
            className="flex items-center justify-center gap-2 py-4 bg-white border-2 border-gray-100 text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 hover:text-gray-600 transition-all active:scale-95"
          >
            <Ban size={14} /> Keep Order
          </button>
          <button
            disabled={!reason.trim()}
            onClick={() => onConfirm(reason)}
            className="flex items-center justify-center gap-2 py-4 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 disabled:opacity-30 disabled:grayscale transition-all shadow-lg shadow-red-200 active:scale-95"
          >
            Confirm Abort
          </button>
        </div>
      </div>
    </div>
  );
}
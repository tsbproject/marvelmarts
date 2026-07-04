"use client";

import { useState } from "react";
import { X, Zap, ShieldCheck, TrendingUp } from "lucide-react";

interface QuickFundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (amount: number) => void;
  email?: string;
}

export default function QuickFundModal({
  isOpen,
  onClose,
  onSuccess,
}: QuickFundModalProps) {
  const [customAmount, setCustomAmount] = useState<string>("");
  const QUICK_AMOUNTS = [2000, 5000, 10000, 20000];
  const MAX_FUND = 500000;

  if (!isOpen) return null;

  const handleConfirm = () => {
    const amt = Number(customAmount);
    if (amt >= 500 && amt <= MAX_FUND) {
      onSuccess(amt);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-accent-navy/95 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl border-2 border-brand-primary/20 flex flex-col">
        <div className="bg-brand-primary p-6 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-all"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-3">
            <Zap className="text-accent-navy" fill="currentColor" size={28} />
            <h2 className="text-2xl font-black italic uppercase leading-none">
              Power Up
            </h2>
          </div>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            {QUICK_AMOUNTS.map((amt) => (
              <button
                key={amt}
                onClick={() => onSuccess(amt)}
                className="py-4 rounded-2xl border-2 border-neutral-light font-black text-accent-navy hover:border-brand-primary hover:bg-brand-primary/5 transition-all text-sm"
              >
                ₦{amt.toLocaleString()}
              </button>
            ))}
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-neutral-light"></span>
            </div>
            <div className="relative flex justify-center text-[9px] uppercase font-black bg-white px-3 text-neutral-gray">
              Enter Any Amount
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative group">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-accent-navy text-xl">
                ₦
              </span>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="e.g. 50,000"
                className="w-full p-5 pl-10 bg-neutral-light rounded-2xl outline-none font-black text-2xl focus:ring-2 ring-brand-primary transition-all placeholder:text-neutral-gray/30"
              />
            </div>

            {Number(customAmount) > 20000 && (
              <p className="text-[10px] font-bold text-brand-primary flex items-center gap-1 animate-pulse uppercase italic">
                <TrendingUp size={12} /> High-Value Top Up Detected
              </p>
            )}

            {Number(customAmount) > MAX_FUND && (
              <p className="text-[9px] font-bold text-red-500 uppercase">
                Limit: ₦{MAX_FUND.toLocaleString()}
              </p>
            )}
          </div>

          <button
            disabled={
              !customAmount ||
              Number(customAmount) < 500 ||
              Number(customAmount) > MAX_FUND
            }
            onClick={handleConfirm}
            className={`w-full py-5 rounded-[1.5rem] font-black uppercase italic shadow-lg transition-all text-sm flex items-center justify-center gap-2
              ${
                Number(customAmount) > 20000
                  ? "bg-brand-primary text-white scale-105 shadow-brand-primary/20"
                  : "bg-accent-navy text-white hover:bg-brand-primary"
              } disabled:opacity-30`}
          >
            Confirm ₦{Number(customAmount || 0).toLocaleString()}
          </button>

          <p className="text-[8px] font-bold text-neutral-gray uppercase flex items-center justify-center gap-1 opacity-60">
            <ShieldCheck size={12} className="text-brand-primary" /> MarvelMarts
            Encrypted
          </p>
        </div>
      </div>
    </div>
  );
}
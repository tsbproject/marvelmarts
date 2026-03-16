"use client";
import { ShieldAlert, Mail } from "lucide-react";

export default function SuspensionBanner({ isSuspended }: { isSuspended: boolean }) {
  if (!isSuspended) return null;

  return (
    <div className="mb-6 overflow-hidden rounded-[2rem] border border-red-100 bg-red-50/50 p-1">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600 shadow-sm">
            <ShieldAlert size={24} />
          </div>
          <div>
            <h4 className="text-sm font-black uppercase tracking-tighter text-red-700">Account Restricted</h4>
            <p className="text-xs font-bold text-red-600/70">Your store and products are currently hidden from the public marketplace.</p>
          </div>
        </div>
        
        <a 
          href="mailto:support@marvelmarts.com" 
          className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-600 shadow-sm hover:bg-red-600 hover:text-white transition-all"
        >
          <Mail size={14} />
          Appeal Restriction
        </a>
      </div>
    </div>
  );
}
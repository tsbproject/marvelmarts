"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function ShareActions({ storeUrl }: { storeUrl: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(storeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link");
    }
  };

  return (
    <button 
      onClick={handleCopy}
      className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-[10px] font-bold uppercase transition-all"
    >
      {copied ? (
        <>
          <Check size={14} className="text-brand-primary" /> Copied!
        </>
      ) : (
        <>
          <Copy size={14} className="text-brand-primary" /> Copy Link
        </>
      )}
    </button>
  );
}
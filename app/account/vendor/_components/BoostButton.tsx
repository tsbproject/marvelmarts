"use client";

import { useState } from "react";
import { Rocket, Loader2 } from "lucide-react";
import { boostProduct } from "@/app/_actions/boostActions";
import { useNotification } from "@/app/_context/NotificationContext"; 

export default function BoostButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false);
  const { notifyError, notifySuccess } = useNotification();

  const handleBoost = async () => {
  setLoading(true);
  try {
    // 🚀 FIX: Pass the second argument (days). 
    // If you have a state for selected days, use that. Otherwise, use a default like 7.
    const res = await boostProduct(productId, 7); 
    
    if ("success" in res && res.success) {
      notifySuccess("Product boosted successfully!");
      } else if ("error" in res) {
        // Handling the error case with your notification helper
        notifyError(res.error || "Failed to boost product");
      }
    } catch (err) {
      notifyError("A system error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleBoost}
      disabled={loading}
      className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-full text-[9px] font-black uppercase hover:bg-orange-600 hover:text-white transition-all disabled:opacity-50 active:scale-95 shadow-sm"
    >
      {loading ? (
        <Loader2 size={10} className="animate-spin" />
      ) : (
        <Rocket size={10} />
      )}
      {loading ? "Processing..." : "Boost Now"}
    </button>
  );
}
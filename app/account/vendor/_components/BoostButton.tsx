


"use client";

import { useState } from "react";
import { Rocket, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { boostProduct } from "@/app/_actions/boostActions";
import { useNotification } from "@/app/_context/NotificationContext";
import { updateCredits } from "@/store/vendorSlice";
import { useDispatch } from "react-redux";

export default function BoostButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false);
  const { notifyError, notifySuccess } = useNotification();
  const router = useRouter();
  const dispatch = useDispatch();

  const handleBoost = async (selectedDays: number) => {
    setLoading(true);

    try {
      const res = await boostProduct(productId, selectedDays);

      if ("success" in res && res.success) {
        notifySuccess(`Boosted for ${selectedDays} days!`);
        dispatch(updateCredits(res.newBalance));
        router.refresh();
      } else {
        notifyError((res as any).error || "Boost failed");
      }
    } catch (error) {
      console.error("Boost error:", error);
      notifyError("Connection error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={() => handleBoost(3)}
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

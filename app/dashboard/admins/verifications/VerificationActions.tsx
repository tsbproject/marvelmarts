



"use client";

import { useState } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { useNotification } from "@/app/_context/NotificationContext";
import { processVendorApproval } from "@/app/_actions/admin-actions"; 
import { useRouter } from "next/navigation";
import { VendorStatus } from "@prisma/client";
import { useDispatch } from "react-redux"; 
import { updateVendorStatusInStore } from "@/store/vendorSlice"; 

export default function VerificationActions({ vendorProfileId }: { vendorProfileId: string }) {
  const [loading, setLoading] = useState<VendorStatus | null>(null);
  const { notifySuccess, notifyError } = useNotification();
  const router = useRouter();
  const dispatch = useDispatch();

  const handleAction = async (status: VendorStatus) => {
    setLoading(status);
    
    try {
      const result = await processVendorApproval(vendorProfileId, status);
      
      if (result.success) {
        // 1. Update Redux Store immediately for UI consistency
        dispatch(updateVendorStatusInStore({ 
          vendorId: vendorProfileId, 
          status: status 
        }));

        // 2. Notify the user
        notifySuccess(`Vendor ${status === "APPROVED" ? "Activated" : "Rejected"}`);
        
        // 3. Refresh Server Components
        router.refresh();
      } else {
        notifyError(result.error || "Action failed");
      }
    } catch (err) {
      notifyError("System error during processing");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex items-center bg-white border border-gray-100 p-2 rounded-[1.5rem] gap-2 shadow-sm">
      <button
        onClick={() => handleAction("APPROVED")}
        disabled={!!loading}
        className="flex items-center justify-center gap-2 px-6 py-3 bg-[#002B5B] hover:bg-green-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest transition-all disabled:opacity-50"
      >
        {loading === "APPROVED" ? <Loader2 size={12} className="animate-spin" /> : <Check size={14} />}
        Approve Store
      </button>

      <button
        onClick={() => handleAction("REJECTED")}
        disabled={!!loading}
        className="flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-red-50 text-red-600 border border-red-100 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all disabled:opacity-50"
      >
        {loading === "REJECTED" ? <Loader2 size={12} className="animate-spin" /> : <X size={14} />}
        Reject
      </button>
    </div>
  );
}
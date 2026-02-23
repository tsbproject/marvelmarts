"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { updateOrderStatus } from "@/store/vendorSlice";
import { useNotification } from "@/app/_context/NotificationContext"; 
import { PackageCheck, XCircle, Loader2, Info } from "lucide-react";

interface OrderActionProps {
  orderId: string;
  currentStatus: string;
  trackingNumber?: string | null;
}

export default function OrderActionWrapper({ 
  orderId, 
  currentStatus, 
  trackingNumber 
}: OrderActionProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { notifyError, notifySuccess } = useNotification(); 
  
  const [loading, setLoading] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [trackNum, setTrackNum] = useState(trackingNumber || "");

  // Note: We rely on the prop for status to keep Redux as the "Source of Truth"
  const status = currentStatus.toUpperCase();

  const handleUpdate = async (newStatus: "APPROVED" | "REJECTED") => {
    // 1. Validation for tracking number on approval
    if (newStatus === "APPROVED" && !trackNum.trim()) {
      notifyError("Please enter a tracking number to approve the order.");
      return;
    }

    setLoading(true);
    try {
      // 2. Dispatch Redux Thunk instead of local fetch
      await dispatch(updateOrderStatus({ 
        orderId, 
        status: newStatus, 
        trackingNumber: newStatus === "APPROVED" ? trackNum : undefined 
      })).unwrap();

      notifySuccess(`ORDER ${newStatus} SUCCESSFULLY!`);
      
      if (newStatus === "REJECTED") {
        setShowRejectConfirm(false);
      }
    } catch (error: any) {
      notifyError(error || "SOMETHING WENT WRONG DURING THE UPDATE.");
    } finally {
      setLoading(false);
    }
  };

  // --- UI: ACTION LOGGED (APPROVED/REJECTED) ---
  if (status !== "PENDING") {
    return (
      <div className="bg-white p-6 rounded-4xl border border-gray-100 shadow-sm space-y-4 animate-in fade-in slide-in-from-bottom-2">
        <h3 className="text-[10px] font-black text-accent-navy uppercase tracking-widest flex items-center gap-2">
          <Info size={14} className="text-brand-primary" /> Fulfillment Log
        </h3>
        <div className={`p-4 rounded-2xl flex items-center gap-3 border ${
          status === "APPROVED" 
            ? "bg-green-50 text-green-700 border-green-100" 
            : "bg-red-50 text-red-700 border-red-100"
        }`}>
          {status === "APPROVED" ? <PackageCheck size={20} /> : <XCircle size={20} />}
          <span className="text-[10px] font-black uppercase tracking-widest">
            STATUS: {status}
          </span>
        </div>
        {status === "APPROVED" && trackNum && (
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <p className="text-[9px] font-black text-neutral-gray uppercase mb-1">Tracking ID</p>
            <p className="text-xs font-bold text-accent-navy select-all break-all">{trackNum}</p>
          </div>
        )}
      </div>
    );
  }

  // --- UI: ACTIONS AVAILABLE (PENDING) ---
  return (
    <div className="bg-white p-6 rounded-4xl border border-gray-100 shadow-sm space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-[10px] font-black text-accent-navy uppercase tracking-widest">Merchant Actions</h3>
        <div className="w-8 h-1 bg-brand-primary rounded-full" />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-neutral-gray uppercase ml-1">
          Tracking / Courier ID
        </label>
        <input 
          type="text"
          placeholder="e.g. GIGL-7782-X"
          className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl text-xs font-bold text-accent-navy focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all"
          value={trackNum}
          onChange={(e) => setTrackNum(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={() => handleUpdate("APPROVED")}
          disabled={loading}
          className="w-full bg-accent-navy text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-brand-primary hover:text-accent-navy transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md active:scale-[0.98]"
        >
          {loading ? <Loader2 className="animate-spin" size={14} /> : <PackageCheck size={14} />}
          Approve & Notify Customer
        </button>

        {!showRejectConfirm ? (
          <button
            onClick={() => setShowRejectConfirm(true)}
            disabled={loading}
            className="w-full py-4 text-[9px] font-black text-red-400 hover:text-red-600 uppercase tracking-widest hover:bg-red-50 rounded-2xl transition-all"
          >
            Reject Order
          </button>
        ) : (
          <div className="p-4 bg-red-50 rounded-2xl border border-red-100 space-y-3 animate-in zoom-in-95 duration-200">
            <p className="text-[9px] font-black text-red-700 uppercase text-center">Confirm Rejection?</p>
            <div className="flex gap-2">
              <button 
                onClick={() => handleUpdate("REJECTED")}
                className="flex-1 bg-red-600 text-white py-2 rounded-xl text-[9px] font-black uppercase hover:bg-red-700 transition-colors"
              >
                Confirm
              </button>
              <button 
                onClick={() => setShowRejectConfirm(false)}
                className="flex-1 bg-white border border-red-200 text-red-700 py-2 rounded-xl text-[9px] font-black uppercase hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
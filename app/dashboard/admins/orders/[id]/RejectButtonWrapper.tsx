// app/dashboard/admins/orders/[id]/RejectButtonWrapper.tsx
"use client";

import { useState } from "react";
import { rejectRefund } from "@/app/services/adminOrderActions";
import { useNotification } from "@/app/_context/NotificationContext";
import RejectRefundModal from "@/app/_components/admins/RejectRefundModal";

export default function RejectButtonWrapper({ orderId, orderNumber }: { orderId: string, orderNumber: string }) {
  const [modalOpen, setModalOpen] = useState(false);
  const { notifySuccess, notifyError } = useNotification();

  const handleConfirmReject = async (reason: string) => {
    const result = await rejectRefund(orderId, reason);
    if (result.success) {
      notifySuccess(result.message);
      setModalOpen(false);
    } else {
      notifyError(result.message);
    }
  };

  return (
    <>
      <button 
        onClick={() => setModalOpen(true)}
        className="px-6 py-3 bg-white border border-red-100 text-red-600 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-50 transition-all shadow-sm"
      >
        Reject Request
      </button>

      <RejectRefundModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onConfirm={handleConfirmReject}
        orderNumber={orderNumber}
      />
    </>
  );
}
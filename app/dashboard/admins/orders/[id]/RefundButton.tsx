"use client";

import { useState } from "react";
import { useNotification } from "@/app/_context/NotificationContext";

export default function RefundButton({
  orderId,
}: {
  orderId: string;
}) {
  const [isPending, setIsPending] = useState(false);
  const { notifySuccess, notifyError } = useNotification();

  const handleRefund = async () => {
    const confirmAction = confirm(
      "CONFIRM REFUND: This will submit the approved refund to Paystack and process the corresponding financial reversal. Continue?"
    );

    if (!confirmAction) return;

    setIsPending(true);

    try {
      const response = await fetch(
        "/api/admins/refunds/process",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.message ||
            "Failed to process refund."
        );
      }

      notifySuccess(
        data.message ||
          "Refund processed successfully."
      );
    } catch (error) {
      notifyError(
        error instanceof Error
          ? error.message
          : "Failed to process refund."
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button
      onClick={handleRefund}
      disabled={isPending}
      className={`px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-sm
        ${
          isPending
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-red-50 text-red-600 hover:bg-red-600 hover:text-white"
        }`}
    >
      {isPending
        ? "Processing Refund..."
        : "Process Refund"}
    </button>
  );
}
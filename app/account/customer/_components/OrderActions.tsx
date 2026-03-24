// "use client";

// interface OrderActionsProps {
//   order?: {
//     id: string;
//     status: string;
//     refundStatus?: string | null;
//   };
//   onCancelClick: () => void;
//   onRefundClick: () => void;
//   isActionLoading: boolean;
// }

// export default function OrderActions({ 
//   order, 
//   onCancelClick, 
//   onRefundClick, 
//   isActionLoading 
// }: OrderActionsProps) {
//   // SAFETY GUARD: Fixes "Cannot read properties of undefined"
//   if (!order || !order.status) {
//     return null;
//   }

//   const status = order.status.toLowerCase();
//   const hasRefundStarted = order.refundStatus && order.refundStatus !== "none";

//   return (
//     <div className="mt-4 flex flex-col gap-3">
//       {/* CANCEL BUTTON: Visible only during early fulfillment stages */}
//       {(status === "pending" || status === "processing") && (
//         <button
//           onClick={onCancelClick}
//           disabled={isActionLoading}
//           className="w-full border-2 border-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all uppercase text-xs tracking-widest disabled:opacity-50"
//         >
//           {isActionLoading ? "Processing..." : "Cancel Order"}
//         </button>
//       )}

//       {/* REFUND BUTTON: Visible only after successful delivery */}
//       {status === "delivered" && !hasRefundStarted && (
//         <button
//           onClick={onRefundClick}
//           disabled={isActionLoading}
//           className="w-full bg-red-600 text-white font-black py-4 rounded-xl hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all uppercase text-xs tracking-widest disabled:opacity-50"
//         >
//           {isActionLoading ? "Processing..." : "Request Refund"}
//         </button>
//       )}

//       {/* NEW: CANCELLED STATUS FEEDBACK */}
//       {status === "cancelled" && (
//         <div className="p-4 bg-gray-100 rounded-xl border border-red-500/20 text-center">
//           <p className="text-[10px] font-black uppercase text-red-600 tracking-widest mb-1">
//             Order Cancelled
//           </p>
//           <p className="text-[11px] font-bold text-red-700/80 leading-tight">
//             The mission was aborted. Your refund is being processed automatically.
//           </p>
//         </div>
//       )}

//       {/* STATUS FEEDBACK: Shows progress if a refund is already active */}
//       {hasRefundStarted && (
//         <div className="p-4 bg-neutral-100 rounded-xl border border-neutral-200 text-center">
//           <p className="text-[10px] font-bold uppercase text-neutral-500 tracking-widest">
//             Refund Status: <span className="text-accent-navy">{order.refundStatus}</span>
//           </p>
//         </div>
//       )}
//     </div>
//   );
// }




"use client";

interface OrderActionsProps {
  order?: {
    id: string;
    status: string;
    refundStatus?: string | null;
  };
  onCancelClick: () => void;
  onRefundClick: () => void;
  isActionLoading: boolean;
}

export default function OrderActions({
  order,
  onCancelClick,
  onRefundClick,
  isActionLoading,
}: OrderActionsProps) {
  if (!order || !order.status) return null;

  const status = order.status.toLowerCase();
  const refundStatus = (order.refundStatus || "none").toLowerCase();
  const hasRefundStarted = refundStatus !== "none";

  return (
    <div className="mt-4 flex flex-col gap-3">
      {(status === "pending" || status === "processing") && (
        <button
          onClick={onCancelClick}
          disabled={isActionLoading}
          className="w-full border-2 border-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all uppercase text-xs tracking-widest disabled:opacity-50"
        >
          {isActionLoading ? "Processing..." : "Cancel Order"}
        </button>
      )}

      {status === "delivered" && !hasRefundStarted && (
        <button
          onClick={onRefundClick}
          disabled={isActionLoading}
          className="w-full bg-red-600 text-white font-black py-4 rounded-xl hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all uppercase text-xs tracking-widest disabled:opacity-50"
        >
          {isActionLoading ? "Processing..." : "Request Refund"}
        </button>
      )}

      {status === "cancelled" && (
        <div className="p-4 bg-gray-100 rounded-xl border border-red-500/20 text-center">
          <p className="text-[10px] font-black uppercase text-red-600 tracking-widest mb-1">
            Order Cancelled
          </p>

          {refundStatus === "requested" || refundStatus === "pending_review" ? (
            <p className="text-[11px] font-bold text-red-700/80 leading-tight">
              Your cancellation has been recorded. Refund eligibility is under admin review.
            </p>
          ) : refundStatus === "approved" || refundStatus === "processing" ? (
            <p className="text-[11px] font-bold text-red-700/80 leading-tight">
              Your refund has been approved and is being processed.
            </p>
          ) : refundStatus === "rejected" ? (
            <p className="text-[11px] font-bold text-red-700/80 leading-tight">
              Your refund request was reviewed and declined.
            </p>
          ) : (
            <p className="text-[11px] font-bold text-red-700/80 leading-tight">
              This cancelled order is awaiting refund review.
            </p>
          )}
        </div>
      )}

      {hasRefundStarted && (
        <div className="p-4 bg-neutral-100 rounded-xl border border-neutral-200 text-center">
          <p className="text-[10px] font-bold uppercase text-neutral-500 tracking-widest">
            Refund Status: <span className="text-accent-navy">{order.refundStatus}</span>
          </p>
        </div>
      )}
    </div>
  );
}
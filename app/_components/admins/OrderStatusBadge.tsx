// "use client";

// import { useDispatch } from "react-redux";
// import { updateOrderStatus } from "@/store/orderSlice";
// import { CheckCircle2, Package, Truck, Clock, AlertCircle } from "lucide-react";

// const STATUS_CONFIG = {
//   pending: { color: "text-amber-500", bg: "bg-amber-50", icon: <Clock size={14} />, label: "Pending" },
//   processing: { color: "text-blue-500", bg: "bg-blue-50", icon: <Package size={14} />, label: "Processing" },
//   shipped: { color: "text-indigo-500", bg: "bg-indigo-50", icon: <Truck size={14} />, label: "Shipped" },
//   delivered: { color: "text-emerald-500", bg: "bg-emerald-50", icon: <CheckCircle2 size={14} />, label: "Delivered" },
//   cancelled: { color: "text-rose-500", bg: "bg-rose-50", icon: <AlertCircle size={14} />, label: "Cancelled" },
// };

// export default function OrderStatusBadge({ orderId, currentStatus }: { orderId: string, currentStatus: keyof typeof STATUS_CONFIG }) {
//   const dispatch = useDispatch();
//   const config = STATUS_CONFIG[currentStatus];

//   const handleStatusChange = async (newStatus: string) => {
//     // 1. Optimistic Update in Redux
//     dispatch(updateOrderStatus({ id: orderId, status: newStatus as any }));

//     // 2. Sync with Database
//     try {
//       await fetch(`/api/admins/orders/${orderId}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ status: newStatus }),
//       });
//     } catch (error) {
//       console.error("Failed to sync status to server");
//       // Fallback logic here if needed
//     }
//   };

//   return (
//     <div className="group relative inline-block">
//       <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border border-current/10 ${config.bg} ${config.color} transition-all cursor-pointer`}>
//         {config.icon}
//         <span className="text-[10px] font-black uppercase tracking-tighter">{config.label}</span>
//       </div>

//       {/* Hover Dropdown Menu */}
//       <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-2xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-2">
//         {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
//           <button
//             key={key}
//             onClick={() => handleStatusChange(key)}
//             className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition-colors text-left"
//           >
//             <span className={`${cfg.color}`}>{cfg.icon}</span>
//             <span className="text-[10px] font-bold text-gray-600 uppercase">{cfg.label}</span>
//           </button>
//         ))}
//       </div>
//     </div>
//   );
// }





"use client";

import { useDispatch } from "react-redux";
import { updateOrderStatus } from "@/store/orderSlice";
import { CheckCircle2, Package, Truck, Clock, AlertCircle } from "lucide-react";

const STATUS_CONFIG = {
  pending: { color: "text-amber-500", bg: "bg-amber-50", icon: <Clock size={14} />, label: "Pending" },
  processing: { color: "text-blue-500", bg: "bg-blue-50", icon: <Package size={14} />, label: "Processing" },
  shipped: { color: "text-indigo-500", bg: "bg-indigo-50", icon: <Truck size={14} />, label: "Shipped" },
  delivered: { color: "text-emerald-500", bg: "bg-emerald-50", icon: <CheckCircle2 size={14} />, label: "Delivered" },
  cancelled: { color: "text-rose-500", bg: "bg-rose-50", icon: <AlertCircle size={14} />, label: "Cancelled" },
};

export default function OrderStatusBadge({ orderId, currentStatus }: { orderId: string, currentStatus: string }) {
  const dispatch = useDispatch();
  
  // Normalize and provide fallback to prevent "config is undefined" error
  const statusKey = (currentStatus?.toLowerCase() || "pending") as keyof typeof STATUS_CONFIG;
  const config = STATUS_CONFIG[statusKey] || STATUS_CONFIG.pending;

  const handleStatusChange = async (newStatus: string) => {
    // 1. Optimistic Update in Redux
    dispatch(updateOrderStatus({ id: orderId, status: newStatus as any }));

    // 2. Sync with Database
    try {
      await fetch(`/api/admins/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (error) {
      console.error("Failed to sync status to server");
      // Fallback logic here if needed
    }
  };

  return (
    <div className="group relative inline-block">
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border border-current/10 ${config.bg} ${config.color} transition-all cursor-pointer`}>
        {config.icon}
        <span className="text-[10px] font-black uppercase tracking-tighter">{config.label}</span>
      </div>

      {/* Hover Dropdown Menu */}
      <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-2xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-2">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => handleStatusChange(key)}
            className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition-colors text-left"
          >
            <span className={`${cfg.color}`}>{cfg.icon}</span>
            <span className="text-[10px] font-bold text-gray-600 uppercase">{cfg.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
// "use client";

// import { useState } from "react";
// import { Check, Loader2, Package, Truck, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

// const STATUS_OPTIONS = [
//   { id: "PENDING", label: "Pending", color: "bg-gray-200 text-gray-700 ring-gray-400", icon: Package },
//   { id: "PROCESSING", label: "Process", color: "bg-blue-600 text-white ring-blue-300", icon: Check },
//   { id: "SHIPPED", label: "Ship", color: "bg-[#F7931E] text-white ring-orange-300", icon: Truck },
//   { id: "DELIVERED", label: "Deliver", color: "bg-green-600 text-white ring-green-300", icon: CheckCircle },
//   { id: "CANCELLED", label: "Cancel", color: "bg-red-600 text-white ring-red-300", icon: XCircle },
// ];

// interface StatusManagerProps {
//   order: { id: string; status: string; orderNumber: string };
//   onUpdate: (newStatus: string) => void;
// }

// export default function OrderStatusManager({ order, onUpdate }: StatusManagerProps) {
//   const [loadingStatus, setLoadingStatus] = useState<string | null>(null);
//   const [showCancelModal, setShowCancelModal] = useState(false);

//   const updateStatus = async (newStatus: string) => {
//     if (newStatus === order.status) return;
    
//     if (newStatus === "CANCELLED" && !showCancelModal) {
//       setShowCancelModal(true);
//       return;
//     }

//     setLoadingStatus(newStatus);
//     try {
//       const res = await fetch(`/api/admins/orders/${order.id}/status`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ status: newStatus }),
//       });

//       if (res.ok) {
//         // This triggers the parent state update, changing order.status
//         onUpdate(newStatus);
//         setShowCancelModal(false);
//       }
//     } catch (error) {
//       console.error("Update failed", error);
//     } finally {
//       setLoadingStatus(null);
//     }
//   };


//  return (
// <>
//   {/* Flex container: items-center ensures icons and text stay aligned vertically */}
//   <div className="flex flex-row flex-wrap items-center gap-2 min-w-[320px]">
//     {STATUS_OPTIONS.map((option) => {
//       const Icon = option.icon;
//       const isActive = order.status === option.id;
//       const isLoading = loadingStatus === option.id;

//       return (
//         <button
//           key={option.id}
//           onClick={() => updateStatus(option.id)}
//           disabled={!!loadingStatus || isActive}
//           className={`
//             /* FLEX: Ensure each button stays compact */
//             flex items-center justify-center gap-2 px-3 py-2 rounded-xl 
//             text-[9px] font-black uppercase tracking-tighter transition-all duration-300
            
//             ${isActive 
//               ? `${option.color} ring-2 ring-offset-1 ring-current shadow-md scale-105 z-10` 
//               : "bg-white border border-gray-100 text-gray-400 hover:border-[#002B5B] hover:text-[#002B5B] opacity-80"
//             }
//             ${isLoading ? "cursor-wait" : "cursor-pointer"}
//             disabled:cursor-default
//           `}
//         >
//           {isLoading ? (
//             <Loader2 className="animate-spin" size={12} />
//           ) : (
//             <Icon size={12} />
//           )}
//           <span className="whitespace-nowrap">{option.label}</span>
//         </button>
//       );
//     })}
//   </div>

//   {/* --- CANCELLATION MODAL --- */}
//   {showCancelModal && (
//     <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-primary/60 backdrop-blur-md p-4">
//       <div className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-red-100 animate-in fade-in zoom-in duration-300">
//         <div className="flex flex-col items-center text-center">
//           <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-600 mb-6 border-4 border-white shadow-inner">
//             <AlertTriangle size={40} />
//           </div>
//           <h3 className="text-2xl font-black text-[#002B5B] uppercase tracking-tighter italic">Cancel Order?</h3>
//           <p className="text-gray-500 text-sm mt-3 font-medium leading-relaxed">
//             Warning: Cancelling order <span className="text-red-600 font-black">#{order.orderNumber}</span> will stop fulfillment and notify the customer.
//           </p>
//         </div>

//         <div className="flex flex-col gap-3 mt-10">
//           <button
//             onClick={() => updateStatus("CANCELLED")}
//             disabled={!!loadingStatus}
//             className="w-full px-6 py-4 rounded-2xl bg-red-600 text-white font-black uppercase text-xs tracking-[0.2em] hover:bg-red-700 transition-all shadow-xl shadow-red-200 flex items-center justify-center gap-3 active:scale-95"
//           >
//             {loadingStatus === "CANCELLED" ? <Loader2 className="animate-spin" size={16} /> : <XCircle size={16} />}
//             Yes, Cancel Order
//           </button>
//           <button
//             onClick={() => setShowCancelModal(false)}
//             className="w-full px-6 py-4 rounded-2xl bg-gray-50 text-gray-400 font-black uppercase text-[10px] tracking-widest hover:text-gray-600 transition-all"
//           >
//             Nevermind, Go Back
//           </button>
//         </div>
//       </div>
//     </div>
//   )}
// </>
// );
// }



"use client";

import { useState } from "react";
import { Check, Loader2, Package, Truck, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

const STATUS_OPTIONS = [
  { id: "PENDING", label: "Pending", color: "bg-gray-200 text-gray-700 ring-gray-400", icon: Package },
  { id: "PROCESSING", label: "Process", color: "bg-blue-600 text-white ring-blue-300", icon: Check },
  { id: "SHIPPED", label: "Ship", color: "bg-[#F7931E] text-white ring-orange-300", icon: Truck },
  { id: "DELIVERED", label: "Deliver", color: "bg-green-600 text-white ring-green-300", icon: CheckCircle },
  { id: "CANCELLED", label: "Cancel", color: "bg-red-600 text-white ring-red-300", icon: XCircle },
];

interface StatusManagerProps {
  order: { id: string; status: string; orderNumber: string };
  onUpdate: (newStatus: string) => void;
}

export default function StatusToggle({ order, onUpdate }: StatusManagerProps) {
  const [loadingStatus, setLoadingStatus] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const updateStatus = async (newStatus: string) => {
    if (newStatus === order.status) return;
    
    // Intercept for Cancellation
    if (newStatus === "CANCELLED" && !showCancelModal) {
      setShowCancelModal(true);
      return;
    }

    setLoadingStatus(newStatus);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        onUpdate(newStatus); // This triggers the parent state update
        setShowCancelModal(false);
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.error || "Failed to update"}`);
      }
    } catch (error) {
      console.error("Update failed", error);
      alert("Network error. Please try again.");
    } finally {
      setLoadingStatus(null);
    }
  };

  return (
    <>
      <div className="flex flex-row flex-wrap items-center gap-2 min-w-[320px]">
        {STATUS_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isActive = order.status === option.id;
          const isLoading = loadingStatus === option.id;

          return (
            <button
              key={option.id}
              onClick={() => updateStatus(option.id)}
              disabled={!!loadingStatus || isActive}
              className={`
                flex items-center justify-center gap-2 px-3 py-2 rounded-xl 
                text-[9px] font-black uppercase tracking-tighter transition-all duration-300
                ${isActive 
                  ? `${option.color} ring-2 ring-offset-1 ring-current shadow-md scale-105 z-10` 
                  : "bg-white border border-gray-100 text-gray-400 hover:border-[#002B5B] hover:text-[#002B5B] opacity-80"
                }
                ${isLoading ? "cursor-wait" : "cursor-pointer"}
                disabled:cursor-default
              `}
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={12} />
              ) : (
                <Icon size={12} />
              )}
              <span className="whitespace-nowrap">{option.label}</span>
            </button>
          );
        })}
      </div>

      {/* Cancellation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#002B5B]/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-600 mb-6 border-4 border-white shadow-inner">
                <AlertTriangle size={40} />
              </div>
              <h3 className="text-2xl font-black text-[#002B5B] uppercase tracking-tighter italic">Cancel Order?</h3>
              <p className="text-gray-500 text-sm mt-3 font-medium leading-relaxed">
                Are you sure you want to cancel order <span className="text-red-600 font-black">#{order.orderNumber}</span>?
              </p>
            </div>
            <div className="flex flex-col gap-3 mt-10">
              <button
                onClick={() => updateStatus("CANCELLED")}
                disabled={!!loadingStatus}
                className="w-full px-6 py-4 rounded-2xl bg-red-600 text-white font-black uppercase text-xs tracking-[0.2em] hover:bg-red-700 transition-all flex items-center justify-center gap-3"
              >
                {loadingStatus === "CANCELLED" ? <Loader2 className="animate-spin" size={16} /> : <XCircle size={16} />}
                Confirm Cancellation
              </button>
              <button
                onClick={() => setShowCancelModal(false)}
                className="w-full px-6 py-4 rounded-2xl bg-gray-50 text-gray-400 font-black uppercase text-[10px] tracking-widest hover:text-gray-600 transition-all"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
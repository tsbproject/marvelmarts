// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { useNotification } from "@/app/_context/NotificationContext";
// import {
//   ArrowLeft,
//   Printer,
//   MapPin,
//   Phone,
//   Mail,
//   RotateCcw,
//   ShieldAlert,
//   AlertCircle,
// } from "lucide-react";
// import { useSession } from "next-auth/react";
// import { UserRole } from "@prisma/client";
// import AdminRefundModal from "@/app/_components/admins/AdminRefundModal";
// import RefundButton from "./RefundButton";
// import RejectButtonWrapper from "./RejectButtonWrapper";

// export default function OrderDetailView({ order }: { order: any }) {
//   const router = useRouter();
//   const { data: session } = useSession();
//   const { notifySuccess, notifyError } = useNotification();
//   const [updating, setUpdating] = useState(false);
//   const [refunding, setRefunding] = useState(false);

//   const [decisionModal, setDecisionModal] = useState<{
//     open: boolean;
//     action: "approved" | "rejected" | null;
//   }>({
//     open: false,
//     action: null,
//   });

//   const isRefunded =
//     order.status === "refunded" || order.refundStatus === "approved";
//   const isRefundRequested =
//     order.refundStatus === "pending" || order.refundStatus === "requested";

//      const normalizedRefundStatus = String(order.refundStatus || "").toLowerCase();

//   normalizedRefundStatus === "pending" ||
//   normalizedRefundStatus === "requested";

//   const isAdmin =
//     session?.user?.role === UserRole.ADMIN ||
//     session?.user?.role === UserRole.SUPER_ADMIN;

//   const canRefund = order.paymentStatus === true && !isRefunded && isAdmin;

//   const updateStatus = async (newStatus: string) => {
//     setUpdating(true);
//     try {
//       const res = await fetch(`/api/admins/orders/${order.id}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ status: newStatus }),
//       });

//       if (res.ok) {
//         notifySuccess(
//           `Mission Updated: Order is now ${newStatus.toUpperCase()}`
//         );
//         router.refresh();
//       }
//     } catch {
//       notifyError("Failed to update order status.");
//     } finally {
//       setUpdating(false);
//     }
//   };

//   const handleDecisionConfirm = async (reason: string) => {
//     const action = decisionModal.action;
//     if (!action) return;

//     setDecisionModal({ open: false, action: null });
//     setRefunding(true);

//     try {
//       const res = await fetch(`/api/admins/refunds`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           orderId: order.id,
//           action,
//           adminNote: reason,
//         }),
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || "Action failed");

//       notifySuccess(`Refund ${action.toUpperCase()} successfully.`);
//       router.refresh();
//     } catch (err: any) {
//       notifyError(err.message || "Critical failure during refund sequence.");
//     } finally {
//       setRefunding(false);
//     }
//   };

 
//   console.log("refundStatus:", order.refundStatus);

//   return (
//     <div className="max-w-[1600px] mx-auto pb-20 px-4 lg:px-0">
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
//           <button
//             onClick={() => router.back()}
//             className="flex items-center gap-2 text-gray-400 font-bold uppercase text-[10px] tracking-widest hover:text-gray-900 transition-colors"
//           >
//             <ArrowLeft size={14} /> Back to Command Center
//           </button>

//           <div className="flex gap-2 w-full md:w-auto">
//             {!isRefundRequested && canRefund && (
//               <button
//                 disabled={refunding}
//                 onClick={() => setDecisionModal({ open: true, action: "approved" })}
//                 className="flex-1 md:flex-none px-6 py-3 bg-red-50 text-red-600 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-red-600 hover:text-white transition-all shadow-sm border border-red-100 active:scale-95 disabled:opacity-50"
//               >
//                 <RotateCcw size={14} /> {refunding ? "Processing..." : "Initiate Refund"}
//               </button>
//             )}

//             <button
//               onClick={() => window.print()}
//               className="flex-1 md:flex-none px-6 py-3 bg-white border border-gray-200 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-gray-50 transition-all shadow-sm"
//             >
//               <Printer size={14} /> Print Invoice
//             </button>
//           </div>
//         </div>

//         {isRefundRequested && (
//           <div className="bg-orange-50 border border-orange-100 p-6 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-4 animate-pulse-subtle mb-8">
//             <div className="flex items-center gap-4">
//               <div className="p-3 bg-white rounded-2xl text-orange-600 shadow-sm">
//                 <AlertCircle size={24} />
//               </div>
//               <div>
//                 <p className="text-xs font-black text-orange-800 uppercase tracking-widest">
//                   Refund Request Pending
//                 </p>
//                 <p className="text-[10px] font-bold text-orange-600 uppercase tracking-tighter">
//                   Action required to resolve this financial record
//                 </p>
//               </div>
//             </div>

//             <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
//               <RefundButton orderId={order.id} />
//               <RejectButtonWrapper
//                 orderId={order.id}
//                 orderNumber={order.orderNumber}
//               />
//             </div>
//           </div>
//         )}


//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//         <div className="lg:col-span-2 space-y-6">
//           {isRefunded && (
//             <div className="bg-red-600 text-white rounded-[2rem] p-6 flex items-center gap-4 shadow-xl shadow-red-100">
//               <ShieldAlert size={32} />
//               <div>
//                 <p className="font-black uppercase italic tracking-wider">
//                   Asset Deauthorized
//                 </p>
//                 <p className="text-sm font-bold opacity-90">
//                   Reason:{" "}
//                   {order.cancelReason ||
//                     order.refundReason ||
//                     "Administrative Reversal"}
//                 </p>
//               </div>
//             </div>
//           )}

//           <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
//             <div className="flex justify-between items-center mb-8">
//               <h2 className="text-2xl font-black italic uppercase tracking-tighter">
//                 Items <span className="text-blue-600">Ordered</span>
//               </h2>
//               <span className="bg-blue-50 text-blue-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
//                 {order.items.length} Products
//               </span>
//             </div>

//             <div className="divide-y divide-gray-50">
//               {order.items.map((item: any) => (
//                 <div key={item.id} className="py-4 flex items-center gap-4">
//                   <div className="w-16 h-16 bg-gray-100 rounded-2xl overflow-hidden border border-gray-50 flex-shrink-0">
//                     {item.imageUrl && (
//                       <img
//                         src={item.imageUrl}
//                         alt={item.title}
//                         className="w-full h-full object-cover"
//                       />
//                     )}
//                   </div>
//                   <div className="flex-1">
//                     <p className="font-black text-gray-900 uppercase text-xs tracking-tight">
//                       {item.title}
//                     </p>
//                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
//                       Qty: {item.qty} × ₦
//                       {Number(item.unitPrice).toLocaleString()}
//                     </p>
//                   </div>
//                   <p className="font-black text-gray-900 italic">
//                     ₦{(item.qty * Number(item.unitPrice)).toLocaleString()}
//                   </p>
//                 </div>
//               ))}
//             </div>

//             <div className="mt-8 pt-8 border-t border-dashed border-gray-100 space-y-3">
//               <div className="flex justify-between text-gray-400 font-bold uppercase text-[10px] tracking-widest">
//                 <span>Subtotal</span>
//                 <span className="text-gray-900 font-black">
//                   ₦{Number(order.subtotal).toLocaleString()}
//                 </span>
//               </div>
//               <div className="flex justify-between text-gray-400 font-bold uppercase text-[10px] tracking-widest">
//                 <span>Shipping</span>
//                 <span className="text-gray-900 font-black">
//                   ₦{Number(order.shipping).toLocaleString()}
//                 </span>
//               </div>
//               <div className="flex justify-between pt-4">
//                 <span className="text-xl font-black italic uppercase tracking-tighter">
//                   Total
//                 </span>
//                 <span
//                   className={`text-2xl font-black italic ${
//                     isRefunded ? "text-gray-400 line-through" : "text-blue-600"
//                   }`}
//                 >
//                   ₦{Number(order.total).toLocaleString()}
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="space-y-6">
//           <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-gray-200">
//             <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-6">
//               Management Status
//             </h3>
//             <div className="grid grid-cols-1 gap-3">
//               {[
//                 "pending",
//                 "processing",
//                 "shipped",
//                 "delivered",
//                 "cancelled",
//                 "refunded",
//               ].map((status) => (
//                 <button
//                   key={status}
//                   disabled={
//                     updating ||
//                     order.status === status ||
//                     (status === "refunded" && !isAdmin)
//                   }
//                   onClick={() => updateStatus(status)}
//                   className={`w-full py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${
//                     order.status === status
//                       ? "bg-blue-600 text-white border-2 border-blue-400 shadow-lg shadow-blue-500/20"
//                       : "bg-white/5 text-gray-400 hover:bg-white/10"
//                   }`}
//                 >
//                   {status}
//                 </button>
//               ))}
//             </div>
//           </div>

//           <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
//             <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-6 flex items-center gap-2">
//               <MapPin size={12} /> Shipping Logistics
//             </h3>
//             <div className="space-y-4">
//               <div>
//                 <p className="font-black text-gray-900 uppercase text-xs mb-1">
//                   {order.firstName} {order.lastName}
//                 </p>
//                 <p className="text-[10px] font-bold text-gray-500 leading-relaxed uppercase">
//                   {order.streetAddress}, {order.city}
//                   <br />
//                   {order.state} State, Nigeria
//                 </p>
//               </div>
//               <div className="pt-4 space-y-3 border-t border-gray-50">
//                 <div className="flex items-center gap-2 text-[10px] font-bold text-gray-900 uppercase">
//                   <div className="bg-gray-100 p-1.5 rounded-lg">
//                     <Phone size={10} />
//                   </div>
//                   {order.phone}
//                 </div>
//                 <div className="flex items-center gap-2 text-[10px] font-bold text-gray-900 lowercase truncate">
//                   <div className="bg-gray-100 p-1.5 rounded-lg">
//                     <Mail size={10} />
//                   </div>
//                   {order.email}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <AdminRefundModal
//         isOpen={decisionModal.open}
//         action={decisionModal.action}
//         onClose={() => setDecisionModal({ open: false, action: null })}
//         onConfirm={handleDecisionConfirm}
//       />
//     </div>
//   );
// }




"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useNotification } from "@/app/_context/NotificationContext";
import {
  ArrowLeft,
  Printer,
  MapPin,
  Phone,
  Mail,
  RotateCcw,
  ShieldAlert,
  AlertCircle,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { UserRole } from "@prisma/client";
import AdminRefundModal from "@/app/_components/admins/AdminRefundModal";
import RefundButton from "./RefundButton";
import RejectButtonWrapper from "./RejectButtonWrapper";

export default function OrderDetailView({ order }: { order: any }) {
  const router = useRouter();
  const { data: session } = useSession();
  const { notifySuccess, notifyError } = useNotification();
  const [updating, setUpdating] = useState(false);
  const [refunding, setRefunding] = useState(false);

  const [decisionModal, setDecisionModal] = useState<{
    open: boolean;
    action: "approved" | "rejected" | null;
  }>({
    open: false,
    action: null,
  });

  const normalizedRefundStatus = String(order.refundStatus || "").toLowerCase();

  const isRefunded =
    order.status === "refunded" || normalizedRefundStatus === "approved";

  const isRefundRequested =
    normalizedRefundStatus === "pending" ||
    normalizedRefundStatus === "requested";

  const isAdmin =
    session?.user?.role === UserRole.ADMIN ||
    session?.user?.role === UserRole.SUPER_ADMIN;

  const canRefund = order.paymentStatus === true && !isRefunded && isAdmin;

  const updateStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admins/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        notifySuccess(
          `Mission Updated: Order is now ${newStatus.toUpperCase()}`
        );
        router.refresh();
      }
    } catch {
      notifyError("Failed to update order status.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDecisionConfirm = async (reason: string) => {
    const action = decisionModal.action;
    if (!action) return;

    setDecisionModal({ open: false, action: null });
    setRefunding(true);

    try {
      const res = await fetch(`/api/admins/refunds`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          action,
          adminNote: reason,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed");

      notifySuccess(`Refund ${action.toUpperCase()} successfully.`);
      router.refresh();
    } catch (err: any) {
      notifyError(err.message || "Critical failure during refund sequence.");
    } finally {
      setRefunding(false);
    }
  };

  console.log("refundStatus:", order.refundStatus);

  return (
    <div className="max-w-[1600px] mx-auto pb-20 px-4 lg:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 font-bold uppercase text-[10px] tracking-widest hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Command Center
        </button>

        <div className="flex gap-2 w-full md:w-auto">
          {!isRefundRequested && canRefund && (
            <button
              disabled={refunding}
              onClick={() => setDecisionModal({ open: true, action: "approved" })}
              className="flex-1 md:flex-none px-6 py-3 bg-red-50 text-red-600 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-red-600 hover:text-white transition-all shadow-sm border border-red-100 active:scale-95 disabled:opacity-50"
            >
              <RotateCcw size={14} /> {refunding ? "Processing..." : "Initiate Refund"}
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="flex-1 md:flex-none px-6 py-3 bg-white border border-gray-200 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-gray-50 transition-all shadow-sm"
          >
            <Printer size={14} /> Print Invoice
          </button>
        </div>
      </div>

      {isRefundRequested && (
        <div className="bg-orange-50 border border-orange-100 p-6 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-4 animate-pulse-subtle mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-2xl text-orange-600 shadow-sm">
              <AlertCircle size={24} />
            </div>
            <div>
              <p className="text-xs font-black text-orange-800 uppercase tracking-widest">
                Refund Request Pending
              </p>
              <p className="text-[10px] font-bold text-orange-600 uppercase tracking-tighter">
                Action required to resolve this financial record
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <RefundButton orderId={order.id} />
            <RejectButtonWrapper
              orderId={order.id}
              orderNumber={order.orderNumber}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {isRefunded && (
            <div className="bg-red-600 text-white rounded-[2rem] p-6 flex items-center gap-4 shadow-xl shadow-red-100">
              <ShieldAlert size={32} />
              <div>
                <p className="font-black uppercase italic tracking-wider">
                  Asset Deauthorized
                </p>
                <p className="text-sm font-bold opacity-90">
                  Reason:{" "}
                  {order.cancelReason ||
                    order.refundReason ||
                    "Administrative Reversal"}
                </p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter">
                Items <span className="text-blue-600">Ordered</span>
              </h2>
              <span className="bg-blue-50 text-blue-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                {order.items.length} Products
              </span>
            </div>

            <div className="divide-y divide-gray-50">
              {order.items.map((item: any) => (
                <div key={item.id} className="py-4 flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl overflow-hidden border border-gray-50 flex-shrink-0">
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-gray-900 uppercase text-xs tracking-tight">
                      {item.title}
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Qty: {item.qty} × ₦
                      {Number(item.unitPrice).toLocaleString()}
                    </p>
                  </div>
                  <p className="font-black text-gray-900 italic">
                    ₦{(item.qty * Number(item.unitPrice)).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-dashed border-gray-100 space-y-3">
              <div className="flex justify-between text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                <span>Subtotal</span>
                <span className="text-gray-900 font-black">
                  ₦{Number(order.subtotal).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                <span>Shipping</span>
                <span className="text-gray-900 font-black">
                  ₦{Number(order.shipping).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between pt-4">
                <span className="text-xl font-black italic uppercase tracking-tighter">
                  Total
                </span>
                <span
                  className={`text-2xl font-black italic ${
                    isRefunded ? "text-gray-400 line-through" : "text-blue-600"
                  }`}
                >
                  ₦{Number(order.total).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-gray-200">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-6">
              Management Status
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {[
                "pending",
                "processing",
                "shipped",
                "delivered",
                "cancelled",
                "refunded",
              ].map((status) => (
                <button
                  key={status}
                  disabled={
                    updating ||
                    order.status === status ||
                    (status === "refunded" && !isAdmin)
                  }
                  onClick={() => updateStatus(status)}
                  className={`w-full py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${
                    order.status === status
                      ? "bg-blue-600 text-white border-2 border-blue-400 shadow-lg shadow-blue-500/20"
                      : "bg-white/5 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-6 flex items-center gap-2">
              <MapPin size={12} /> Shipping Logistics
            </h3>
            <div className="space-y-4">
              <div>
                <p className="font-black text-gray-900 uppercase text-xs mb-1">
                  {order.firstName} {order.lastName}
                </p>
                <p className="text-[10px] font-bold text-gray-500 leading-relaxed uppercase">
                  {order.streetAddress}, {order.city}
                  <br />
                  {order.state} State, Nigeria
                </p>
              </div>
              <div className="pt-4 space-y-3 border-t border-gray-50">
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-900 uppercase">
                  <div className="bg-gray-100 p-1.5 rounded-lg">
                    <Phone size={10} />
                  </div>
                  {order.phone}
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-900 lowercase truncate">
                  <div className="bg-gray-100 p-1.5 rounded-lg">
                    <Mail size={10} />
                  </div>
                  {order.email}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AdminRefundModal
        isOpen={decisionModal.open}
        action={decisionModal.action}
        onClose={() => setDecisionModal({ open: false, action: null })}
        onConfirm={handleDecisionConfirm}
      />
    </div>
  );
}
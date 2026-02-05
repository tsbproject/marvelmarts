// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { useNotification } from "@/app/_context/NotificationContext";
// import { ArrowLeft, Package, Truck, CheckCircle, XCircle, MapPin, Phone, Mail, CreditCard, Printer } from "lucide-react";
// import { motion } from "framer-motion";

// export default function OrderDetailView({ order }: { order: any }) {
//   const router = useRouter();
//   const { notifySuccess, notifyError } = useNotification();
//   const [updating, setUpdating] = useState(false);

//   const updateStatus = async (newStatus: string) => {
//     setUpdating(true);
//     try {
//       const res = await fetch(`/api/admins/orders/${order.id}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ status: newStatus }),
//       });

//       if (res.ok) {
//         notifySuccess(`Mission Updated: Order is now ${newStatus.toUpperCase()}`);
//         router.refresh();
//       }
//     } catch (err) {
//       notifyError("Failed to update order status.");
//     } finally {
//       setUpdating(false);
//     }
//   };

//   return (
//     <div className="max-w-5xl mx-auto">
//       {/* Header Actions */}
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
//         <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 font-bold uppercase text-[10px] tracking-widest hover:text-gray-900 transition-colors">
//           <ArrowLeft size={14} /> Back to Command Center
//         </button>
//         <div className="flex gap-2 w-full md:w-auto">
//           <button onClick={() => window.print()} className="flex-1 md:flex-none px-6 py-3 bg-white border border-gray-200 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-gray-50">
//             <Printer size={14} /> Print Invoice
//           </button>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//         {/* Left Column: Order Items & Summary */}
//         <div className="lg:col-span-2 space-y-6">
//           <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
//             <div className="flex justify-between items-center mb-8">
//               <h2 className="text-2xl font-black italic uppercase tracking-tighter">Items <span className="text-blue-600">Ordered</span></h2>
//               <span className="bg-blue-50 text-blue-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
//                 {order.items.length} Products
//               </span>
//             </div>

//             <div className="divide-y divide-gray-50">
//               {order.items.map((item: any) => (
//                 <div key={item.id} className="py-4 flex items-center gap-4">
//                   <div className="w-16 h-16 bg-gray-100 rounded-2xl overflow-hidden border border-gray-50 flex-shrink-0">
//                     {item.imageUrl && <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />}
//                   </div>
//                   <div className="flex-1">
//                     <p className="font-black text-gray-900 uppercase text-xs tracking-tight">{item.title}</p>
//                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Qty: {item.qty} × ₦{Number(item.unitPrice).toLocaleString()}</p>
//                   </div>
//                   <p className="font-black text-gray-900 italic">₦{(item.qty * Number(item.unitPrice)).toLocaleString()}</p>
//                 </div>
//               ))}
//             </div>

//             <div className="mt-8 pt-8 border-t border-dashed border-gray-100 space-y-3">
//               <div className="flex justify-between text-gray-400 font-bold uppercase text-[10px] tracking-widest">
//                 <span>Subtotal</span>
//                 <span className="text-gray-900 font-black">₦{Number(order.subtotal).toLocaleString()}</span>
//               </div>
//               <div className="flex justify-between text-gray-400 font-bold uppercase text-[10px] tracking-widest">
//                 <span>Shipping</span>
//                 <span className="text-gray-900 font-black">₦{Number(order.shipping).toLocaleString()}</span>
//               </div>
//               <div className="flex justify-between pt-4">
//                 <span className="text-xl font-black italic uppercase tracking-tighter">Total</span>
//                 <span className="text-2xl font-black italic text-blue-600">₦{Number(order.total).toLocaleString()}</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Right Column: Customer & Logistics */}
//         <div className="space-y-6">
//           {/* Status Control */}
//           <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white">
//             <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-6">Management Actions</h3>
//             <div className="grid grid-cols-1 gap-3">
//               {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
//                 <button
//                   key={status}
//                   disabled={updating || order.status === status}
//                   onClick={() => updateStatus(status)}
//                   className={`w-full py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${
//                     order.status === status 
//                     ? "bg-blue-600 text-white border-2 border-blue-400" 
//                     : "bg-white/5 text-gray-400 hover:bg-white/10"
//                   }`}
//                 >
//                   {status}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Logistics / Shipping */}
//           <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
//              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-6 flex items-center gap-2">
//                <MapPin size={12} /> Shipping Logistics
//              </h3>
//              <div className="space-y-4">
//                 <div>
//                   <p className="font-black text-gray-900 uppercase text-xs mb-1">{order.firstName} {order.lastName}</p>
//                   <p className="text-[10px] font-bold text-gray-500 leading-relaxed uppercase">
//                     {order.streetAddress}, {order.city}<br/>
//                     {order.state} State, Nigeria
//                   </p>
//                 </div>
//                 <div className="pt-4 space-y-2 border-t border-gray-50">
//                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase">
//                       <Phone size={12} /> {order.phone}
//                    </div>
//                    <div className="flex items-center gap-2 text-[8px] font-bold text-gray-400 uppercase">
//                       <Mail size={12} /> {order.email}
//                    </div>
//                 </div>
//              </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useNotification } from "@/app/_context/NotificationContext";
import { ArrowLeft, Printer, MapPin, Phone, Mail, RotateCcw, ShieldAlert } from "lucide-react";
import { processRefund } from "@/app/services/adminOrderActions";
import { useSession } from "next-auth/react";

export default function OrderDetailView({ order }: { order: any }) {
  const router = useRouter();
  const { data: session } = useSession();
  const { notifySuccess, notifyError } = useNotification();
  const [updating, setUpdating] = useState(false);
  const [refunding, setRefunding] = useState(false);

  // Status mapping for visual clarity
  const isRefunded = order.status === "refunded";
  const canRefund = order.paymentStatus === true && !isRefunded && session?.user?.role === "SUPER_ADMIN";

  const updateStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admins/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        notifySuccess(`Mission Updated: Order is now ${newStatus.toUpperCase()}`);
        router.refresh();
      }
    } catch (err) {
      notifyError("Failed to update order status.");
    } finally {
      setUpdating(false);
    }
  };

  const handleRefundRequest = async () => {
    const reason = prompt("Enter reason for tactical reversal (Refund):");
    if (!reason) return;

    setRefunding(true);
    try {
      const result = await processRefund(order.id, reason);
      if (result.success) {
        notifySuccess(result.message);
        router.refresh();
      } else {
        notifyError(result.message);
      }
    } catch (error) {
      notifyError("Critical failure during refund sequence.");
    } finally {
      setRefunding(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 font-bold uppercase text-[10px] tracking-widest hover:text-gray-900 transition-colors">
          <ArrowLeft size={14} /> Back to Command Center
        </button>
        <div className="flex gap-2 w-full md:w-auto">
          {/* Item (a): Refund Trigger - Only visible to SUPER_ADMIN if order is paid */}
          {canRefund && (
            <button 
              disabled={refunding}
              onClick={handleRefundRequest}
              className="flex-1 md:flex-none px-6 py-3 bg-red-50 text-red-600 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-red-600 hover:text-white transition-all shadow-sm border border-red-100"
            >
              <RotateCcw size={14} /> {refunding ? "Processing..." : "Initiate Refund"}
            </button>
          )}
          
          <button onClick={() => window.print()} className="flex-1 md:flex-none px-6 py-3 bg-white border border-gray-200 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-gray-50 transition-all shadow-sm">
            <Printer size={14} /> Print Invoice
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Order Items & Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Refund Alert Banner */}
          {isRefunded && (
            <div className="bg-red-600 text-white rounded-[2rem] p-6 flex items-center gap-4 shadow-xl shadow-red-100">
              <ShieldAlert size={32} />
              <div>
                <p className="font-black uppercase italic tracking-wider">Asset Deauthorized</p>
                <p className="text-sm font-bold opacity-90">Reason: {order.refundReason || "Administrative Reversal"}</p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter">Items <span className="text-blue-600">Ordered</span></h2>
              <span className="bg-blue-50 text-blue-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                {order.items.length} Products
              </span>
            </div>

            <div className="divide-y divide-gray-50">
              {order.items.map((item: any) => (
                <div key={item.id} className="py-4 flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl overflow-hidden border border-gray-50 flex-shrink-0">
                    {item.imageUrl && <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-gray-900 uppercase text-xs tracking-tight">{item.title}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Qty: {item.qty} × ₦{Number(item.unitPrice).toLocaleString()}</p>
                  </div>
                  <p className="font-black text-gray-900 italic">₦{(item.qty * Number(item.unitPrice)).toLocaleString()}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-dashed border-gray-100 space-y-3">
              <div className="flex justify-between text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                <span>Subtotal</span>
                <span className="text-gray-900 font-black">₦{Number(order.subtotal).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                <span>Shipping</span>
                <span className="text-gray-900 font-black">₦{Number(order.shipping).toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-4">
                <span className="text-xl font-black italic uppercase tracking-tighter">Total</span>
                <span className={`text-2xl font-black italic ${isRefunded ? 'text-gray-400 line-through' : 'text-blue-600'}`}>
                   ₦{Number(order.total).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Status & Logistics */}
        <div className="space-y-6">
          <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-gray-200">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-6">Management Status</h3>
            <div className="grid grid-cols-1 gap-3">
              {['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'].map((status) => (
                <button
                  key={status}
                  disabled={updating || order.status === status || (status === 'refunded' && session?.user?.role !== "SUPER_ADMIN")}
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
                  <p className="font-black text-gray-900 uppercase text-xs mb-1">{order.firstName} {order.lastName}</p>
                  <p className="text-[10px] font-bold text-gray-500 leading-relaxed uppercase">
                    {order.streetAddress}, {order.city}<br/>
                    {order.state} State, Nigeria
                  </p>
                </div>
                <div className="pt-4 space-y-3 border-t border-gray-50">
                   <div className="flex items-center gap-2 text-[10px] font-bold text-gray-900 uppercase">
                      <div className="bg-gray-100 p-1.5 rounded-lg"><Phone size={10} /></div> {order.phone}
                   </div>
                   <div className="flex items-center gap-2 text-[10px] font-bold text-gray-900 lowercase truncate">
                      <div className="bg-gray-100 p-1.5 rounded-lg"><Mail size={10} /></div> {order.email}
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
// "use client";

// import { useState } from "react";
// import { motion } from "framer-motion";
// import { Package, Truck, CheckCircle2, Search, Clock, ShieldCheck } from "lucide-react";

// const STEPS = [
//   { id: "PENDING", label: "Confirmed", icon: Clock },
//   { id: "PROCESSING", label: "Processing", icon: ShieldCheck },
//   { id: "SHIPPED", label: "In Transit", icon: Truck },
//   { id: "DELIVERED", label: "Delivered", icon: CheckCircle2 },
// ];

// export default function OrderTracker() {
//   const [orderId, setOrderId] = useState("");
//   const [order, setOrder] = useState<any>(null);
//   const [loading, setLoading] = useState(false);

//   const handleTrack = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const res = await fetch(`/api/orders/track?orderNumber=${orderId}`);
//       const data = await res.json();
//       setOrder(data);
//     } catch (err) {
//       console.error("Tracking error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const currentStepIndex = STEPS.findIndex(step => step.id === order?.status);

//   return (
//     <div className="max-w-4xl mx-auto p-6">
//       {/* Search Header */}
//       <div className="text-center mb-12">
//         <h1 className="text-5xl font-black italic uppercase tracking-tighter text-[#002B5B]">
//           Track Your <span className="text-[#F7931E]">Gear.</span>
//         </h1>
//         <form onSubmit={handleTrack} className="mt-8 flex gap-2 max-w-md mx-auto">
//           <input
//             type="text"
//             placeholder="MARVEL-1001"
//             value={orderId}
//             onChange={(e) => setOrderId(e.target.value.toUpperCase())}
//             className="flex-1 bg-white border-2 border-[#FFE8CC] p-4 rounded-2xl font-bold focus:border-[#F7931E] outline-none transition-all"
//           />
//           <button className="bg-[#002B5B] text-white p-4 rounded-2xl hover:bg-[#1E1E1E] transition-all">
//             {loading ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> : <Search />}
//           </button>
//         </form>
//       </div>

//       {order && (
//         <motion.div 
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-[#FFE8CC]"
//         >
//           {/* Status Timeline */}
//           <div className="relative flex justify-between items-center mb-12">
//             {/* Background Line */}
//             <div className="absolute top-1/2 left-0 w-full h-1 bg-[#F8F8F8] -translate-y-1/2 -z-0" />
            
//             {/* Active Line */}
//             <motion.div 
//               initial={{ width: 0 }}
//               animate={{ width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%` }}
//               className="absolute top-1/2 left-0 h-1 bg-[#F7931E] -translate-y-1/2 -z-0 transition-all duration-1000"
//             />

//             {STEPS.map((step, index) => {
//               const Icon = step.icon;
//               const isActive = index <= currentStepIndex;
//               const isCurrent = index === currentStepIndex;

//               return (
//                 <div key={step.id} className="relative z-10 flex flex-col items-center">
//                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
//                     isActive ? "bg-[#002B5B] text-[#F7931E] shadow-lg shadow-navy-200" : "bg-[#F8F8F8] text-gray-300"
//                   } ${isCurrent ? "scale-110 ring-4 ring-[#FFE8CC]" : ""}`}>
//                     <Icon size={24} />
//                   </div>
//                   <span className={`mt-4 text-[10px] font-black uppercase tracking-widest ${
//                     isActive ? "text-[#002B5B]" : "text-gray-300"
//                   }`}>
//                     {step.label}
//                   </span>
//                 </div>
//               );
//             })}
//           </div>

//           {/* Order Details Grid */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-[#F8F8F8]">
//             <div className="space-y-4">
//               <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4B4B4B]">Shipment Details</h3>
//               <p className="font-bold text-[#002B5B]">{order.firstName} {order.lastName}</p>
//               <p className="text-sm text-[#4B4B4B]">{order.shippingAddress}, {order.shippingCity}</p>
//             </div>
//             <div className="space-y-4">
//               <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4B4B4B]">Estimated Delivery</h3>
//               <p className="text-2xl font-black italic text-[#002B5B]">3-5 Business Days</p>
//               <div className="inline-block px-4 py-2 bg-[#FFE8CC] text-[#F7931E] rounded-full text-[10px] font-black uppercase">
//                 Status: {order.status}
//               </div>
//             </div>
//           </div>
//         </motion.div>
//       )}
//     </div>
//   );
// }



"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, Truck, CheckCircle2, Search, 
  Clock, ShieldCheck, BellRing, X, Loader2
} from "lucide-react";

const STEPS = [
  { id: "PENDING", label: "Confirmed", icon: Clock },
  { id: "PROCESSING", label: "Security Check", icon: ShieldCheck },
  { id: "SHIPPED", label: "In Transit", icon: Truck },
  { id: "DELIVERED", label: "Gear Dropped", icon: CheckCircle2 },
];

export default function OrderTracker() {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showPush, setShowPush] = useState(false);

  // Simulation: Trigger push notification when order is found
  useEffect(() => {
    if (order) {
      const timer = setTimeout(() => setShowPush(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [order]);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setShowPush(false);
    try {
      const res = await fetch(`/api/orders/track?orderNumber=${orderId}`);
      const data = await res.json();
      setOrder(data);
    } catch (err) {
      console.error("Tracking error");
    } finally {
      setLoading(false);
    }
  };

  const currentStepIndex = STEPS.findIndex(step => step.id === order?.status);

  return (
    <div className="min-h-screen bg-[#F8F8F8] p-6 text-[#1E1E1E]">
      {/* 🔔 PUSH NOTIFICATION SIMULATION */}
      <AnimatePresence>
        {showPush && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm"
          >
            <div className="bg-[#002B5B] text-white p-4 rounded-3xl shadow-2xl border-b-4 border-[#F7931E] flex items-center gap-4">
              <div className="bg-[#F7931E] p-2 rounded-xl text-[#002B5B]">
                <BellRing size={20} className="animate-bounce" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#FFE8CC]">MarvelMarts Live</p>
                <p className="text-xs font-bold">Order #{order.orderNumber} is now {order.status.toLowerCase()}!</p>
              </div>
              <button onClick={() => setShowPush(false)} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto pt-20">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-black italic uppercase tracking-tighter text-[#002B5B]">
            Track Your <span className="text-[#F7931E]">Order.</span>
          </h1>
          <form onSubmit={handleTrack} className="mt-8 flex gap-2 max-w-md md:max-w-xl mx-auto">
            <input
              type="text"
              placeholder="enter you order ID MARVEL-XXXX"
              className="flex-1 bg-white border-2 border-[#FFE8CC] p-4 rounded-2xl font-black text-[#002B5B] focus:border-[#F7931E] outline-none transition-all"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value.toUpperCase())}
            />
            <button className="bg-[#002B5B] text-white px-6 rounded-2xl hover:bg-[#1E1E1E] transition-all">
              {loading ? <Loader2 className="animate-spin" /> : <Search />}
            </button>
          </form>
        </header>

        {order && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-[3rem] p-10 shadow-sm border border-[#FFE8CC]"
          >
            {/* TIMELINE */}
            <div className="relative flex justify-between items-center mb-16 px-4">
              <div className="absolute top-1/2 left-0 w-full h-[2px] bg-[#F8F8F8] -translate-y-1/2" />
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%` }}
                className="absolute top-1/2 left-0 h-[2px] bg-[#F7931E] -translate-y-1/2 transition-all duration-1000"
              />

              {STEPS.map((step, index) => {
                const Icon = step.icon;
                const isActive = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;

                return (
                  <div key={step.id} className="relative z-10 flex flex-col items-center">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-700 ${
                      isActive ? "bg-[#002B5B] text-[#F7931E]" : "bg-[#F8F8F8] text-gray-200"
                    } ${isCurrent ? "ring-4 ring-[#FFE8CC] scale-110 shadow-xl" : ""}`}>
                      <Icon size={24} className={isCurrent ? "animate-pulse" : ""} />
                    </div>
                    <span className={`absolute -bottom-10 whitespace-nowrap text-[9px] font-black uppercase tracking-widest ${
                      isActive ? "text-[#002B5B]" : "text-gray-300"
                    }`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* INFO BOXES */}
            <div className="grid md:grid-cols-3 gap-6 pt-10 border-t border-[#F8F8F8]">
              <div className="bg-[#F8F8F8] p-6 rounded-3xl">
                <p className="text-[10px] font-black uppercase text-[#4B4B4B] mb-2 tracking-widest">Customer</p>
                <p className="font-bold text-[#002B5B]">{order.firstName} {order.lastName}</p>
              </div>
              <div className="bg-[#F8F8F8] p-6 rounded-3xl">
                <p className="text-[10px] font-black uppercase text-[#4B4B4B] mb-2 tracking-widest">Courier</p>
                <p className="font-bold text-[#002B5B]">MarvelMarts Logistics</p>
              </div>
              <div className="bg-[#F7931E] p-6 rounded-3xl text-[#002B5B]">
                <p className="text-[10px] font-black uppercase text-[#002B5B]/60 mb-2 tracking-widest">Est. Arrival</p>
                <p className="font-black italic">48 HOURS</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

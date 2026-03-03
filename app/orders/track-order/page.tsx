




// "use client";

// import { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { 
//   Package, Truck, CheckCircle2, Search, 
//   Clock, ShieldCheck, BellRing, X, Loader2,
//   MapPin, Calendar, Smartphone, Info
// } from "lucide-react";

// const STEPS = [
//   { id: "PENDING", label: "Confirmed", icon: Clock, desc: "Order received & verified" },
//   { id: "PROCESSING", label: "Security Check", icon: ShieldCheck, desc: "Payment & fraud verification" },
//   { id: "SHIPPED", label: "In Transit", icon: Truck, desc: "Handed to Marvel Logistics" },
//   { id: "DELIVERED", label: "Gear Dropped", icon: CheckCircle2, desc: "Successfully delivered" },
// ];

// export default function OrderTracker() {
//   const [orderId, setOrderId] = useState("");
//   const [order, setOrder] = useState<any>(null);
//   const [loading, setLoading] = useState(false);
//   const [showPush, setShowPush] = useState(false);

//   useEffect(() => {
//     if (order) {
//       const timer = setTimeout(() => setShowPush(true), 1500);
//       return () => clearTimeout(timer);
//     }
//   }, [order]);

//   const handleTrack = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!orderId.trim()) return;
    
//     setLoading(true);
//     setShowPush(false);
//     try {
//       const res = await fetch(`/api/orders/track?orderNumber=${orderId}`);
//       const data = await res.json();
//       setOrder(data);
//     } catch (err) {
//       console.error("Tracking error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const currentStepIndex = STEPS.findIndex(step => step.id === order?.status);

//   return (
//     <div className="min-h-screen bg-[#FDFDFD] text-[#002B5B] selection:bg-[#F7931E]/30">
//       {/* 🔔 HIGH-END NOTIFICATION */}
//       <AnimatePresence>
//         {showPush && order && (
//           <motion.div 
//             initial={{ y: -100, opacity: 0, scale: 0.9 }}
//             animate={{ y: 0, opacity: 1, scale: 1 }}
//             exit={{ y: -100, opacity: 0, scale: 0.9 }}
//             className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md"
//           >
//             <div className="bg-[#002B5B] backdrop-blur-md text-white p-5 rounded-[2rem] shadow-[0_20px_50px_rgba(0,43,91,0.3)] border border-white/10 flex items-center gap-5">
//               <div className="relative">
//                 <div className="bg-[#F7931E] p-3 rounded-2xl text-[#002B5B]">
//                   <BellRing size={22} className="animate-[ring_2s_infinite]" />
//                 </div>
//                 <span className="absolute -top-1 -right-1 flex h-3 w-3">
//                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
//                   <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
//                 </span>
//               </div>
//               <div className="flex-1">
//                 <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#F7931E]">Real-time Update</h4>
//                 <p className="text-sm font-bold leading-tight">Order #{order.orderNumber} updated to <span className="text-[#F7931E]">{order.status}</span></p>
//               </div>
//               <button onClick={() => setShowPush(false)} className="hover:rotate-90 transition-transform p-1">
//                 <X size={20} className="text-white/40 hover:text-white" />
//               </button>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       <div className="max-w-5xl mx-auto px-6 pt-32 pb-20">
//         <header className="text-center mb-20">
//           <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
//             <span className="inline-block px-4 py-2 rounded-full bg-[#002B5B]/5 text-[#002B5B] text-[10px] font-black uppercase tracking-[0.3em] mb-6">
//               Logistics Terminal v2.0
//             </span>
//             <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.8] mb-8">
//               Pulse <span className="text-transparent border-t-brand-primary bg-clip-text bg-gradient-to-r from-[#002B5B] to-[#F7931E]">Tracker.</span>
//             </h1>
//           </motion.div>

//           <form onSubmit={handleTrack} className="mt-12 group relative max-w-2xl mx-auto">
//             <div className="absolute -inset-1 bg-gradient-to-r from-[#002B5B] to-[#F7931E] rounded-[2.5rem] blur opacity-20 group-focus-within:opacity-40 transition duration-1000"></div>
//             <div className="relative flex p-2 bg-white rounded-[2rem] shadow-xl border border-[#FFE8CC]">
//               <div className="flex items-center pl-6 text-[#002B5B]/30 group-focus-within:text-[#F7931E] transition-colors">
//                 <Smartphone size={20} />
//               </div>
//               <input
//                 type="text"
//                 placeholder="MARVEL-XXXX-XXXX"
//                 className="flex-1 bg-transparent py-6 px-4 font-black text-xl text-[#002B5B] placeholder:text-gray-200 outline-none uppercase"
//                 value={orderId}
//                 onChange={(e) => setOrderId(e.target.value)}
//               />
//               <button 
//                 type="submit"
//                 disabled={loading}
//                 className="bg-[#002B5B] text-white px-10 rounded-[1.5rem] hover:bg-[#F7931E] hover:text-[#002B5B] transition-all duration-500 disabled:opacity-70 font-black uppercase tracking-widest flex items-center gap-3 shadow-lg"
//               >
//                 {loading ? <Loader2 className="animate-spin" size={20} /> : <><Search size={20} /> <span>Locate</span></>}
//               </button>
//             </div>
//           </form>
//         </header>

//         {order && (
//           <motion.div 
//             initial={{ opacity: 0, scale: 0.95 }}
//             animate={{ opacity: 1, scale: 1 }}
//             className="relative"
//           >
//             {/* ADVANCED STATUS CARD */}
//             <div className="bg-white rounded-[4rem] p-8 md:p-16 shadow-[0_40px_100px_-20px_rgba(0,43,91,0.1)] border border-[#FFE8CC] overflow-hidden">
//               <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
//                 <Package size={300} />
//               </div>

//               {/* DYNAMIC TIMELINE */}
//               <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-12 mb-24">
//                 <div className="absolute top-1/2 left-0 w-full h-[4px] bg-[#F8F8F8] -translate-y-1/2 hidden md:block" />
//                 <motion.div 
//                   initial={{ width: 0 }}
//                   animate={{ width: `${currentStepIndex >= 0 ? (currentStepIndex / (STEPS.length - 1)) * 100 : 0}%` }}
//                   className="absolute top-1/2 left-0 h-[4px] bg-gradient-to-r from-[#002B5B] to-[#F7931E] -translate-y-1/2 hidden md:block transition-all duration-1000 ease-out"
//                 />

//                 {STEPS.map((step, index) => {
//                   const Icon = step.icon;
//                   const isActive = index <= currentStepIndex;
//                   const isCurrent = index === currentStepIndex;

//                   return (
//                     <div key={step.id} className="relative z-10 flex md:flex-col items-center gap-6 md:gap-0">
//                       <div className="relative">
//                         <motion.div 
//                            animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
//                            transition={{ repeat: Infinity, duration: 2 }}
//                            className={`w-16 h-16 md:w-20 md:h-20 rounded-[2rem] flex items-center justify-center transition-all duration-700 ${
//                           isActive ? "bg-[#002B5B] text-[#F7931E] shadow-2xl shadow-[#002B5B]/30" : "bg-[#F8F8F8] text-gray-300"
//                         } ${isCurrent ? "ring-[6px] ring-[#FFE8CC]" : ""}`}>
//                           <Icon size={isActive ? 32 : 28} />
//                         </motion.div>
//                         {isActive && !isCurrent && (
//                           <div className="absolute -top-1 -right-1 bg-[#F7931E] rounded-full p-1 text-[#002B5B]">
//                             <CheckCircle2 size={14} />
//                           </div>
//                         )}
//                       </div>

//                       <div className="md:absolute md:-bottom-16 md:left-1/2 md:-translate-x-1/2 md:text-center min-w-max">
//                         <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${isActive ? "text-[#002B5B]" : "text-gray-300"}`}>
//                           {step.label}
//                         </p>
//                         <p className="text-[9px] text-gray-400 hidden md:block max-w-[100px] leading-tight">
//                           {step.desc}
//                         </p>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>

//               {/* DATA GRID */}
//               <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-20">
//                 <div className="group bg-[#F8F8F8] p-8 rounded-[2.5rem] hover:bg-[#002B5B] hover:text-white transition-all duration-500">
//                   <div className="flex items-center gap-3 mb-4 text-[#F7931E]">
//                     <MapPin size={18} />
//                     <span className="text-[10px] font-black uppercase tracking-widest">Destination</span>
//                   </div>
//                   <p className="font-bold text-lg leading-tight uppercase">{order.city || "Lagos, NG"}</p>
//                 </div>

//                 <div className="bg-[#F8F8F8] p-8 rounded-[2.5rem]">
//                   <div className="flex items-center gap-3 mb-4 text-[#4B4B4B]">
//                     <Smartphone size={18} />
//                     <span className="text-[10px] font-black uppercase tracking-widest">Phone</span>
//                   </div>
//                   <p className="font-bold text-lg">{order.phone || "--- --- ---"}</p>
//                 </div>

//                 <div className="bg-[#F8F8F8] p-8 rounded-[2.5rem]">
//                   <div className="flex items-center gap-3 mb-4 text-[#4B4B4B]">
//                     <Calendar size={18} />
//                     <span className="text-[10px] font-black uppercase tracking-widest">Ordered On</span>
//                   </div>
//                   <p className="font-bold text-lg">
//                     {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "TBD"}
//                   </p>
//                 </div>

//                 <div className="bg-[#F7931E] p-8 rounded-[2.5rem] flex flex-col justify-between">
//                   <span className="text-[10px] font-black uppercase text-[#002B5B]/60 tracking-widest">Est. Delivery</span>
//                   <div>
//                     <p className="text-3xl font-black italic text-[#002B5B]">24-48H</p>
//                     <p className="text-[10px] font-bold text-[#002B5B]/60">Priority Logistics</p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* SECURITY BADGE */}
//             <div className="mt-8 flex justify-center items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">
//               <ShieldCheck size={14} />
//               <span>End-to-End Encrypted Tracking Data</span>
//             </div>
//           </motion.div>
//         )}
//       </div>
//     </div>
//   );
// }




"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, Truck, CheckCircle2, Search, 
  Clock, ShieldCheck, BellRing, X, Loader2,
  MapPin, Calendar, Smartphone, Info
} from "lucide-react";
// import { useGlobalSettings } from "@/app/_context/GlobalSettingsContext";

const STEPS = [
  { id: "PENDING", label: "Confirmed", icon: Clock, desc: "Order received & verified" },
  { id: "PROCESSING", label: "Security Check", icon: ShieldCheck, desc: "Payment & fraud verification" },
  { id: "SHIPPED", label: "In Transit", icon: Truck, desc: "Handed to Marvel Logistics" },
  { id: "DELIVERED", label: "Gear Dropped", icon: CheckCircle2, desc: "Successfully delivered" },
];

export default function OrderTracker() {
  // const { settings, isLoading: settingsLoading } = useGlobalSettings();

  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showPush, setShowPush] = useState(false);

  useEffect(() => {
    if (order) {
      const timer = setTimeout(() => setShowPush(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [order]);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    
    setLoading(true);
    setShowPush(false);
    try {
      const res = await fetch(`/api/orders/track?orderNumber=${orderId}`);
      const data = await res.json();
      setOrder(data);
    } catch (err) {
      console.error("Tracking error:", err);
    } finally {
      setLoading(false);
    }
  };

  const currentStepIndex = STEPS.findIndex(step => step.id === order?.status);

  // if (settingsLoading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-[var(--neutral-white)]">
  //       <Loader2 className="w-12 h-12 animate-spin text-[var(--brand-primary)]" />
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-[var(--neutral-white)] text-[var(--accent-navy)] selection:bg-[var(--brand-primary)]/30">
      {/* 🔔 HIGH-END NOTIFICATION */}
      <AnimatePresence>
        {showPush && order && (
          <motion.div 
            initial={{ y: -100, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -100, opacity: 0, scale: 0.9 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md"
          >
            <div className="bg-[var(--accent-navy)] backdrop-blur-md text-[var(--neutral-white)] p-5 rounded-[2rem] shadow-[0_20px_50px_rgba(0,43,91,0.3)] border border-[var(--neutral-white)]/10 flex items-center gap-5">
              <div className="relative">
                <div className="bg-[var(--brand-primary)] p-3 rounded-2xl text-[var(--accent-navy)]">
                  <BellRing size={22} className="animate-[ring_2s_infinite]" />
                </div>
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--brand-primary)] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--brand-primary)]"></span>
                </span>
              </div>
              <div className="flex-1">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--brand-primary)]">Real-time Update</h4>
                <p className="text-sm font-bold leading-tight">Order #{order.orderNumber} updated to <span className="text-[var(--brand-primary)]">{order.status}</span></p>
              </div>
              <button onClick={() => setShowPush(false)} className="hover:rotate-90 transition-transform p-1">
                <X size={20} className="text-[var(--neutral-white)]/40 hover:text-[var(--neutral-white)]" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto px-6 pt-32 pb-20">
        <header className="text-center mb-20">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block px-4 py-2 rounded-full bg-[var(--accent-navy)]/5 text-[var(--accent-navy)] text-[10px] font-black uppercase tracking-[0.3em] mb-6">
              Logistics Terminal v2.0
            </span>
            <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.8] mb-8">
              Order <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-navy)] to-[var(--brand-primary)]">Tracker.</span>
            </h1>
          </motion.div>

          <form onSubmit={handleTrack} className="mt-12 group relative max-w-2xl mx-auto">
            <div className="absolute -inset-1 bg-gradient-to-r from-[var(--accent-navy)] to-[var(--brand-primary)] rounded-[2.5rem] blur opacity-20 group-focus-within:opacity-40 transition duration-1000"></div>
            <div className="relative flex p-2 bg-[var(--neutral-white)] rounded-[2rem] shadow-xl border border-[var(--brand-orange-light)]">
              <div className="flex items-center pl-6 text-[var(--accent-navy)]/30 group-focus-within:text-[var(--brand-primary)] transition-colors">
                <Smartphone size={20} />
              </div>
              <input
                type="text"
                placeholder="MARVEL-XXXX-XXXX"
                className="flex-1 bg-transparent py-6 px-4 font-black text-xl text-[var(--accent-navy)] placeholder:text-gray-200 outline-none uppercase"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
              />
              <button 
                type="submit"
                disabled={loading}
                className="bg-[var(--accent-navy)] text-[var(--neutral-white)] px-10 rounded-[1.5rem] hover:bg-[var(--brand-primary)] hover:text-[var(--accent-navy)] transition-all duration-500 disabled:opacity-70 font-black uppercase tracking-widest flex items-center gap-3 shadow-lg"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <><Search size={20} /> <span>Locate</span></>}
              </button>
            </div>
          </form>
        </header>

        {order && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            {/* ADVANCED STATUS CARD */}
            <div className="bg-[var(--neutral-white)] rounded-[4rem] p-8 md:p-16 shadow-[0_40px_100px_-20px_rgba(0,43,91,0.1)] border border-[var(--brand-orange-light)] overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                <Package size={300} className="text-[var(--neutral-gray)]" />
              </div>

              {/* DYNAMIC TIMELINE */}
              <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-12 mb-24">
                <div className="absolute top-1/2 left-0 w-full h-[4px] bg-[var(--neutral-light)] -translate-y-1/2 hidden md:block" />
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${currentStepIndex >= 0 ? (currentStepIndex / (STEPS.length - 1)) * 100 : 0}%` }}
                  className="absolute top-1/2 left-0 h-[4px] bg-gradient-to-r from-[var(--accent-navy)] to-[var(--brand-primary)] -translate-y-1/2 hidden md:block transition-all duration-1000 ease-out"
                />

                {STEPS.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;

                  return (
                    <div key={step.id} className="relative z-10 flex md:flex-col items-center gap-6 md:gap-0">
                      <div className="relative">
                        <motion.div 
                          animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className={`w-16 h-16 md:w-20 md:h-20 rounded-[2rem] flex items-center justify-center transition-all duration-700 ${
                            isActive 
                              ? "bg-[var(--accent-navy)] text-[var(--brand-primary)] shadow-2xl shadow-[var(--accent-navy)]/30" 
                              : "bg-[var(--neutral-light)] text-[var(--neutral-gray)]"
                          } ${isCurrent ? "ring-[6px] ring-[var(--brand-orange-light)]" : ""}`}>
                          <Icon size={isActive ? 32 : 28} />
                        </motion.div>
                        {isActive && !isCurrent && (
                          <div className="absolute -top-1 -right-1 bg-[var(--brand-primary)] rounded-full p-1 text-[var(--accent-navy)]">
                            <CheckCircle2 size={14} />
                          </div>
                        )}
                      </div>

                      <div className="md:absolute md:-bottom-16 md:left-1/2 md:-translate-x-1/2 md:text-center min-w-max">
                        <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${isActive ? "text-[var(--accent-navy)]" : "text-[var(--neutral-gray)]"}`}>
                          {step.label}
                        </p>
                        <p className="text-[9px] text-[var(--neutral-gray)] hidden md:block max-w-[100px] leading-tight">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* DATA GRID */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-20">
                <div className="group bg-[var(--neutral-light)] p-8 rounded-[2.5rem] hover:bg-[var(--accent-navy)] hover:text-[var(--neutral-white)] transition-all duration-500">
                  <div className="flex items-center gap-3 mb-4 text-[var(--brand-primary)]">
                    <MapPin size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Destination</span>
                  </div>
                  <p className="font-bold text-lg leading-tight uppercase">{order.city || "Lagos, NG"}</p>
                </div>

                <div className="bg-[var(--neutral-light)] p-8 rounded-[2.5rem]">
                  <div className="flex items-center gap-3 mb-4 text-[var(--neutral-gray)]">
                    <Smartphone size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Phone</span>
                  </div>
                  <p className="font-bold text-lg">{order.phone || "--- --- ---"}</p>
                </div>

                <div className="bg-[var(--neutral-light)] p-8 rounded-[2.5rem]">
                  <div className="flex items-center gap-3 mb-4 text-[var(--neutral-gray)]">
                    <Calendar size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Ordered On</span>
                  </div>
                  <p className="font-bold text-lg">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "TBD"}
                  </p>
                </div>

                <div className="bg-[var(--brand-primary)] p-8 rounded-[2.5rem] flex flex-col justify-between">
                  <span className="text-[10px] font-black uppercase text-[var(--accent-navy)]/60 tracking-widest">Est. Delivery</span>
                  <div>
                    <p className="text-3xl font-black italic text-[var(--accent-navy)]">24-48H</p>
                    <p className="text-[10px] font-bold text-[var(--accent-navy)]/60">Priority Logistics</p>
                  </div>
                </div>
              </div>
            </div>

            {/* SECURITY BADGE */}
            <div className="mt-8 flex justify-center items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-[var(--neutral-gray)]">
              <ShieldCheck size={14} />
              <span>End-to-End Encrypted Tracking Data</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
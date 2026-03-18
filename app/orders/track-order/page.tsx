// "use client";

// import { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { 
//   Package, Truck, CheckCircle2, Search, 
//   Clock, ShieldCheck, BellRing, X, Loader2,
//   MapPin, Calendar, Smartphone, Info
// } from "lucide-react";
// // import { useGlobalSettings } from "@/app/_context/GlobalSettingsContext";

// const STEPS = [
//   { id: "PENDING", label: "Confirmed", icon: Clock, desc: "Order received & verified" },
//   { id: "PROCESSING", label: "Security Check", icon: ShieldCheck, desc: "Payment & fraud verification" },
//   { id: "SHIPPED", label: "In Transit", icon: Truck, desc: "Handed to Marvel Logistics" },
//   { id: "DELIVERED", label: "Gear Dropped", icon: CheckCircle2, desc: "Successfully delivered" },
// ];

// export default function OrderTracker() {
//   // const { settings, isLoading: settingsLoading } = useGlobalSettings();

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

//   // if (settingsLoading) {
//   //   return (
//   //     <div className="min-h-screen flex items-center justify-center bg-[var(--neutral-white)]">
//   //       <Loader2 className="w-12 h-12 animate-spin text-[var(--brand-primary)]" />
//   //     </div>
//   //   );
//   // }

//   return (
//     <div className="min-h-screen bg-[var(--neutral-white)] text-[var(--accent-navy)] selection:bg-[var(--brand-primary)]/30">
//       {/* 🔔 HIGH-END NOTIFICATION */}
//       <AnimatePresence>
//         {showPush && order && (
//           <motion.div 
//             initial={{ y: -100, opacity: 0, scale: 0.9 }}
//             animate={{ y: 0, opacity: 1, scale: 1 }}
//             exit={{ y: -100, opacity: 0, scale: 0.9 }}
//             className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md"
//           >
//             <div className="bg-[var(--accent-navy)] backdrop-blur-md text-[var(--neutral-white)] p-5 rounded-[2rem] shadow-[0_20px_50px_rgba(0,43,91,0.3)] border border-[var(--neutral-white)]/10 flex items-center gap-5">
//               <div className="relative">
//                 <div className="bg-[var(--brand-primary)] p-3 rounded-2xl text-[var(--accent-navy)]">
//                   <BellRing size={22} className="animate-[ring_2s_infinite]" />
//                 </div>
//                 <span className="absolute -top-1 -right-1 flex h-3 w-3">
//                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--brand-primary)] opacity-75"></span>
//                   <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--brand-primary)]"></span>
//                 </span>
//               </div>
//               <div className="flex-1">
//                 <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--brand-primary)]">Real-time Update</h4>
//                 <p className="text-sm font-bold leading-tight">Order #{order.orderNumber} updated to <span className="text-[var(--brand-primary)]">{order.status}</span></p>
//               </div>
//               <button onClick={() => setShowPush(false)} className="hover:rotate-90 transition-transform p-1">
//                 <X size={20} className="text-[var(--neutral-white)]/40 hover:text-[var(--neutral-white)]" />
//               </button>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       <div className="max-w-5xl mx-auto px-6 pt-32 pb-20">
//         <header className="text-center mb-20">
//           <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
//             <span className="inline-block px-4 py-2 rounded-full bg-[var(--accent-navy)]/5 text-[var(--accent-navy)] text-[10px] font-black uppercase tracking-[0.3em] mb-6">
//               Logistics Terminal v2.0
//             </span>
//             <h1 className="text-xl md:text-4xl font-black italic uppercase tracking-tighter leading-[0.8] mb-8">
//               Order <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-navy)] to-[var(--brand-primary)]">Tracker.</span>
//             </h1>
//           </motion.div>

//           <form onSubmit={handleTrack} className="mt-12 group relative max-w-2xl mx-auto">
//             <div className="absolute -inset-1 bg-gradient-to-r from-[var(--accent-navy)] to-[var(--brand-primary)] rounded-[2.5rem] blur opacity-20 group-focus-within:opacity-40 transition duration-1000"></div>
//             <div className="relative flex flex-col md:flex-row p-2 bg-(--neutral-white) rounded-[2rem] shadow-xl border border-[var(--brand-orange-light)]">
//               <div className="flex flex-row items-center pl-6 text-(--accent-navy)/30 group-focus-within:text-[var(--brand-primary)] transition-colors">
//                 <Smartphone size={20} />
//               </div>
//               <input
//                 type="text"
//                 placeholder="MARVEL-XXXX-XXXX"
//                 className="flex-1  bg-transparent py-3 px-1 font-black text-xl xs:text-md  text-(--accent-navy) placeholder:text-gray-200 outline-none uppercase"
//                 value={orderId}
//                 onChange={(e) => setOrderId(e.target.value)}
//               />
//               <button 
//                 type="submit"
//                 disabled={loading}
//                 className="bg-(--accent-navy) text-(--brand-white) px-10 rounded-[1.5rem] hover:bg-(--brand-primary) hover:text-(--accent-navy) transition-all duration-500 disabled:opacity-30 font-black uppercase tracking-widest flex items-center gap-3 shadow-sm"
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
//             <div className="bg-(--brand-white) rounded-[4rem] p-8 md:p-16 shadow-[0_40px_100px_-20px_rgba(0,43,91,0.1)] border border-(--brand-orange-light) overflow-hidden">
//               <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
//                 <Package size={300} className="text-(--neutral-gray)" />
//               </div>

//               {/* DYNAMIC TIMELINE */}
//               <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-12 mb-24">
//                 <div className="absolute top-1/2 left-0 w-full h-[4px] bg-[var(--neutral-light)] -translate-y-1/2 hidden md:block" />
//                 <motion.div 
//                   initial={{ width: 0 }}
//                   animate={{ width: `${currentStepIndex >= 0 ? (currentStepIndex / (STEPS.length - 1)) * 100 : 0}%` }}
//                   className="absolute top-1/2 left-0 h-[4px] bg-gradient-to-r from-[var(--accent-navy)] to-[var(--brand-primary)] -translate-y-1/2 hidden md:block transition-all duration-1000 ease-out"
//                 />

//                 {STEPS.map((step, index) => {
//                   const Icon = step.icon;
//                   const isActive = index <= currentStepIndex;
//                   const isCurrent = index === currentStepIndex;

//                   return (
//                     <div key={step.id} className="relative z-10 flex md:flex-col items-center gap-6 md:gap-0">
//                       <div className="relative">
//                         <motion.div 
//                           animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
//                           transition={{ repeat: Infinity, duration: 2 }}
//                           className={`w-16 h-16 md:w-20 md:h-20 rounded-[2rem] flex items-center justify-center transition-all duration-700 ${
//                             isActive 
//                               ? "bg-[var(--accent-navy)] text-[var(--brand-primary)] shadow-2xl shadow-[var(--accent-navy)]/30" 
//                               : "bg-[var(--neutral-light)] text-[var(--neutral-gray)]"
//                           } ${isCurrent ? "ring-[6px] ring-[var(--brand-orange-light)]" : ""}`}>
//                           <Icon size={isActive ? 32 : 28} />
//                         </motion.div>
//                         {isActive && !isCurrent && (
//                           <div className="absolute -top-1 -right-1 bg-[var(--brand-primary)] rounded-full p-1 text-[var(--accent-navy)]">
//                             <CheckCircle2 size={14} />
//                           </div>
//                         )}
//                       </div>

//                       <div className="md:absolute md:-bottom-16 md:left-1/2 md:-translate-x-1/2 md:text-center min-w-max">
//                         <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${isActive ? "text-[var(--accent-navy)]" : "text-[var(--neutral-gray)]"}`}>
//                           {step.label}
//                         </p>
//                         <p className="text-[9px] text-[var(--neutral-gray)] hidden md:block max-w-[100px] leading-tight">
//                           {step.desc}
//                         </p>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>

//               {/* DATA GRID */}
//               <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-20">
//                 <div className="group bg-[var(--neutral-light)] p-8 rounded-[2.5rem] hover:bg-[var(--accent-navy)] hover:text-[var(--neutral-white)] transition-all duration-500">
//                   <div className="flex items-center gap-3 mb-4 text-[var(--brand-primary)]">
//                     <MapPin size={18} />
//                     <span className="text-[10px] font-black uppercase tracking-widest">Destination</span>
//                   </div>
//                   <p className="font-bold text-lg leading-tight uppercase">{order.city || "Lagos, NG"}</p>
//                 </div>

//                 <div className="bg-[var(--neutral-light)] p-8 rounded-[2.5rem]">
//                   <div className="flex items-center gap-3 mb-4 text-[var(--neutral-gray)]">
//                     <Smartphone size={18} />
//                     <span className="text-[10px] font-black uppercase tracking-widest">Phone</span>
//                   </div>
//                   <p className="font-bold text-lg">{order.phone || "--- --- ---"}</p>
//                 </div>

//                 <div className="bg-[var(--neutral-light)] p-8 rounded-[2.5rem]">
//                   <div className="flex items-center gap-3 mb-4 text-[var(--neutral-gray)]">
//                     <Calendar size={18} />
//                     <span className="text-[10px] font-black uppercase tracking-widest">Ordered On</span>
//                   </div>
//                   <p className="font-bold text-lg">
//                     {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "TBD"}
//                   </p>
//                 </div>

//                 <div className="bg-[var(--brand-primary)] p-8 rounded-[2.5rem] flex flex-col justify-between">
//                   <span className="text-[10px] font-black uppercase text-[var(--accent-navy)]/60 tracking-widest">Est. Delivery</span>
//                   <div>
//                     <p className="text-3xl font-black italic text-[var(--accent-navy)]">24-48H</p>
//                     <p className="text-[10px] font-bold text-[var(--accent-navy)]/60">Priority Logistics</p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* SECURITY BADGE */}
//             <div className="mt-8 flex justify-center items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-[var(--neutral-gray)]">
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
  MapPin, Calendar, Smartphone, ShieldAlert
} from "lucide-react";

const STEPS = [
  { id: "PENDING", label: "Confirmed", icon: Clock, desc: "Order received" },
  { id: "PROCESSING", label: "Security", icon: ShieldCheck, desc: "Payment verified" },
  { id: "SHIPPED", label: "In Transit", icon: Truck, desc: "Logistics" },
  { id: "DELIVERED", label: "Dropped", icon: CheckCircle2, desc: "Delivered" },
];

export default function OrderTracker() {
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

  return (
    <div className="min-h-screen bg-[var(--neutral-white)] text-[var(--accent-navy)] selection:bg-[var(--brand-primary)]/30">
      
      {/* 🔔 RESPONSIVE NOTIFICATION */}
      <AnimatePresence>
        {showPush && order && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-4 xxs:top-8 left-1/2 -translate-x-1/2 z-[100] w-[95%] xxs:w-[90%] max-w-md"
          >
            <div className="bg-[var(--accent-navy)] backdrop-blur-md text-[var(--neutral-white)] p-4 xxs:p-5 rounded-[1.5rem] xxs:rounded-[2rem] shadow-2xl border border-white/10 flex items-center gap-3 xxs:gap-5">
              <div className="bg-[var(--brand-primary)] p-2 xxs:p-3 rounded-xl text-[var(--accent-navy)]">
                <BellRing size={18} className="animate-[ring_2s_infinite]" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[8px] xxs:text-[10px] font-black uppercase tracking-widest text-[var(--brand-primary)]">Update</h4>
                <p className="text-xs xxs:text-sm font-bold truncate">#{order.orderNumber} is {order.status}</p>
              </div>
              <button onClick={() => setShowPush(false)}><X size={18} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto px-4 xxs:px-6 pt-20 xxs:pt-32 pb-20">
        <header className="text-center mb-12 xxs:mb-20">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <span className="inline-block px-3 py-1 xxs:px-4 xxs:py-2 rounded-full bg-navy/5 text-[8px] xxs:text-[10px] font-black uppercase tracking-[0.2em] mb-4 xxs:mb-6">
              Logistics Terminal v2.0
            </span>
            <h1 className="text-4xl xxs:text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-[0.8] mb-8">
              Order <span className="text-transparent bg-clip-text bg-gradient-to-r from-navy to-primary">Tracker.</span>
            </h1>
          </motion.div>

          {/* 🔍 RESPONSIVE SEARCH BAR */}
          <form onSubmit={handleTrack} className="mt-8 xxs:mt-12 group relative max-w-2xl mx-auto">
            <div className="absolute -inset-1 bg-gradient-to-r from-navy to-primary rounded-[2rem] xxs:rounded-[2.5rem] blur opacity-10 group-focus-within:opacity-30 transition"></div>
            <div className="relative flex flex-col xs:flex-row p-1.5 xxs:p-2 bg-white rounded-[1.5rem] xxs:rounded-[2rem] shadow-xl border border-orange-light/20">
              <div className="hidden xs:flex items-center pl-4 text-navy/30">
                <Search size={20} />
              </div>
              <input
                type="text"
                placeholder="ORDER ID"
                className="flex-1 bg-transparent py-3 px-4 font-black text-lg xxs:text-xl outline-none uppercase placeholder:text-gray-200"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
              />
              <button 
                type="submit"
                disabled={loading}
                className="bg-[var(--accent-navy)] text-white py-3 xs:py-0 px-6 xxs:px-10 rounded-[1.2rem] xxs:rounded-[1.5rem] hover:bg-primary transition-all font-black uppercase tracking-widest flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <span>Locate</span>}
              </button>
            </div>
          </form>
        </header>

        {order && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* 📦 STATUS CARD */}
            <div className="bg-white rounded-[2.5rem] xxs:rounded-[4rem] p-6 xxs:p-8 md:p-16 shadow-2xl border border-orange-light/10 relative overflow-hidden">
              
              {/* TIMELINE: VERTICAL ON MOBILE (<MD), HORIZONTAL ON DESKTOP (>MD) */}
              <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8 xxs:gap-12 mb-16 xxs:mb-24">
                
                {/* Desktop Line */}
                <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gray-100 -translate-y-1/2 hidden md:block" />
                
                {/* Mobile Line (Vertical) */}
                <div className="absolute left-8 xxs:left-10 top-0 w-[2px] h-full bg-gray-100 md:hidden" />

                {STEPS.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;

                  return (
                    <div key={step.id} className="relative z-10 flex flex-row md:flex-col items-center gap-4 xxs:gap-6 md:gap-0">
                      <div className="relative">
                        <motion.div 
                          animate={isCurrent ? { scale: [1, 1.05, 1] } : {}}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className={`w-16 h-16 xxs:w-20 xxs:h-20 rounded-[1.8rem] xxs:rounded-[2.2rem] flex items-center justify-center transition-all duration-700 ${
                            isActive ? "bg-navy text-primary" : "bg-gray-50 text-gray-300"
                          } ${isCurrent ? "ring-4 ring-primary/20" : ""}`}
                        >
                          <Icon size={isActive ? 28 : 24} />
                        </motion.div>
                      </div>

                      <div className="md:absolute md:-bottom-16 md:left-1/2 md:-translate-x-1/2 md:text-center min-w-[120px]">
                        <p className={`text-[9px] xxs:text-[10px] font-black uppercase tracking-widest ${isActive ? "text-navy" : "text-gray-400"}`}>
                          {step.label}
                        </p>
                        <p className="text-[8px] xxs:text-[9px] text-gray-400 hidden xxs:block leading-tight">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 📊 DATA GRID: ADAPTIVE COLUMNS */}
              <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 xxs:gap-4 mt-12 xxs:mt-20">
                <div className="bg-gray-50 p-6 xxs:p-8 rounded-[2rem] xxs:rounded-[2.5rem]">
                  <div className="flex items-center gap-3 mb-2 text-primary"><MapPin size={16} /><span className="text-[8px] xxs:text-[10px] font-black uppercase">City</span></div>
                  <p className="font-bold text-base xxs:text-lg truncate uppercase">{order.city || "Lagos, NG"}</p>
                </div>

                <div className="bg-gray-50 p-6 xxs:p-8 rounded-[2rem] xxs:rounded-[2.5rem]">
                  <div className="flex items-center gap-3 mb-2 text-gray-400"><Smartphone size={16} /><span className="text-[8px] xxs:text-[10px] font-black uppercase">Phone</span></div>
                  <p className="font-bold text-base xxs:text-lg">{order.phone || "---"}</p>
                </div>

                <div className="bg-gray-50 p-6 xxs:p-8 rounded-[2rem] xxs:rounded-[2.5rem]">
                  <div className="flex items-center gap-3 mb-2 text-gray-400"><Calendar size={16} /><span className="text-[8px] xxs:text-[10px] font-black uppercase">Date</span></div>
                  <p className="font-bold text-base xxs:text-lg">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "TBD"}</p>
                </div>

                <div className="bg-primary p-6 xxs:p-8 rounded-[2rem] xxs:rounded-[2.5rem] flex flex-col justify-between min-h-[120px]">
                  <span className="text-[8px] xxs:text-[10px] font-black uppercase text-navy/60">Est. Delivery</span>
                  <p className="text-2xl xxs:text-3xl font-black italic text-navy leading-none">24-48H</p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-center items-center gap-4 text-[8px] xxs:text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">
              <ShieldCheck size={14} className="flex-shrink-0" />
              <span>End-to-End Encrypted Logistics Data</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
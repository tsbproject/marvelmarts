"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Truck,
  CheckCircle2,
  Search,
  Clock,
  ShieldCheck,
  BellRing,
  X,
  Loader2,
  MapPin,
  Calendar,
  Smartphone,
} from "lucide-react";

const STEPS = [
  { id: "PENDING", label: "Confirmed", icon: Clock, desc: "Order received" },
  { id: "PROCESSING", label: "Security", icon: ShieldCheck, desc: "Payment verified" },
  { id: "SHIPPED", label: "In Transit", icon: Truck, desc: "Logistics" },
  { id: "DELIVERED", label: "Dropped", icon: CheckCircle2, desc: "Delivered" },
];

export default function OrderTracker() {
  const [orderNumber, setOrderNumber] = useState("");
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
    if (!orderNumber.trim()) return;

    setLoading(true);
    setShowPush(false);
    setOrder(null);

    try {
      const res = await fetch(
        `/api/orders/track?orderNumber=${encodeURIComponent(orderNumber.trim())}`
      );
      const data = await res.json();

      if (!res.ok) {
        console.error("Tracking error:", data?.error || "Order not found");
        setOrder(null);
        return;
      }

      setOrder(data);
    } catch (err) {
      console.error("Tracking error:", err);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const currentStepIndex = STEPS.findIndex(
    (step) => step.id === String(order?.status || "").toUpperCase()
  );

  return (
    <div className="min-h-screen bg-(--neutral-white) text-(--accent-navy) selection:bg-(--brand-primary)/30">
      <AnimatePresence>
        {showPush && order && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-4 xxs:top-8 left-1/2 -translate-x-1/2 z-100 w-[95%] xxs:w-[90%] max-w-md"
          >
            <div className="bg-(--accent-navy) backdrop-blur-md text-(--neutral-white) p-4 xxs:p-5 rounded-[1.5rem] xxs:rounded-[2rem] shadow-2xl border border-white/10 flex items-center gap-3 xxs:gap-5">
              <div className="bg-(--brand-primary) p-2 xxs:p-3 rounded-xl text-(--accent-navy)">
                <BellRing size={18} className="animate-[ring_2s_infinite]" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[8px] xxs:text-[10px] font-black uppercase tracking-widest text-(--brand-primary)">
                  Update
                </h4>
                <p className="text-xs xxs:text-sm font-bold truncate">
                  #{order.orderNumber} is {order.status}
                </p>
              </div>
              <button onClick={() => setShowPush(false)}>
                <X size={18} />
              </button>
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
              Order{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-navy to-primary">
                Tracker.
              </span>
            </h1>
          </motion.div>

          <form onSubmit={handleTrack} className="mt-8 xxs:mt-12 group relative max-w-2xl mx-auto">
            <div className="absolute -inset-1 bg-linear-to-r from-navy to-primary rounded-[2rem] xxs:rounded-[2.5rem] blur opacity-10 group-focus-within:opacity-30 transition" />
            <div className="relative flex flex-col xs:flex-row p-1.5 xxs:p-2 bg-white rounded-[1.5rem] xxs:rounded-[2rem] shadow-xl border border-orange-light/20">
              <div className="hidden xs:flex items-center pl-4 text-navy/30">
                <Search size={20} />
              </div>
              <input
                type="text"
                placeholder="ORDER NUMBER"
                className="flex-1 bg-transparent py-3 px-4 font-black text-lg xxs:text-xl outline-none uppercase placeholder:text-gray-200"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-(--accent-navy) text-white py-3 xs:py-0 px-6 xxs:px-10 rounded-[1.2rem] xxs:rounded-[1.5rem] hover:bg-primary transition-all font-black uppercase tracking-widest flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <span>Locate</span>}
              </button>
            </div>
          </form>
        </header>

        {order && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="bg-white rounded-[2.5rem] xxs:rounded-[4rem] p-6 xxs:p-8 md:p-16 shadow-2xl border border-orange-light/10 relative overflow-hidden">
              <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8 xxs:gap-12 mb-16 xxs:mb-24">
                <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gray-100 -translate-y-1/2 hidden md:block" />
                <div className="absolute left-8 xxs:left-10 top-0 w-[2px] h-full bg-gray-100 md:hidden" />

                {STEPS.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;

                  return (
                    <div
                      key={step.id}
                      className="relative z-10 flex flex-row md:flex-col items-center gap-4 xxs:gap-6 md:gap-0"
                    >
                      <div className="relative">
                        <motion.div
                          animate={isCurrent ? { scale: [1, 1.05, 1] } : {}}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className={`w-16 h-16 xxs:w-20 xxs:h-20 rounded-[1.8rem] xxs:rounded-[2.2rem] flex items-center justify-center transition-all duration-700 ${
                            isActive ? "bg-navy text-primary" : "bg-gray-50 text-gray-300"
                          } ${isCurrent ? "ring-4 ring-brand-primary" : ""}`}
                        >
                          <Icon size={isActive ? 28 : 24} />
                        </motion.div>
                      </div>

                      <div className="md:absolute md:-bottom-16 md:left-1/2 md:-translate-x-1/2 md:text-center min-w-[120px]">
                        <p
                          className={`text-[9px] xxs:text-[10px] font-black uppercase tracking-widest ${
                            isActive ? "text-navy" : "text-gray-400"
                          }`}
                        >
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

              <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 xxs:gap-4 mt-12 xxs:mt-20">
                <div className="bg-gray-50 p-6 xxs:p-8 rounded-[2rem] xxs:rounded-[2.5rem]">
                  <div className="flex items-center gap-3 mb-2 text-primary">
                    <MapPin size={16} />
                    <span className="text-[8px] xxs:text-[10px] font-black uppercase">City</span>
                  </div>
                  <p className="font-bold text-base xxs:text-lg truncate uppercase">
                    {order.city || "Lagos, NG"}
                  </p>
                </div>

                <div className="bg-gray-50 p-6 xxs:p-8 rounded-[2rem] xxs:rounded-[2.5rem]">
                  <div className="flex items-center gap-3 mb-2 text-gray-400">
                    <Smartphone size={16} />
                    <span className="text-[8px] xxs:text-[10px] font-black uppercase">Phone</span>
                  </div>
                  <p className="font-bold text-base xxs:text-lg">{order.phone || "---"}</p>
                </div>

                <div className="bg-gray-50 p-6 xxs:p-8 rounded-[2rem] xxs:rounded-[2.5rem]">
                  <div className="flex items-center gap-3 mb-2 text-gray-400">
                    <Calendar size={16} />
                    <span className="text-[8px] xxs:text-[10px] font-black uppercase">Date</span>
                  </div>
                  <p className="font-bold text-base xxs:text-lg">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "TBD"}
                  </p>
                </div>

                <div className="bg-brand-primary p-6 xxs:p-8 rounded-[2rem] xxs:rounded-[2.5rem] flex flex-col justify-between min-h-[120px]">
                  <span className="text-[8px] xxs:text-[10px] font-black uppercase text-navy/60">
                    Est. Delivery
                  </span>
                  <p className=" text-xl md:text-2xl font-black italic text-accent-navy leading-none">
                    24-48Hrs
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-center items-center gap-4 text-[8px] xxs:text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">
              <ShieldCheck size={14} className="shrink-0" />
              <span>End-to-End Encrypted Logistics Data</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
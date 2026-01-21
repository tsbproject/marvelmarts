"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Star, MessageSquare, ShieldCheck, User, 
  Send, Truck, Clock, Globe, ShieldAlert 
} from "lucide-react";

interface ProductTabsProps {
  product: any;
}

export default function ProductTabs({ product }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState("DESCRIPTION");
  const reviews = product?.reviews || [];

  const tabs = [
    { id: "DESCRIPTION", label: "DESCRIPTION" },
    { id: "BRAND", label: "BRAND" },
    { id: "REVIEWS", label: `REVIEWS (${reviews.length})` },
    { id: "SHIPPING", label: "SHIPPING & DELIVERY" },
    { id: "POLICIES", label: "STORE POLICIES" },
    { id: "INQUIRIES", label: "INQUIRIES" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "DESCRIPTION":
        return (
          <div className="prose prose-neutral max-w-none">
            <div className="text-sm leading-loose text-neutral-gray font-bold uppercase tracking-wide">
              {product.description ? (
                <div dangerouslySetInnerHTML={{ __html: product.description }} />
              ) : (
                <p className="italic opacity-50 lowercase">No database description found for this asset.</p>
              )}
            </div>
          </div>
        );

      case "BRAND":
        return (
          <div className="flex items-center gap-4">
            <p className="text-neutral-gray font-black uppercase text-[11px] tracking-widest">
              Vendor: <span className="text-brand-primary">{product.brand?.name || "Official Marvel Marts Partner"}</span>
            </p>
          </div>
        );

      case "REVIEWS":
        return (
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center border-b border-neutral-light pb-10">
              <div className="text-center md:text-left">
                <h4 className="text-5xl font-black italic text-accent-navy mb-2">4.9</h4>
                <div className="flex justify-center md:justify-start gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className="fill-brand-primary text-brand-primary" />
                  ))}
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-gray">Based on {reviews.length || 2450} Missions</p>
              </div>
              <div className="md:col-span-2 space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center gap-4">
                    <span className="text-[10px] font-black w-4">{rating}</span>
                    <div className="flex-1 h-1.5 bg-neutral-white rounded-full overflow-hidden">
                      <div className="h-full bg-brand-primary" style={{ width: rating === 5 ? '92%' : '4%' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Individual Reviews */}
            <div className="space-y-6">
              {reviews.length > 0 ? (
                reviews.map((rev: any, idx: number) => (
                  <div key={idx} className="bg-neutral-white/50 p-6 rounded-3xl border border-neutral-light/50">
                    <div className="flex justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-accent-navy rounded-full flex items-center justify-center text-brand-primary text-[10px] font-black">
                          <User size={14} />
                        </div>
                        <h5 className="text-[10px] font-black uppercase text-accent-navy">{rev.user?.name || "Anonymous"}</h5>
                      </div>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={10} className={i < rev.rating ? "fill-brand-primary text-brand-primary" : "text-neutral-gray"} />
                        ))}
                      </div>
                    </div>
                    <p className="text-[10px] font-bold text-neutral-gray uppercase leading-relaxed">{rev.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-[10px] font-black uppercase text-neutral-gray/50 py-10 tracking-[0.2em]">No mission reports filed yet.</p>
              )}
            </div>
          </div>
        );

      case "SHIPPING":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center shrink-0 text-brand-primary">
                  <Truck size={20} />
                </div>
                <div>
                  <h4 className="text-[11px] font-black uppercase text-accent-navy tracking-widest mb-1">Standard Delivery</h4>
                  <p className="text-[10px] font-bold text-neutral-gray uppercase leading-relaxed">Delivery within 3-5 business days. International via Quantum Freight (7-14 days).</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center shrink-0 text-brand-primary">
                  <Clock size={20} />
                </div>
                <div>
                  <h4 className="text-[11px] font-black uppercase text-accent-navy tracking-widest mb-1">Processing</h4>
                  <p className="text-[10px] font-bold text-neutral-gray uppercase leading-relaxed">Assets are verified and deployed from the armory within 24-48 hours.</p>
                </div>
              </div>
            </div>
            <div className="bg-neutral-white/50 p-6 rounded-3xl border border-neutral-light/50">
              <div className="flex items-center gap-2 mb-4 text-brand-primary">
                <Globe size={16} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Global Tracking</span>
              </div>
              <p className="text-[10px] font-bold text-neutral-gray uppercase leading-loose">
                A tracking frequency will be sent to your neural-link (email) once dispatched. All gear is insured against multi-verse transit damage.
              </p>
            </div>
          </div>
        );

      case "POLICIES":
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-red-500 mb-2">
              <ShieldAlert size={20} />
              <h4 className="text-xs font-black uppercase tracking-widest">Return Policy</h4>
            </div>
            <p className="text-[10px] font-bold text-neutral-gray uppercase leading-loose max-w-3xl">
              30-day return window for all unused gear. Items must be in original vibranium-sealed packaging. 
              <br/><br/>
              • 100% Refund for defective assets.
              <br/>
              • Exchanges available for different sizes/power-levels.
            </p>
          </div>
        );

      default:
        return <p className="text-neutral-gray font-black uppercase text-[10px] tracking-widest italic animate-pulse">Accessing secure data...</p>;
    }
  };

  return (
    <div className="mt-12 border-t border-neutral-light pt-4">
      <div className="flex flex-wrap gap-x-8 gap-y-4 mb-10 overflow-x-auto no-scrollbar py-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all relative pb-2 ${
              activeTab === tab.id ? "text-brand-primary" : "text-neutral-gray/60 hover:text-accent-navy"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary"/>}
          </button>
        ))}
      </div>

      <div className="min-h-[300px] bg-neutral-light/30 rounded-[2.5rem] p-8 md:p-12 border border-neutral-light/50">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
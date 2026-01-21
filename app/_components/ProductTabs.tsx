"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ProductTabsProps {
  product: any;
}

export default function ProductTabs({ product }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState("DESCRIPTION");

  const tabs = [
    { id: "DESCRIPTION", label: "DESCRIPTION" },
    { id: "BRAND", label: "BRAND" },
    { id: "REVIEWS", label: `REVIEWS (${product?.reviews?.length || 0})` },
    { id: "SHIPPING", label: "SHIPPING & DELIVERY" },
    { id: "OFFERS", label: "MORE OFFERS" },
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
                // Renders strictly what is in your database
                <div dangerouslySetInnerHTML={{ __html: product.description }} />
              ) : (
                <p className="italic opacity-50 lowercase">No database description found for this item.</p>
              )}
            </div>
          </div>
        );
      case "BRAND":
        return (
          <p className="text-neutral-gray font-black uppercase text-[11px] tracking-widest">
            {product.brand?.name || "Official Marvel Marts Partner"}
          </p>
        );
      default:
        return (
          <p className="text-neutral-gray font-black uppercase text-[10px] tracking-widest italic animate-pulse">
            Fetching {activeTab.toLowerCase()} data...
          </p>
        );
    }
  };

  return (
    <div className="mt-12 border-t border-neutral-light pt-4">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-x-8 gap-y-4 mb-10 overflow-x-auto no-scrollbar py-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all relative pb-2 ${
              activeTab === tab.id 
                ? "text-brand-primary" 
                : "text-neutral-gray/60 hover:text-accent-navy"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div 
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary"
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content Box */}
      <div className="min-h-[200px] bg-neutral-light/30 rounded-[2.5rem] p-8 md:p-12 border border-neutral-light/50">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
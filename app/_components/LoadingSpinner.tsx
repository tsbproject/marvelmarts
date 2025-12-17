"use client";

import { motion } from "framer-motion";

export default function LoadingSpinner() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center bg-black/40 z-999"
    >
      <div className="flex flex-col items-center space-y-4">
        {/* Dual Ring Spinner */}
        <div className="w-16 h-16 relative">
          <div className="absolute inset-0 rounded-full border-4 border-accent-navy border-t-transparent animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-4 border-brand-primary border-b-transparent animate-spin-slow"></div>
        </div>
        <p className="text-white font-medium text-lg">Loading...</p>
      </div>
    </motion.div>
  );
}

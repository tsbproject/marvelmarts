"use client";

import { motion } from "framer-motion";

export default function LoadingSpinner() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      // Use backdrop-blur sparingly as it's heavy, but bg-black/40 is fine
      className="fixed inset-0 flex items-center justify-center bg-black/60 z-[9999] backdrop-blur-[2px]"
    >
      <div className="flex flex-col items-center space-y-6">
        {/* Dual Ring Spinner - Using Framer Motion for GPU acceleration */}
        <div className="w-15 h-15 relative">
          {/* Outer Ring - Brand Navy */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="absolute inset-0 rounded-full border-4 border-[#002B5B] border-t-transparent"
          />
          {/* Inner Ring - Brand Orange */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="absolute inset-3 rounded-full border-4 border-[#F7931E] border-b-transparent"
          />
        </div>
        
        <motion.p 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-white font-black uppercase tracking-[0.2em] text-xs"
        >
          Marvel Marts
        </motion.p>
      </div>
    </motion.div>
  );
}
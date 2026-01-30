"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-accent-navy flex items-center justify-center px-6 text-center">
      <div className="max-w-xl">
        {/* Logo area */}
        <div className="mb-10 flex justify-center">
          <Image src="/logo.png" 
          width={180}
          height={100}
           alt="MarvelMarts" 
           className="h-35 w-auto" />

        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-black italic uppercase text-white tracking-tighter mb-6">
            Upgrading the <span className="text-brand-primary">Experience</span>
          </h1>
          <p className="text-blue-200 text-lg font-bold uppercase tracking-widest mb-10">
            We are currently fine-tuning the Mart. Check back in a few minutes.
          </p>
          
          <div className="inline-block px-8 py-1 border border-white/20 rounded-full">
            <span className="text-xs text-white/50 font-black uppercase tracking-[0.3em] animate-pulse">
              System Optimization in Progress
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
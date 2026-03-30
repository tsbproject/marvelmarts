


"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { clearCart } from "@/store/cartSlice";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Package, Loader2, ShoppingBag } from "lucide-react";

export default function ThankYouPage() {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");

  const [verifying, setVerifying] = useState(true);
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    if (!orderNumber) {
      setVerifying(false);
      return;
    }

    let checkCount = 0;
    const maxChecks = 5;

    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/orders/verify/${orderNumber}`);
        const data = await res.json();

        if (data.paid) {
          setIsPaid(true);
          setVerifying(false);
          dispatch(clearCart());
        } else if (checkCount < maxChecks) {
          checkCount++;
          setTimeout(checkStatus, 2000);
        } else {
          setVerifying(false);
        }
      } catch (err) {
        console.error("Verification error:", err);
        setVerifying(false);
      }
    };

    checkStatus();
  }, [orderNumber, dispatch]);

  // --- LOADING STATE ---
  if (verifying) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="relative">
          <Loader2 className="animate-spin text-brand-primary mb-6" size={48} />
          <div className="absolute inset-0 bg-brand-primary/10 blur-2xl rounded-full" />
        </div>
        <h2 className="text-xl font-black uppercase italic tracking-tighter text-accent-navy">
          Securing your order...
        </h2>
        <p className="text-[10px] font-bold text-neutral-gray/60 uppercase tracking-[0.2em] mt-2">
          Verifying Payment Gateway
        </p>
      </div>
    );
  }

  // --- FAILURE STATE ---
  if (!isPaid) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-red-50/50 rounded-[2.5rem] p-8 sm:p-12 border border-red-100 text-center"
        >
          <XCircle className="text-red-500 mx-auto mb-6" size={64} />
          <h1 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tighter text-red-900 mb-4">
            Payment Unconfirmed
          </h1>
          <p className="text-sm text-red-700/70 font-medium leading-relaxed mb-8">
            We haven't received confirmation from the gateway yet. If your account was debited, please contact <span className="font-black underline"><Link href="/support"> MarvelMarts Support</Link> </span> immediately.
          </p>
          <Link 
            href="/cart" 
            className="inline-flex w-full py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] justify-center active:scale-95 transition-all shadow-lg shadow-red-200"
          >
            Return to Cart
          </Link>
        </motion.div>
      </div>
    );
  }

  // --- SUCCESS STATE ---
  return (
    <div className="min-h-screen bg-gray-50/30 flex items-center justify-center p-4 sm:p-6 lg:p-10">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-lg w-full bg-white rounded-[2.5rem] sm:rounded-[3.5rem] p-8 sm:p-12 lg:p-16 shadow-[0_32px_64px_-15px_rgba(0,0,0,0.08)] border border-gray-100 text-center relative overflow-hidden"
      >
        {/* Aesthetic Background Detail */}
        <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-brand-primary via-blue-400 to-brand-primary" />
        
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-green-50 text-green-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 sm:mb-10 shadow-inner">
          <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black italic uppercase tracking-tighter text-accent-navy mb-3">
          Order <span className="text-brand-primary">Confirmed</span>
        </h1>
        <p className="text-neutral-gray/40 font-black uppercase text-[9px] sm:text-[10px] tracking-[0.3em] mb-8 sm:mb-12">
          Protocol: Transaction Successful
        </p>

        <div className="bg-gray-50/80 backdrop-blur-sm rounded-3xl p-6 sm:p-8 mb-8 sm:mb-12 text-left border border-gray-100">
          <div className="flex justify-between items-center mb-5 pb-5 border-b border-gray-200/50">
            <span className="text-[9px] sm:text-[10px] font-black uppercase text-neutral-gray/50 tracking-widest">Order Reference</span>
            <span className="text-xs sm:text-sm font-black text-accent-navy tracking-tight">
              #{orderNumber?.slice(-10).toUpperCase() || "INTERNAL-ERR"}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-gray/70 font-bold italic leading-relaxed">
            Payment verified. Our fulfillment logistics are now active. You will receive a secure dispatch notification shortly.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Link 
            href="/account/customer/orders" 
            className="w-full py-4 sm:py-5 bg-accent-navy text-white rounded-2xl font-black uppercase text-[9px] sm:text-[10px] tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-brand-primary transition-all shadow-xl shadow-accent-navy/20 active:scale-95"
          >
            <Package className="w-4 h-4" /> Track Status
          </Link>
          <Link 
            href="/shop" 
            className="w-full py-4 sm:py-5 bg-white border border-gray-200 text-neutral-gray rounded-2xl font-black uppercase text-[9px] sm:text-[10px] tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-gray-50 transition-all active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" /> Market
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
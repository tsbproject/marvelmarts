"use client";

import { useState, useEffect, useMemo } from "react"; 
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, X, Trash2, ArrowRight, Plus, Minus, ShoppingCart, } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { removeFromCart, addToCart } from "@/store/cartSlice";
import { useNotification } from "@/app/_context/NotificationContext";

export default function CartDrawer() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false); 
  const dispatch = useDispatch();
  const { notifyInfo } = useNotification();

  // 1. Pull cart items from Redux
  const cartItems = useSelector((state: RootState) => state.cart?.items || []);

  // 2. Hydration Fix: Only render dynamic data after mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // 3. Calculate subtotal using Redux items
  const subtotal = useMemo(() => {
    return cartItems.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
  }, [cartItems]);

  // Handler for quantity adjustments
  const handleUpdateQty = (item: any, delta: number) => {
    if (item.quantity + delta > 0) {
      dispatch(addToCart({ product: item, quantity: delta }));
    } else {
      dispatch(removeFromCart(item.id));
      notifyInfo(`${item.title} removed from stash.`);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button onClick={() => setOpen(true)} className="group relative p-2 transition-transform active:scale-90">
        <ShoppingCart className="w-7 h-7 xxs:w-5 xxs:h-5 2xl:w-5 2xl:h-5 text-brand-primary group-hover:text-blue-600 transition-colors" />
        <span className=" absolute text-md 2xl:text-[13px] font-medium top-3 -right-7 text-gray-50 hidden lg:block ">Cart</span>
        
        {/* Only show badge once mounted to prevent SSR mismatch */}
        {mounted && cartItems.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-brand-primary text-neutral-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-neutral-white shadow-lg">
            {cartItems.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-accent-navy/40 backdrop-blur-sm z-40"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 w-full max-w-[400px] h-full bg-neutral-white shadow-2xl z-1001 flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-neutral-light flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter text-accent-navy">
                    Your <span className="text-brand-primary">Cart</span>
                  </h2>
                  <p className="text-xs font-bold text-neutral-gray uppercase tracking-widest">
                    {mounted ? cartItems.length : 0} Items Selected
                  </p>
                </div>
                <button onClick={() => setOpen(false)} className="p-2 hover:bg-neutral-light rounded-full transition-colors">
                  <X className="w-6 h-6 text-neutral-gray" />
                </button>
              </div>

              {/* Items Area */}
              <div className="flex-1 overflow-y-auto p-6">
                {!mounted || cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                    <div className="bg-neutral-light p-10 rounded-full animate-pulse">
                      <ShoppingCart className="w-16 h-16 text-neutral-gray/30" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xl font-black italic text-accent-navy uppercase">Your cart is empty</p>
                      <p className="text-sm text-neutral-gray font-medium max-w-[200px] mx-auto">
                        Don't miss out on the latest Marvel gear!
                      </p>
                    </div>
                    <Link 
                      href="/shop" 
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 bg-brand-primary text-neutral-white px-8 py-4 rounded-xl font-black uppercase text-sm tracking-widest hover:scale-105 transition-transform shadow-lg shadow-brand-primary/20"
                    >
                      Explore Shop <ArrowRight size={18} />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {cartItems.map((item: any) => (
                      <div key={item.id} className="flex gap-4 group">
                        <div className="relative w-20 h-20 bg-neutral-light rounded-xl overflow-hidden border border-neutral-light flex-shrink-0">
                         <Image
                         // Safely check if imageUrl exists and isn't the broken placeholder
                              src={
                                item.imageUrl && item.imageUrl !== "/images/placeholder.jpg"
                                  ? item.imageUrl
                                  : "/logo.png" // Use your actual logo file in public/logo.png
                              }
                              alt={item.title}
                              width={80}
                              height={80}
                              className="object-contain rounded-lg"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between">
                            <h4 className="font-bold text-accent-navy truncate uppercase text-sm">{item.title}</h4>
                            <button 
                              onClick={() => {
                                dispatch(removeFromCart(item.id));
                                notifyInfo(`${item.title} removed from stash.`);
                              }}
                              className="text-neutral-gray hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <p className="text-[10px] text-neutral-gray font-bold uppercase">Standard Issue</p>
                          
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center border border-neutral-light rounded-lg px-2 py-1 gap-3">
                              <button 
                                onClick={() => handleUpdateQty(item, -1)}
                                className="text-neutral-gray hover:text-brand-primary"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="text-xs font-black text-accent-navy">{item.quantity}</span>
                              <button 
                                onClick={() => handleUpdateQty(item, 1)}
                                className="text-neutral-gray hover:text-brand-primary"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                            <span className="text-sm font-black text-brand-primary">
                              ₦{(item.price * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {mounted && cartItems.length > 0 && (
                <div className="p-6 bg-neutral-light border-t border-neutral-light space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-black text-neutral-gray uppercase tracking-widest">Subtotal</span>
                    <span className="text-2xl font-black text-accent-navy">₦{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Link href="/cart" onClick={() => setOpen(false)} className="flex items-center justify-center py-4 rounded-xl font-bold text-xs uppercase border-2 border-neutral-gray/20 text-neutral-gray hover:bg-neutral-white transition-all">
                      View Cart
                    </Link>
                    <Link href="/checkout" onClick={() => setOpen(false)} className="flex items-center justify-center gap-2 py-4 rounded-xl font-black text-xs uppercase bg-accent-navy text-neutral-white hover:bg-brand-primary transition-all shadow-lg shadow-accent-navy/20">
                      Checkout <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
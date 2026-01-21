



"use client";

import { useEffect, useState, useMemo } from "react";
import { useSessionContext } from "@/app/_context/useSessionContext";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ChevronLeft } from "lucide-react";

interface CartItem {
  id: number;
  product: { id: number; title: string; imageUrl: string };
  variant: { id: number; name?: string } | null;
  qty: number;
  unitPrice: number;
}

interface Cart {
  id: number | null;
  userId: number | null;
  items: CartItem[];
}

export default function CartPage() {
  const { session, status } = useSessionContext();
  const [cart, setCart] = useState<Cart | null>(null);

  const subtotal = useMemo(() => {
    return cart?.items.reduce((acc, item) => acc + (item.unitPrice * item.qty), 0) || 0;
  }, [cart?.items]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      fetch("/api/cart")
        .then((res) => res.json())
        .then((data) => setCart(data))
        .catch(console.error);
    } else if (status === "unauthenticated") {
      const guestCart = localStorage.getItem("guestCart");
      if (guestCart) {
        setCart(JSON.parse(guestCart));
      } else {
        setCart({ id: null, userId: null, items: [] });
      }
    }
  }, [status, session]);

  if (status === "loading") return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-white">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
    </div>
  );

  if (!cart) return null;

  return (
    <div className="bg-neutral-white min-h-screen pb-20">
      <div className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 border-b border-neutral-light pb-8">
          <div>
            <Link href="/shop" className="text-neutral-gray flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:text-brand-primary transition-colors mb-4">
              <ChevronLeft size={16} /> Back to Shop
            </Link>
            <div className="flex items-center gap-4">
              <ShoppingBag className="w-10 h-10 text-brand-primary" />
              <h1 className="text-5xl font-black italic uppercase tracking-tighter text-accent-navy">
                Your <span className="text-brand-primary">Cart</span>
              </h1>
            </div>
          </div>
          <p className="text-neutral-gray font-bold uppercase tracking-widest text-sm">
            Total Items: {cart.items.length}
          </p>
        </div>

        {cart.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center space-y-8 py-20 bg-neutral-light rounded-3xl">
            <div className="relative">
                <ShoppingBag className="w-24 h-24 text-neutral-gray/20" />
                <div className="absolute -top-2 -right-2 bg-brand-primary w-6 h-6 rounded-full animate-ping" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black italic uppercase text-accent-navy">Your stash is empty</h2>
              <p className="text-neutral-gray font-medium max-w-md mx-auto">
                Looks like you haven't grabbed any gear yet. The multiverse is waiting!
              </p>
            </div>
            <Link href="/shop" className="bg-brand-primary text-neutral-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-xl shadow-brand-primary/20">
              Start Looting
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Items List */}
            <div className="lg:col-span-2 space-y-6">
              {cart.items.map((item) => (
                <div key={item.id} className="group relative flex flex-col sm:flex-row gap-6 p-6 bg-neutral-white border border-neutral-light rounded-3xl hover:border-brand-primary/30 transition-all hover:shadow-xl hover:shadow-accent-navy/5">
                  <div className="relative w-full sm:w-40 h-40 bg-neutral-light rounded-2xl overflow-hidden flex-shrink-0">
                    <Image
                      src={item.product.imageUrl}
                      alt={item.product.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between py-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-black italic uppercase text-accent-navy leading-tight">
                          {item.product.title}
                        </h3>
                        <p className="text-xs font-bold text-neutral-gray uppercase tracking-widest mt-1">
                          {item.variant?.name || "Standard Issue"}
                        </p>
                      </div>
                      <button className="text-neutral-gray hover:text-red-500 transition-colors p-2">
                        <Trash2 size={20} />
                      </button>
                    </div>

                    <div className="flex flex-wrap items-end justify-between gap-4 mt-6">
                      <div className="flex items-center bg-neutral-light rounded-xl p-1 gap-4 border border-neutral-light">
                        <button className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-neutral-white text-accent-navy hover:text-brand-primary transition-all">
                          <Minus size={16} />
                        </button>
                        <span className="font-black text-accent-navy text-lg w-4 text-center">{item.qty}</span>
                        <button className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-neutral-white text-accent-navy hover:text-brand-primary transition-all">
                          <Plus size={16} />
                        </button>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-xs font-bold text-neutral-gray uppercase mb-1">Price</p>
                        <span className="text-2xl font-black text-brand-primary italic">
                          ₦{(item.unitPrice * item.qty).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-accent-navy rounded-3xl p-8 sticky top-24 text-neutral-white shadow-2xl shadow-accent-navy/20">
                <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-8 border-b border-neutral-white/10 pb-4">
                  Order <span className="text-brand-primary">Summary</span>
                </h2>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-neutral-white/70">
                    <span className="text-xs font-bold uppercase tracking-widest">Subtotal</span>
                    <span className="font-bold">₦{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-neutral-white/70">
                    <span className="text-xs font-bold uppercase tracking-widest">Shipping</span>
                    <span className="text-xs font-bold uppercase">Calculated at next step</span>
                  </div>
                </div>

                <div className="border-t border-neutral-white/10 pt-6 mb-8">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-black uppercase tracking-[0.2em]">Grand Total</span>
                    <span className="text-3xl font-black text-brand-primary italic">₦{subtotal.toLocaleString()}</span>
                  </div>
                </div>

                <Link href="/checkout" className="flex items-center justify-center gap-3 w-full bg-brand-primary text-neutral-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-brand-light transition-all shadow-lg shadow-brand-primary/20 group">
                  Proceed to Checkout <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                </Link>
                
                <p className="text-[10px] text-center text-neutral-white/40 mt-6 font-bold uppercase tracking-widest leading-relaxed">
                  Secure 256-bit encrypted checkout environment
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

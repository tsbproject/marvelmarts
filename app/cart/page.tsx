"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ChevronLeft } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { removeFromCart, updateQuantity, CartItem } from "@/store/cartSlice";
import { useNotification } from "@/app/_context/NotificationContext";

export default function CartPage() {
  const dispatch = useDispatch();
  const { notifySuccess } = useNotification();
  
  // 1. Access items from Redux with the correct CartItem type
  const cartItems = useSelector((state: RootState) => state.cart.items);

  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }, [cartItems]);

  // 2. Updated handlers with strict 'string' ID typing
  const handleRemove = (id: string, variantId: string | null) => {
    dispatch(removeFromCart({ id, variantId }));
    notifySuccess("Item removed from stash!");
  };

  const handleQtyChange = (id: string, variantId: string | null, newQty: number) => {
    if (newQty < 1) return;
    dispatch(updateQuantity({ id, variantId, quantity: newQty }));
  };

  return (
    <div className="bg-neutral-white min-h-screen pb-20">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 border-b border-neutral-light pb-8">
          <div>
            <Link href="/shop" className="text-neutral-gray flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] hover:text-brand-primary transition-colors mb-4 group">
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
              Return to shop Armory
            </Link>
            <div className="flex items-center gap-4">
              <ShoppingBag className="w-12 h-12 text-brand-primary" />
              <h1 className="text-lg md:text-3xl font-black italic uppercase tracking-tighter text-accent-navy leading-none">
                Your <span className="text-brand-primary">Order</span>
              </h1>
            </div>
          </div>
          <p className="text-neutral-gray font-black uppercase tracking-widest text-[10px] bg-neutral-light px-4 py-2 rounded-full">
            Active Assets: {cartItems.length}
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center space-y-8 py-32 bg-neutral-light rounded-[3rem] border-2 border-dashed border-neutral-gray/20">
            <div className="relative">
               <ShoppingBag className="w-24 h-24 text-neutral-gray/10" />
               <div className="absolute inset-0 flex items-center justify-center">
                 <span className="text-4xl font-black text-neutral-gray/20">?</span>
               </div>
            </div>
            <h2 className="text-3xl font-black italic uppercase text-neutral-gray/40">Your cart is empty</h2>
            <Link href="/shop" className="bg-accent-navy text-neutral-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-brand-primary transition-all shadow-xl active:scale-95">
              Acquire Your Favorite Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            {/* Loot List */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item: CartItem) => (
                <div 
                  key={`${item.id}-${item.variantId || 'base'}`} 
                  className="group flex flex-col sm:flex-row gap-6 p-6 bg-neutral-white border border-neutral-light rounded-[2.5rem] hover:border-brand-primary/30 transition-all shadow-sm hover:shadow-2xl"
                >
                  {/* Thumbnail */}
                  <div className="relative w-full sm:w-32 h-32 bg-neutral-light rounded-[1.5rem] overflow-hidden flex-shrink-0 border border-neutral-light">
                    <Image
                      src={item.imageUrl || "/placeholder-product.png"}
                      alt={item.title}
                      fill
                      sizes="128px"
                      className="object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <Link href={`/products/${item.slug}`}>
                          <h3 className="text-lg font-black italic uppercase text-accent-navy hover:text-brand-primary transition-colors leading-tight">
                            {item.title}
                          </h3>
                        </Link>
                        <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] mt-1.5 opacity-80">
                          {item.variantName || "Standard Spec"}
                        </p>
                      </div>
                      <button 
                        onClick={() => handleRemove(item.id, item.variantId)}
                        className="text-neutral-gray hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-xl"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="flex flex-wrap items-end justify-between gap-4 mt-6">
                      {/* Quantity Control */}
                      <div className="flex items-center bg-neutral-light rounded-xl p-1 border border-neutral-light/50">
                        <button 
                          onClick={() => handleQtyChange(item.id, item.variantId, item.quantity - 1)}
                          className="w-9 h-9 flex items-center justify-center text-accent-navy hover:bg-neutral-white rounded-lg transition-all"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="font-black text-accent-navy text-md w-10 text-center italic">{item.quantity}</span>
                        <button 
                          onClick={() => handleQtyChange(item.id, item.variantId, item.quantity + 1)}
                          className="w-9 h-9 flex items-center justify-center text-accent-navy hover:bg-neutral-white rounded-lg transition-all"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-[9px] font-bold text-neutral-gray uppercase tracking-widest mb-1">Unit Price: ₦{item.price.toLocaleString()}</p>
                        <span className="text-lg font-black text-accent-navy italic">
                          ₦{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tactical Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-accent-navy rounded-[2.5rem] p-8 sticky top-24 text-neutral-white shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 rounded-full blur-3xl -mr-16 -mt-16" />
                
                <h2 className="text-xl font-black italic uppercase mb-8 border-b border-neutral-white/10 pb-4 relative z-10">
                  Order <span className="text-brand-primary">Summary</span>
                </h2>
                
                <div className="space-y-4 mb-8 relative z-10">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-white/50">Base Subtotal</span>
                    <span className="font-bold text-lg">₦{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-white/50">Logistics</span>
                    <span className="text-[10px] font-black uppercase text-brand-primary">Calculated at Checkout</span>
                  </div>
                </div>

                <div className="border-t border-neutral-white/10 pt-6 mb-8 flex justify-between items-end relative z-10">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">Total Spent</span>
                    <div className="text-lg font-black italic leading-none mt-1">
                      ₦{subtotal.toLocaleString()}
                    </div>
                  </div>
                </div>

                <Link href="/checkout" className="flex items-center justify-center gap-3 w-full bg-brand-primary text-neutral-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-white hover:text-accent-navy transition-all shadow-lg group relative z-10">
                  Proceed to payment <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                </Link>

                <div className="mt-6 flex items-center justify-center gap-2 opacity-50">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[8px] font-black uppercase tracking-widest">Encrypted Checkout Active</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
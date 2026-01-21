// "use client";

// import { motion, AnimatePresence } from "framer-motion";
// import { ShoppingBag, X, Trash2, ArrowRight, Plus, Minus, ShoppingCart } from "lucide-react";
// import { useState, useEffect, useMemo } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import { useSessionContext } from "@/app/_context/useSessionContext";

// export default function CartDrawer() {
//   const { session, status } = useSessionContext();
//   const [cart, setCart] = useState<any>({ items: [] });
//   const [open, setOpen] = useState(false);

//   const subtotal = useMemo(() => {
//     return cart.items.reduce((acc: number, item: any) => acc + (item.unitPrice * item.qty), 0);
//   }, [cart.items]);

//   useEffect(() => {
//     if (status === "authenticated" && session?.user?.id) {
//         fetch("/api/cart")
//           .then((res) => res.json())
//           .then(async (data) => {
//             const guestCart = localStorage.getItem("guestCart");
//             if (guestCart) {
//               await fetch("/api/cart/merge", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: guestCart,
//               });
//               localStorage.removeItem("guestCart");
//               const merged = await fetch("/api/cart").then((r) => r.json());
//               setCart(merged);
//             } else {
//               setCart(data);
//             }
//           })
//           .catch(console.error);
//       } else if (status === "unauthenticated") {
//         const guestCart = localStorage.getItem("guestCart");
//         if (guestCart) setCart(JSON.parse(guestCart));
//       }
//   }, [status, session]);

//   return (
//     <>
//       {/* Trigger Button */}
//       <button onClick={() => setOpen(true)} className="group relative p-2 transition-transform active:scale-90">
//         <ShoppingBag className="w-8 h-8 text-brand-primary group-hover:text-blue-600 transition-colors" />
//         {cart?.items?.length > 0 && (
//           <span className="absolute -top-1 -right-1 bg-brand-primary text-neutral-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-neutral-white shadow-lg">
//             {cart.items.length}
//           </span>
//         )}
//       </button>

//       <AnimatePresence>
//         {open && (
//           <>
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               onClick={() => setOpen(false)}
//               className="fixed inset-0 bg-accent-navy/40 backdrop-blur-sm z-40"
//             />

//             <motion.div
//               initial={{ x: "100%" }}
//               animate={{ x: 0 }}
//               exit={{ x: "100%" }}
//               transition={{ type: "spring", damping: 25, stiffness: 200 }}
//               className="fixed top-0 right-0 w-full max-w-[400px] h-full bg-neutral-white shadow-2xl z-1001 flex flex-col "
//             >
//               {/* Header */}
//               <div className="p-6 border-b border-neutral-light flex items-center justify-between">
//                 <div>
//                   <h2 className="text-2xl font-black italic uppercase tracking-tighter text-accent-navy">
//                     Your <span className="text-brand-primary">Cart</span>
//                   </h2>
//                   <p className="text-xs font-bold text-neutral-gray uppercase tracking-widest">
//                     {cart.items.length} Items Selected
//                   </p>
//                 </div>
//                 <button onClick={() => setOpen(false)} className="p-2 hover:bg-neutral-light rounded-full transition-colors">
//                   <X className="w-6 h-6 text-neutral-gray" />
//                 </button>
//               </div>

//               {/* Items Area */}
//               <div className="flex-1 overflow-y-auto p-6">
//                 {cart.items.length === 0 ? (
//                   <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
//                     <div className="bg-neutral-light p-10 rounded-full animate-pulse">
//                         <ShoppingCart className="w-16 h-16 text-neutral-gray/30" />
//                     </div>
//                     <div className="space-y-2">
//                         <p className="text-xl font-black italic text-accent-navy uppercase">Your cart is empty</p>
//                         <p className="text-sm text-neutral-gray font-medium max-w-[200px] mx-auto">
//                             Don't miss out on the latest Marvel gear!
//                         </p>
//                     </div>
                    
//                     {/* The Empty State Shop Link */}
//                     <Link 
//                         href="/shop" 
//                         onClick={() => setOpen(false)}
//                         className="flex items-center gap-2 bg-brand-primary text-neutral-white px-8 py-4 rounded-xl font-black uppercase text-sm tracking-widest hover:scale-105 transition-transform shadow-lg shadow-brand-primary/20"
//                     >
//                         Explore Shop <ArrowRight size={18} />
//                     </Link>
//                   </div>
//                 ) : (
//                   <div className="space-y-6">
//                     {cart.items.map((item: any) => (
//                         <div key={item.id} className="flex gap-4 group">
//                         <div className="relative w-20 h-20 bg-neutral-light rounded-xl overflow-hidden border border-neutral-light flex-shrink-0">
//                             <Image src={item.product.imageUrl} alt={item.product.title} fill className="object-cover" />
//                         </div>
//                         <div className="flex-1 min-w-0">
//                             <div className="flex justify-between">
//                             <h4 className="font-bold text-accent-navy truncate uppercase text-sm">{item.product.title}</h4>
//                             <button className="text-neutral-gray hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
//                             </div>
//                             <p className="text-[10px] text-neutral-gray font-bold uppercase">{item.variant?.name || "Standard"}</p>
                            
//                             <div className="flex items-center justify-between mt-3">
//                             <div className="flex items-center border border-neutral-light rounded-lg px-2 py-1 gap-3">
//                                 <button className="text-neutral-gray hover:text-brand-primary"><Minus size={12} /></button>
//                                 <span className="text-xs font-black text-accent-navy">{item.qty}</span>
//                                 <button className="text-neutral-gray hover:text-brand-primary"><Plus size={12} /></button>
//                             </div>
//                             <span className="text-sm font-black text-brand-primary">₦{(item.unitPrice * item.qty).toLocaleString()}</span>
//                             </div>
//                         </div>
//                         </div>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               {/* Footer - Only show if items exist */}
//               {cart.items.length > 0 && (
//                 <div className="p-6 bg-neutral-light border-t border-neutral-light space-y-4">
//                     <div className="flex justify-between items-end">
//                         <span className="text-xs font-black text-neutral-gray uppercase tracking-widest">Subtotal</span>
//                         <span className="text-2xl font-black text-accent-navy">₦{subtotal.toLocaleString()}</span>
//                     </div>
//                     <div className="grid grid-cols-2 gap-3">
//                         <Link href="/cart" className="flex items-center justify-center py-4 rounded-xl font-bold text-xs uppercase border-2 border-neutral-gray/20 text-neutral-gray hover:bg-neutral-white transition-all">
//                         View Cart
//                         </Link>
//                         <Link href="/checkout" className="flex items-center justify-center gap-2 py-4 rounded-xl font-black text-xs uppercase bg-accent-navy text-neutral-white hover:bg-brand-primary transition-all shadow-lg shadow-accent-navy/20">
//                         Checkout <ArrowRight size={14} />
//                         </Link>
//                     </div>
//                 </div>
//               )}
//             </motion.div>
//           </>
//         )}
//       </AnimatePresence>
//     </>
//   );
// }




"use client";

import { useState, useEffect, useMemo } from "react"; 
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, X, Trash2, ArrowRight, Plus, Minus, ShoppingCart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { removeFromCart, addToCart } from "@/store/cartSlice";
import { useNotification } from "@/app/_context/NotificationContext";

export default function CartDrawer() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false); // Fix for Hydration Error
  const dispatch = useDispatch();
  const { notifyInfo } = useNotification();

  // 1. Pull cart items from Redux
  const cartItems = useSelector((state: RootState) => state.cart?.items || []);

  // 2. Set mounted to true only on the client to avoid SSR mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // 3. Calculate subtotal
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
        <ShoppingBag className="w-8 h-8 text-brand-primary group-hover:text-blue-600 transition-colors" />
        
        {/* HYDRATION FIX: Only render badge once mounted on client */}
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
              className="fixed top-0 right-0 w-full max-w-[400px] h-full bg-neutral-white shadow-2xl z-[1001] flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-neutral-light flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter text-accent-navy">
                    Your <span className="text-brand-primary">Cart</span>
                  </h2>
                  <p className="text-xs font-bold text-neutral-gray uppercase tracking-widest">
                    {cartItems.length} Items Selected
                  </p>
                </div>
                <button onClick={() => setOpen(false)} className="p-2 hover:bg-neutral-light rounded-full transition-colors">
                  <X className="w-6 h-6 text-neutral-gray" />
                </button>
              </div>

              {/* Items Area */}
              <div className="flex-1 overflow-y-auto p-6">
                {cartItems.length === 0 ? (
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
                          <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between">
                            <h4 className="font-bold text-accent-navy truncate uppercase text-sm">{item.title}</h4>
                            <button 
                              onClick={() => {
                                dispatch(removeFromCart(item.id));
                                notifyInfo(`${item.title} removed.`);
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
              {cartItems.length > 0 && (
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
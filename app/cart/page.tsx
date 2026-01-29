// "use client";

// import { useMemo } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ChevronLeft } from "lucide-react";
// import { useSelector, useDispatch } from "react-redux";
// import { RootState } from "@/store";
// import { removeFromCart, updateQuantity } from "@/store/cartSlice";
// // 1. Use your global notification context
// import { useNotification } from "@/app/_context/NotificationContext"; 

// interface ReduxCartItem {
//   id: string;
//   variantId: string | null;
//   slug: string;
//   title: string;
//   price: number;
//   imageUrl: string;
//   quantity: number;
//   variantName?: string;
//   stock?: number;
// }

// export default function CartPage() {
//   const dispatch = useDispatch();
//   const { notifySuccess, notifyError } = useNotification();
  
//   // 2. Safely access the cart items from your Redux state
//   const cartItems = useSelector((state: RootState) => state.cart.items) as ReduxCartItem[];

//   const subtotal = useMemo(() => {
//     return cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
//   }, [cartItems]);

//   const handleRemove = (id: string | number, variantId?: string | null) => {
//   dispatch(removeFromCart({ id, variantId })); // Now matches the new payload
//   notifySuccess("Item removed!");
// };

// const handleQtyChange = (id: string | number, variantId: string | null, newQty: number) => {
//   if (newQty < 1) return;
//   dispatch(updateQuantity({ id, variantId, quantity: newQty }));
// };

//   return (
//     <div className="bg-neutral-white min-h-screen pb-20">
//       <div className="container mx-auto px-4 py-12">
//         {/* Header */}
//         <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 border-b border-neutral-light pb-8">
//           <div>
//             <Link href="/products" className="text-neutral-gray flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:text-brand-primary transition-colors mb-4">
//               <ChevronLeft size={16} /> Back to Products
//             </Link>
//             <div className="flex items-center gap-4">
//               <ShoppingBag className="w-10 h-10 text-brand-primary" />
//               <h1 className="text-5xl font-black italic uppercase tracking-tighter text-accent-navy">
//                 Your <span className="text-brand-primary">Loot</span>
//               </h1>
//             </div>
//           </div>
//           <p className="text-neutral-gray font-bold uppercase tracking-widest text-sm">
//             Total Items: {cartItems.length}
//           </p>
//         </div>

//         {cartItems.length === 0 ? (
//           <div className="flex flex-col items-center justify-center text-center space-y-8 py-20 bg-neutral-light rounded-3xl">
//             <ShoppingBag className="w-24 h-24 text-neutral-gray/20" />
//             <h2 className="text-3xl font-black italic uppercase text-accent-navy text-neutral-gray/50">Your stash is empty</h2>
//             <Link href="/products" className="bg-brand-primary text-neutral-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all">
//               Start Looting
//             </Link>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
//             <div className="lg:col-span-2 space-y-6">
//               {cartItems.map((item) => (
//                 <div key={`${item.id}-${item.variantId || 'base'}`} className="group flex flex-col sm:flex-row gap-6 p-6 bg-neutral-white border border-neutral-light rounded-3xl hover:border-brand-primary/30 transition-all shadow-sm hover:shadow-xl">
//                   {/* Image with Safety Fallback */}
//                   <div className="relative w-full sm:w-40 h-40 bg-neutral-light rounded-2xl overflow-hidden flex-shrink-0">
//                     <Image
//                       src={(item.imageUrl && item.imageUrl !== "/images/placeholder.jpg") ? item.imageUrl : "/logo.png"}
//                       alt={item.title}
//                       fill
//                       sizes="160px"
//                       className="object-contain p-4 group-hover:scale-105 transition-transform"
//                     />
//                   </div>
                  
//                   <div className="flex-1 flex flex-col justify-between py-2">
//                     <div className="flex justify-between items-start">
//                       <div>
//                         <Link href={`/products/${item.slug}`}>
//                           <h3 className="text-xl font-black italic uppercase text-accent-navy hover:text-brand-primary transition-colors">
//                             {item.title}
//                           </h3>
//                         </Link>
//                         <p className="text-xs font-bold text-neutral-gray uppercase tracking-widest mt-1">
//                           {item.variantName || "Standard Edition"}
//                         </p>
//                       </div>
//                       <button 
//                         onClick={() => handleRemove(item.id, item.variantId)}
//                         className="text-neutral-gray hover:text-red-500 transition-colors p-2"
//                       >
//                         <Trash2 size={20} />
//                       </button>
//                     </div>

//                     <div className="flex flex-wrap items-end justify-between gap-4 mt-6">
//                       <div className="flex items-center bg-neutral-light rounded-xl p-1 border border-neutral-light">
//                         <button 
//                           onClick={() => handleQtyChange(item.id, item.variantId, item.quantity - 1)}
//                           className="w-10 h-10 flex items-center justify-center text-accent-navy hover:text-brand-primary"
//                         >
//                           <Minus size={16} />
//                         </button>
//                         <span className="font-black text-accent-navy text-lg w-8 text-center">{item.quantity}</span>
//                         <button 
//                           onClick={() => handleQtyChange(item.id, item.variantId, item.quantity + 1, item.stock)}
//                           className="w-10 h-10 flex items-center justify-center text-accent-navy hover:text-brand-primary"
//                         >
//                           <Plus size={16} />
//                         </button>
//                       </div>
                      
//                       <div className="text-right">
//                         <span className="text-2xl font-black text-brand-primary italic">
//                           ₦{(item.price * item.quantity).toLocaleString()}
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Sidebar */}
//             <div className="lg:col-span-1">
//               <div className="bg-accent-navy rounded-3xl p-8 sticky top-24 text-neutral-white shadow-2xl">
//                 <h2 className="text-2xl font-black italic uppercase mb-8 border-b border-neutral-white/10 pb-4">
//                   Order Summary
//                 </h2>
                
//                 <div className="flex justify-between mb-8">
//                   <span className="text-xs font-bold uppercase text-neutral-white/60">Subtotal</span>
//                   <span className="font-bold">₦{subtotal.toLocaleString()}</span>
//                 </div>

//                 <div className="border-t border-neutral-white/10 pt-6 mb-8 flex justify-between items-end">
//                   <span className="text-xs font-black uppercase tracking-widest">Grand Total</span>
//                   <span className="text-3xl font-black text-brand-primary italic">₦{subtotal.toLocaleString()}</span>
//                 </div>

//                 <Link href="/checkout" className="flex items-center justify-center gap-3 w-full bg-brand-primary text-neutral-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-brand-light transition-all shadow-lg shadow-brand-primary/20 group">
//                   Proceed to Checkout <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
//                 </Link>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }




"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ChevronLeft } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { removeFromCart, updateQuantity } from "@/store/cartSlice";
import { useNotification } from "@/app/_context/NotificationContext";

interface ReduxCartItem {
  id: string | number;
  variantId: string | null;
  slug: string;
  title: string;
  price: number;
  imageUrl: string;
  quantity: number;
  variantName?: string;
  stock?: number;
}

export default function CartPage() {
  const dispatch = useDispatch();
  const { notifySuccess } = useNotification();
  
  // Safely access normalized items from Redux
  const cartItems = useSelector((state: RootState) => state.cart.items) as ReduxCartItem[];

  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }, [cartItems]);

  const handleRemove = (id: string | number, variantId: string | null) => {
    dispatch(removeFromCart({ id, variantId }));
    notifySuccess("Item removed!");
  };

  const handleQtyChange = (id: string | number, variantId: string | null, newQty: number) => {
    if (newQty < 1) return;
    dispatch(updateQuantity({ id, variantId, quantity: newQty }));
  };

  return (
    <div className="bg-neutral-white min-h-screen pb-20">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 border-b border-neutral-light pb-8">
          <div>
            <Link href="/products" className="text-neutral-gray flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:text-brand-primary transition-colors mb-4">
              <ChevronLeft size={16} /> Back to Products
            </Link>
            <div className="flex items-center gap-4">
              <ShoppingBag className="w-10 h-10 text-brand-primary" />
              <h1 className="text-5xl font-black italic uppercase tracking-tighter text-accent-navy">
                Your <span className="text-brand-primary">Order</span>
              </h1>
            </div>
          </div>
          <p className="text-neutral-gray font-bold uppercase tracking-widest text-sm">
            Total Items: {cartItems.length}
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center space-y-8 py-20 bg-neutral-light rounded-3xl">
            <ShoppingBag className="w-24 h-24 text-neutral-gray/20" />
            <h2 className="text-3xl font-black italic uppercase text-accent-navy text-neutral-gray/50">Your stash is empty</h2>
            <Link href="/products" className="bg-brand-primary text-neutral-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all">
              Start Looting
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-6">
              {cartItems.map((item) => (
                <div key={`${item.id}-${item.variantId || 'base'}`} className="group flex flex-col sm:flex-row gap-6 p-6 bg-neutral-white border border-neutral-light rounded-3xl hover:border-brand-primary/30 transition-all shadow-sm hover:shadow-xl">
                  {/* Image with Safety Fallback */}
                  <div className="relative w-full sm:w-40 h-40 bg-neutral-light rounded-2xl overflow-hidden flex-shrink-0">
                    <Image
                      src={(item.imageUrl && item.imageUrl !== "/images/placeholder.jpg") ? item.imageUrl : "/logo.png"}
                      alt={item.title}
                      fill
                      sizes="160px"
                      className="object-contain p-4 group-hover:scale-105 transition-transform"
                    />
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between py-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <Link href={`/products/${item.slug}`}>
                          <h3 className="text-xl font-black italic uppercase text-accent-navy hover:text-brand-primary transition-colors">
                            {item.title}
                          </h3>
                        </Link>
                        <p className="text-xs font-bold text-neutral-gray uppercase tracking-widest mt-1">
                          {item.variantName || "Standard Edition"}
                        </p>
                      </div>
                      <button 
                        onClick={() => handleRemove(item.id, item.variantId)}
                        className="text-neutral-gray hover:text-red-500 transition-colors p-2"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>

                    <div className="flex flex-wrap items-end justify-between gap-4 mt-6">
                      <div className="flex items-center bg-neutral-light rounded-xl p-1 border border-neutral-light">
                        <button 
                          onClick={() => handleQtyChange(item.id, item.variantId, item.quantity - 1)}
                          className="w-10 h-10 flex items-center justify-center text-accent-navy hover:text-brand-primary"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="font-black text-accent-navy text-lg w-8 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => handleQtyChange(item.id, item.variantId, item.quantity + 1)}
                          className="w-10 h-10 flex items-center justify-center text-accent-navy hover:text-brand-primary"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      
                      <div className="text-right">
                        <span className="text-2xl font-black text-brand-primary italic">
                          ₦{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-accent-navy rounded-3xl p-8 sticky top-24 text-neutral-white shadow-2xl">
                <h2 className="text-2xl font-black italic uppercase mb-8 border-b border-neutral-white/10 pb-4">
                  Order Summary
                </h2>
                
                <div className="flex justify-between mb-8">
                  <span className="text-xs font-bold uppercase text-neutral-white/60">Subtotal</span>
                  <span className="font-bold">₦{subtotal.toLocaleString()}</span>
                </div>

                <div className="border-t border-neutral-white/10 pt-6 mb-8 flex justify-between items-end">
                  <span className="text-xs font-black uppercase tracking-widest">Grand Total</span>
                  <span className="text-3xl font-black text-brand-primary italic">₦{subtotal.toLocaleString()}</span>
                </div>

                <Link href="/checkout" className="flex items-center justify-center gap-3 w-full bg-brand-primary text-neutral-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-brand-orange-light transition-all shadow-lg shadow-brand-primary/20 group">
                  Proceed to Checkout <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
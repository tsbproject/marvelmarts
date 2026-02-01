// "use client";

// import React, { useEffect } from "react"; 
// import Link from "next/link";
// import { motion, AnimatePresence } from "framer-motion";
// import { X, ShoppingCart, Star, ArrowRight } from "lucide-react";
// import Image from "next/image";
// import { useRouter } from "next/navigation"; 
// import { formatNaira } from "@/app/lib/FormatNaira";
// import { SerializedProduct } from "@/types/product";
// import { useDispatch } from "react-redux";
// import { addToCart } from "@/store/cartSlice";
// import { useNotification } from "@/app/_context/NotificationContext";

// interface DrawerProps {
//   isOpen: boolean;
//   onClose: () => void;
//   product: SerializedProduct;
// }

// export default function ProductQuickViewDrawer({ isOpen, onClose, product }: DrawerProps) {
//   const dispatch = useDispatch();
//   const router = useRouter();
//   const { notifySuccess } = useNotification();

//   // Prefetch the product page as soon as the drawer opens
//   // This makes the mobile transition instant
//   useEffect(() => {
//     if (isOpen && product?.slug) {
//       router.prefetch(`/products/${product.slug}`);
//     }
//   }, [isOpen, product?.slug, router]);

//   const handleAddToCart = () => {
//     dispatch(addToCart({ product, quantity: 1 }));
//     notifySuccess(`${product.title} added to stash!`);
//     onClose();
//   };

//   const handleViewDetails = (e: React.MouseEvent) => {
//     // 1. Prevent all default behaviors
//     e.preventDefault();
//     e.stopPropagation();
    
//     // 2. Immediate navigation
//     router.push(`/products/${product.slug}`);
    
  

//     // The drawer will unmount naturally when the page changes.
//   };

//   return (
//     <AnimatePresence>
//       {isOpen && (
//         <>
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             onClick={onClose}
//             className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm"
//           />

//           <motion.div
//             initial={{ y: "100%" }}
//             animate={{ y: 0 }}
//             exit={{ y: "100%" }}
//             transition={{ type: "spring", damping: 30, stiffness: 300 }}
//             className="fixed bottom-0 left-0 right-0 md:left-1/2 md:-translate-x-1/2 md:max-w-xl 2xl:max-w-xl bg-white rounded-t-[2rem] z-[101] p-5 pb-8 shadow-2xl max-h-[80vh] overflow-y-auto border-x border-t border-gray-100"
//           >
//             <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />

//             <button 
//               onClick={onClose}
//               className="absolute top-4 right-4 p-1.5 bg-gray-100 rounded-full text-gray-500 z-[102]"
//             >
//               <X size={18} />
//             </button>

//             <div className="flex flex-col gap-4">
//               <div className="relative w-full h-48 bg-gray-50 rounded-2xl overflow-hidden">
//                 <Image
//                  src={product.imageUrl || product.images?.[0]?.url || "/logo.png"}
//                  alt={product.title}
//                  fill
//                  className="object-contain md:w-[400px] h-[100px] p-4"
//                 />
//               </div>

//               <div className="space-y-3">
//                 <div>
//                   <h2 className="text-lg font-black text-gray-900 uppercase leading-tight">
//                     {product.title}
//                   </h2>
//                   <div className="flex items-center gap-2 mt-1">
//                     <div className="flex text-yellow-400">
//                       <Star size={12} fill="currentColor" />
//                     </div>
//                     <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
//                       4.9 (120 Reviews)
//                     </span>
//                   </div>
//                 </div>

//                 <div className="flex items-baseline gap-3">
//                   <span className="text-2xl font-black text-[#3B82F6] italic">
//                     {formatNaira(product.discountPrice ?? product.price)}
//                   </span>
//                   {product.discountPrice && (
//                     <span className="text-sm text-gray-300 line-through font-bold italic">
//                       {formatNaira(product.price)}
//                     </span>
//                   )}
//                 </div>

//                 <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
//                   High-performance products designed the  for elite. 
//                 </p>

//                 <div className="flex flex-col gap-2 pt-2">
//                   <button
//                     onClick={handleAddToCart}
//                     className="w-full bg-[#3B82F6] text-white py-3.5 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-lg shadow-blue-100 active:scale-[0.98] transition-transform"
//                   >
//                     <ShoppingCart size={16} />
//                     Add to Cart
//                   </button>

//                   {/* FIXED BUTTON FOR MOBILE */}
//                   <Link
//                     href={`/products/${product.slug}`}
//                     prefetch
//                     onClick={(e) => {
//                         e.stopPropagation(); 
//                     }}
//                     className="w-full bg-accent-navy text-gray-50 py-3.5 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 border border-gray-100 active:bg-opacity-90 transition-all touch-manipulation cursor-pointer"
//                     >
//                     View Full Details
//                     <ArrowRight size={14} />
//                     </Link>


                 
//                 </div>
//               </div>
//             </div>
//           </motion.div>
//         </>
//       )}
//     </AnimatePresence>
//   );
// }


"use client";

import React, { useEffect } from "react"; 
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, Star, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation"; 
import { formatNaira } from "@/app/lib/FormatNaira";
import { SerializedProduct } from "@/types/product";
import { useDispatch } from "react-redux";
import { addToCart } from "@/store/cartSlice";
import { useNotification } from "@/app/_context/NotificationContext";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  product: SerializedProduct;
}

export default function ProductQuickViewDrawer({ isOpen, onClose, product }: DrawerProps) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { notifySuccess } = useNotification();

  useEffect(() => {
    if (isOpen && product?.slug) {
      router.prefetch(`/products/${product.slug}`);
    }
  }, [isOpen, product?.slug, router]);

  const handleAddToCart = () => {
    dispatch(addToCart({ product, quantity: 1 }));
    notifySuccess(`${product.title} added to stash!`);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm"
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            /* Increased max-width for desktop (md:max-w-2xl) */
            className="fixed bottom-0 left-0 right-0 md:left-1/2 md:-translate-x-1/2 md:max-w-2xl bg-white rounded-t-[3rem] z-[101] p-6 pb-10 shadow-2xl max-h-[90vh] overflow-y-auto border-x border-t border-gray-100"
          >
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />

            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 bg-gray-100 hover:bg-gray-200 transition-colors rounded-full text-gray-500 z-[102]"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col gap-6">
              {/* Increased height (h-64 md:h-96) and better padding for the image */}
              <div className="relative w-full h-64 md:h-96 bg-neutral-light rounded-[2rem] overflow-hidden">
                <Image
                  src={product.imageUrl || product.images?.[0]?.url || "/logo.png"}
                  alt={product.title}
                  fill
                  className="object-contain p-8 transform hover:scale-105 transition-transform duration-500"
                  priority
                />
              </div>

              <div className="space-y-4 px-2">
                <div>
                  <h2 className="text-2xl font-black text-accent-navy uppercase leading-tight italic">
                    {product.title}
                  </h2>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill={i < 4 ? "currentColor" : "none"} />
                      ))}
                    </div>
                    <span className="text-[11px] font-black text-neutral-gray uppercase tracking-widest">
                      4.9 (120 Verified Reviews)
                    </span>
                  </div>
                </div>

                <div className="flex items-baseline gap-4">
                  <span className="text-3xl font-black text-brand-primary italic">
                    {formatNaira(product.discountPrice ?? product.price)}
                  </span>
                  {product.discountPrice && (
                    <span className="text-lg text-gray-300 line-through font-bold italic">
                      {formatNaira(product.price)}
                    </span>
                  )}
                </div>

                <p className="text-sm text-neutral-gray leading-relaxed font-medium">
                  Experience elite performance. This high-grade tactical product is engineered for durability and precision, ensuring you're ready for any mission.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-brand-primary hover:bg-blue-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 shadow-xl shadow-blue-100 active:scale-[0.97] transition-all"
                  >
                    <ShoppingCart size={18} />
                    Add to stash
                  </button>

                  <Link
                    href={`/products/${product.slug}`}
                    prefetch
                    className="w-full bg-accent-navy hover:bg-opacity-90 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 border border-transparent transition-all active:scale-[0.97]"
                  >
                    View in Full
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}


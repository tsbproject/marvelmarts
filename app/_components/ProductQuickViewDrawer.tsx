// "use client";

// import React from "react";
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

//   const handleAddToCart = () => {
//     dispatch(addToCart({ product, quantity: 1 }));
//     notifySuccess(`${product.title} added to stash!`);
//     onClose();
//   };

//   const handleViewDetails = (e: React.MouseEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     router.push(`/products/${product.slug}`);
//     setTimeout(() => {
//       onClose();
//     }, 10);
//   };

//   return (
//     <AnimatePresence>
//       {isOpen && (
//         <>
//           {/* Backdrop */}
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             onClick={onClose}
//             className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm"
//           />

//           {/* Compact Bottom Sheet */}
//           <motion.div
//             initial={{ y: "100%" }}
//             animate={{ y: 0 }}
//             exit={{ y: "100%" }}
//             transition={{ type: "spring", damping: 30, stiffness: 300 }}
//             /* Added max-w-md and mx-auto for desktop centering 
//                Reduced max-h to 80vh instead of 90vh
//             */
//             className="fixed bottom-0 left-0 right-0 md:left-1/2 md:-translate-x-1/2 md:w-200 bg-white rounded-t-[2rem] z-[101] p-5 pb-8 shadow-2xl max-h-[80vh] overflow-y-auto border-x border-t border-gray-100"
//           >
//             {/* Drag Handle */}
//             <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />

//             <button 
//               onClick={onClose}
//               className="absolute top-4 right-4 p-1.5 bg-gray-100 rounded-full text-gray-500 z-[102]"
//             >
//               <X size={18} />
//             </button>

//             <div className="flex flex-col gap-4">
//               {/* Reduced Image Container Height */}
//               <div className="relative w-full h-150 bg-gray-50 rounded-2xl overflow-hidden">
//                 <Image
//                   src={product.imageUrl || "/placeholder.png"}
//                   alt={product.title}
//                   fill
//                   className="object-contain  p-4"
//                 />
//               </div>

//               {/* Info Container */}
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
//                   High-performance tactical gear designed for elite operators. 
//                   Engineered for maximum efficiency in the field.
//                 </p>

//                 <div className="flex flex-col gap-2 pt-2">
//                   <button
//                     onClick={handleAddToCart}
//                     className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white py-3.5 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-lg shadow-blue-100 active:scale-[0.98] transition-transform"
//                   >
//                     <ShoppingCart size={16} />
//                     Add to cart
//                   </button>

//                   <button
//                     onClick={handleViewDetails}
//                     className="w-full bg-accent-navy text-gray-50 py-3.5 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 border border-gray-100 active:scale-[0.98] transition-transform touch-manipulation"
//                   >
//                     View Full Details
//                     <ArrowRight size={14} />
//                   </button>
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

import React, { useEffect } from "react"; // Added useEffect
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

  // Prefetch the product page as soon as the drawer opens
  // This makes the mobile transition instant
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

  const handleViewDetails = (e: React.MouseEvent) => {
    // 1. Prevent all default behaviors
    e.preventDefault();
    e.stopPropagation();
    
    // 2. Immediate navigation
    router.push(`/products/${product.slug}`);
    
    // 3. DO NOT call onClose() immediately. 
    // Let the browser handle the page change. 
    // The drawer will unmount naturally when the page changes.
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
            className="fixed bottom-0 left-0 right-0 md:left-1/2 md:-translate-x-1/2 md:max-w-md bg-white rounded-t-[2rem] z-[101] p-5 pb-8 shadow-2xl max-h-[80vh] overflow-y-auto border-x border-t border-gray-100"
          >
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />

            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 bg-gray-100 rounded-full text-gray-500 z-[102]"
            >
              <X size={18} />
            </button>

            <div className="flex flex-col gap-4">
              <div className="relative w-full h-48 bg-gray-50 rounded-2xl overflow-hidden">
                <Image
                  src={product.imageUrl || "/placeholder.png"}
                  alt={product.title}
                  fill
                  className="object-contain p-4"
                />
              </div>

              <div className="space-y-3">
                <div>
                  <h2 className="text-lg font-black text-gray-900 uppercase leading-tight">
                    {product.title}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex text-yellow-400">
                      <Star size={12} fill="currentColor" />
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      4.9 (120 Reviews)
                    </span>
                  </div>
                </div>

                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-black text-[#3B82F6] italic">
                    {formatNaira(product.discountPrice ?? product.price)}
                  </span>
                  {product.discountPrice && (
                    <span className="text-sm text-gray-300 line-through font-bold italic">
                      {formatNaira(product.price)}
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                  High-performance tactical gear designed for elite operators. 
                </p>

                <div className="flex flex-col gap-2 pt-2">
                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-[#3B82F6] text-white py-3.5 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-lg shadow-blue-100 active:scale-[0.98] transition-transform"
                  >
                    <ShoppingCart size={16} />
                    Add to stash
                  </button>

                  {/* FIXED BUTTON FOR MOBILE */}
                   <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleViewDetails(e);
                    }}
                    className="w-full bg-accent-navy text-gray-50 py-3.5 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 border border-gray-100 active:bg-opacity-90 transition-all touch-manipulation cursor-pointer"
                    >
                    View Full Details
                    <ArrowRight size={14} />
                    </button>


                 
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
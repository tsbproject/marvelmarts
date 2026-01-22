// "use client";

// import React from "react";
// import Link from "next/link";
// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import { Star, Eye, ShoppingCart } from "lucide-react";
// import { formatNaira } from "@/app/lib/FormatNaira";
// import { SerializedProduct } from "@/types/product";
// import { useDispatch } from "react-redux";
// import { addToCart } from "@/store/cartSlice";
// import { useNotification } from "@/app/_context/NotificationContext";

// interface ProductCardProps {
//   product: SerializedProduct;
//   onQuickView: (p: SerializedProduct) => void;
//   onViewDetails?: () => void;
// }

// export default function ProductCard({ 
//   product, 
//   onQuickView,
//   onViewDetails
// }: ProductCardProps) {
//   const router = useRouter();
//   const dispatch = useDispatch();
//   const { notifySuccess } = useNotification();

//   const discountPercentage = product.discountPrice 
//     ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
//     : null;

//   const displayPrice = product.discountPrice ?? product.price;

//   const handleNavigation = (e: React.MouseEvent) => {
//     if (onViewDetails) {
//       e.preventDefault();
//       onViewDetails();
//     }
//   };

//   const handleAddToCart = (e: React.MouseEvent) => {
//     e.preventDefault(); 
//     e.stopPropagation(); 

//     dispatch(addToCart({ 
//       product: product, 
//       quantity: 1 
//     }));

//     notifySuccess(`${product.title} added to your stash!`);
//   };

//   return (
//     <div className="bg-white border border-gray-100 rounded-xl overflow-hidden flex flex-col items-center p-4 shadow-sm hover:shadow-md transition-shadow group h-full relative">
      
//       {/* 1. Sales Label */}
//       {discountPercentage && (
//         <div className="absolute top-3 left-3 z-10 bg-red-600 text-white text-[10px] font-black w-10 h-10 flex items-center justify-center rounded-full shadow-sm uppercase tracking-tighter">
//           -{discountPercentage}%
//         </div>
//       )}

//       {/* 2. Image Container */}
//       <div className="relative w-full h-64 overflow-hidden rounded-t-lg bg-gray-50 group">
//         <Link 
//           href={`/products/${product.slug}`} 
//           className="w-full h-full block z-0"
//           onClick={handleNavigation}
//         >
//           <Image 
//             src={product.imageUrl || "/placeholder.png"} 
//             alt={product.title}
//             fill 
//             className="object-contain transition-transform duration-500 group-hover:scale-110 p-4" 
//             priority
//           />
//         </Link>
        
//         <button 
//           onClick={(e) => {
//             e.preventDefault();
//             e.stopPropagation();
//             onQuickView(product);
//           }}
//           // Logic: md:opacity-0 keeps it hidden on desktop until hover. 
//           // opacity-100 on mobile ensures it is visible and clickable.
//           // z-20 ensures it stays above the Link.
//           className="absolute bottom-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-700 shadow-sm opacity-100 md:opacity-0 translate-y-0 md:translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all hover:bg-blue-600 hover:text-white touch-manipulation z-20"
//           title="Quick View"
//         >
//           <Eye size={18} />
//         </button>
//       </div>

//       {/* 3. Product Info */}
//       <div className="flex-1 flex flex-col items-center text-center w-full px-2 mt-4">
//         <Link href={`/products/${product.slug}`} onClick={handleNavigation}>
//           <h3 className="text-sm font-medium text-gray-800 line-clamp-2 h-10 mb-1 hover:text-blue-600 transition-colors">
//             {product.title}
//           </h3>
//         </Link>

//         <div className="flex items-center gap-2 mb-2">
//           <p className="text-lg font-bold text-blue-600">
//             {formatNaira(displayPrice)}
//           </p>
//           {product.discountPrice && (
//             <p className="text-xs text-gray-400 line-through font-medium">
//               {formatNaira(product.price)}
//             </p>
//           )}
//         </div>

//         <div className="flex items-center gap-1 mb-4">
//           <div className="flex text-yellow-400">
//             {[...Array(5)].map((_, i) => (
//               <Star key={i} size={12} fill={i < 4 ? "currentColor" : "none"} />
//             ))}
//           </div>
//           <span className="text-[10px] text-gray-400">(120)</span>
//         </div>
//       </div>

//       {/* 4. Functional Add to Cart Button */}
//       <button 
//         onClick={handleAddToCart}
//         className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white py-2.5 rounded-full font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2 z-10"
//       >
//         <ShoppingCart size={16} />
//         Add to Cart
//       </button>
//     </div>
//   );
// }


"use client";

import React from "react";
import Image from "next/image";
import { Star, Eye, ShoppingCart } from "lucide-react";
import { formatNaira } from "@/app/lib/FormatNaira";
import { SerializedProduct } from "@/types/product";
import { useDispatch } from "react-redux";
import { addToCart } from "@/store/cartSlice";
import { useNotification } from "@/app/_context/NotificationContext";

interface ProductCardProps {
  product: SerializedProduct;
  onQuickView: (p: SerializedProduct) => void;
}

export default function ProductCard({ product, onQuickView }: ProductCardProps) {
  const dispatch = useDispatch();
  const { notifySuccess } = useNotification();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addToCart({ product, quantity: 1 }));
    notifySuccess(`${product.title} added to stash!`);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView(product);
  };

  return (
    /* Use a standard 'a' tag. It is the most reliable way to navigate on mobile. */
    <a 
      href={`/products/${product.slug}`}
      className="bg-brand-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group h-full relative flex flex-col cursor-pointer touch-manipulation active:bg-[#FFE8CC] select-none no-underline"
    >
      {/* Sales Label */}
      {product.discountPrice && (
        <div className="absolute top-3 left-3 z-20 bg-red-600 text-brand-white text-[10px] font-black w-10 h-10 flex items-center justify-center rounded-full shadow-sm uppercase">
          -{Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
        </div>
      )}

      {/* Image Container */}
      <div className="relative w-full h-64 overflow-hidden rounded-t-lg bg-[#F8F8F8] p-4">
        <Image 
          src={product.imageUrl || "/placeholder.png"} 
          alt={product.title}
          fill 
          className="object-contain transition-transform duration-500 group-hover:scale-110 p-4" 
          priority
        />
        
        {/* Quick View Button */}
        <button 
          type="button"
          onClick={handleQuickView}
          className="absolute bottom-2 right-2 p-2 bg-brand-white/90 backdrop-blur-sm rounded-full text-[#4B4B4B] shadow-sm z-30 active:bg-[#002B5B] active:text-brand-white"
        >
          <Eye size={18} />
        </button>
      </div>

      {/* Info Section */}
      <div className="flex-1 flex flex-col items-center text-center w-full px-4 mt-4">
        <h3 className="text-sm font-medium text-[#1E1E1E] line-clamp-2 h-10 mb-1 group-hover:text-[#002B5B] transition-colors">
          {product.title}
        </h3>

        <div className="flex items-center gap-2 mb-2">
          {/* Brand Navy for Price */}
          <p className="text-lg font-bold text-[#002B5B]">
            {formatNaira(product.discountPrice ?? product.price)}
          </p>
        </div>

        <div className="flex items-center gap-1 mb-4">
          {/* Brand Orange for Stars */}
          <div className="flex text-[#F7931E]">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={12} fill={i < 4 ? "currentColor" : "none"} />
            ))}
          </div>
          <span className="text-[10px] text-[#4B4B4B]">(120)</span>
        </div>
      </div>

      {/* Add to Cart - Isolated from the link */}
      <div className="px-4 pb-4 w-full">
        <button 
          type="button"
          onClick={handleAddToCart}
          className="w-full bg-[#002B5B] hover:bg-[#1E1E1E] text-brand-white py-2.5 rounded-full font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2 relative z-20"
        >
          <ShoppingCart size={16} />
          Add to Cart
        </button>
      </div>
    </a>
  );
}

// "use client";

// import React, { useState, useEffect } from "react";
// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import { Star, Eye, ShoppingCart } from "lucide-react";
// import { formatNaira } from "@/app/lib/FormatNaira";
// import { SerializedProduct } from "@/types/product";
// import { useDispatch } from "react-redux";
// import { addToCart } from "@/store/cartSlice";
// import { useNotification } from "@/app/_context/NotificationContext";
// import { useLoadingOverlay } from "@/app/_context/LoadingOverlayContext";

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
//   const { setLoading } = useLoadingOverlay();
  
//   //Hydration Guard
//   // This ensures the component doesn't attempt complex logic until safely in the browser
//   const [mounted, setMounted] = useState(false);
//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   if (!mounted) {
//     // Return a shell with the same height to prevent layout shift
//     return <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm h-full animate-pulse" />;
//   }

//   const discountPercentage = product.discountPrice 
//     ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
//     : null;

//   const displayPrice = product.discountPrice ?? product.price;

//   const handleCardClick = (e: React.MouseEvent) => {
//     // Prevent navigation if clicking buttons
//     const target = e.target as HTMLElement;
//     if (target.closest('button')) return;

//     if (onViewDetails) {
//       e.preventDefault();
//       onViewDetails();
//     } else {
//       //  Bulletproof Slug Logic
//       // Vercel sometimes struggles with complex object-types in serialized data
//       const slugValue = typeof product.slug === 'string' 
//         ? product.slug 
//         : (product.slug as any)?.current;
      
//       if (slugValue && slugValue !== "undefined") {
//         setLoading(true); 
//         router.push(`/products/${slugValue}`);
//       }
//     }
//   };

//   const handleAddToCart = (e: React.MouseEvent) => {
//     e.preventDefault(); 
//     e.stopPropagation(); 
//     dispatch(addToCart({ product, quantity: 1 }));
//     notifySuccess(`${product.title} added to your stash!`);
//   };

//   return (
//     <div 
//       onClick={handleCardClick}
//       className="bg-white border border-gray-100 rounded-xl overflow-hidden flex flex-col items-center p-4 shadow-sm hover:shadow-md transition-shadow group h-full relative cursor-pointer touch-manipulation active:bg-gray-50"
//     >
//       {/* 1. Sales Label */}
//       {discountPercentage && (
//         <div className="absolute top-3 left-3 z-10 bg-red-600 text-white text-[10px] font-black w-10 h-10 flex items-center justify-center rounded-full shadow-sm uppercase tracking-tighter">
//           -{discountPercentage}%
//         </div>
//       )}

//       {/* 2. Image Container */}
//       <div className="relative w-full h-64 overflow-hidden rounded-t-lg bg-gray-50 group">
//         <Image 
//           src={product.imageUrl || product.images?.[0]?.url || "/logo.png"} 
//           alt={product.title}
//           fill 
//           sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
//           className="object-contain transition-transform duration-500 group-hover:scale-110 p-4" 
//           priority={false} // Only use priority for the very first images on the page
//         />
//         <button 
//           type="button"
//           onClick={(e) => {
//             e.preventDefault();
//             e.stopPropagation();
//             onQuickView(product);
//           }}
//           className="absolute bottom-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-700 shadow-sm opacity-100 md:opacity-0 translate-y-0 md:translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all hover:bg-blue-600 hover:text-white touch-manipulation z-20"
//           title="Quick View"
//         >
//           <Eye size={18} />
//         </button>
//       </div>

//       {/* 3. Product Info */}
//       <div className="flex-1 flex flex-col items-center text-center w-full px-2 mt-4">
//         <h3 className="text-sm font-medium text-gray-800 line-clamp-2 h-10 mb-1 hover:text-blue-600 transition-colors">
//           {product.title}
//         </h3>
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
//         type="button"
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

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Star, Eye, ShoppingCart, Heart } from "lucide-react"; // Added Heart
import { formatNaira } from "@/app/lib/FormatNaira";
import { SerializedProduct } from "@/types/product";
import { useDispatch, useSelector } from "react-redux"; // Added useSelector
import { addToCart } from "@/store/cartSlice";
import { toggleWishlist } from "@/store/wishlistSlice"; // Added wishlist action
import { RootState } from "@/store"; // Added RootState
import { useNotification } from "@/app/_context/NotificationContext";
import { useLoadingOverlay } from "@/app/_context/LoadingOverlayContext";

interface ProductCardProps {
  product: SerializedProduct;
  onQuickView: (p: SerializedProduct) => void;
  onViewDetails?: () => void;
}

export default function ProductCard({ 
  product, 
  onQuickView,
  onViewDetails
}: ProductCardProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { notifySuccess } = useNotification();
  const { setLoading } = useLoadingOverlay();
  
  // Wishlist Logic
  const wishlist = useSelector((state: RootState) => state.wishlist.items);
  const isWishlisted = wishlist.some((item) => item.id === product.id);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm h-full animate-pulse" />;
  }

  const discountPercentage = product.discountPrice 
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : null;

  const displayPrice = product.discountPrice ?? product.price;

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;

    if (onViewDetails) {
      e.preventDefault();
      onViewDetails();
    } else {
      const slugValue = typeof product.slug === 'string' 
        ? product.slug 
        : (product.slug as any)?.current;
      
      if (slugValue && slugValue !== "undefined") {
        setLoading(true); 
        router.push(`/products/${slugValue}`);
      }
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation(); 
    dispatch(addToCart({ product, quantity: 1 }));
    notifySuccess(`${product.title} added to your stash!`);
  };

  // Wishlist Toggle Function
  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Instant Redux Update
    dispatch(toggleWishlist({
      id: product.id,
      title: product.title,
      slug: typeof product.slug === 'string' ? product.slug : (product.slug as any)?.current,
      price: displayPrice,
      imageUrl: product.imageUrl || product.images?.[0]?.url || "/logo.png"
    }));

    // Sync with Database
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        body: JSON.stringify({ productId: product.id }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.action === "added") notifySuccess("Added to Wishlist");
      }
    } catch (error) {
      console.error("Wishlist sync failed");
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white border border-gray-100 rounded-xl overflow-hidden flex flex-col items-center p-4 shadow-sm hover:shadow-md transition-shadow group h-full relative cursor-pointer touch-manipulation active:bg-gray-50"
    >
      {/* 1. Sales Label */}
      {discountPercentage && (
        <div className="absolute top-3 left-3 z-10 bg-red-600 text-white text-[10px] font-black w-10 h-10 flex items-center justify-center rounded-full shadow-sm uppercase tracking-tighter">
          -{discountPercentage}%
        </div>
      )}

      {/* 2. Image Container */}
      <div className="relative w-full h-64 overflow-hidden rounded-t-lg bg-gray-50 group">
        <Image 
          src={product.imageUrl || product.images?.[0]?.url || "/logo.png"} 
          alt={product.title}
          fill 
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-contain transition-transform duration-500 group-hover:scale-110 p-4" 
          priority={false}
        />
        
        {/* Added Wishlist Button (Left side to balance with Eye icon) */}
        <button 
          type="button"
          onClick={handleWishlistToggle}
          className={`absolute bottom-2 left-2 p-2 rounded-full shadow-sm transition-all z-20 
            ${isWishlisted ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-700 hover:text-red-500'}
            opacity-100 md:opacity-0 md:translate-y-2 group-hover:opacity-100 group-hover:translate-y-0`}
          title="Wishlist"
        >
          <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
        </button>

        {/* Quick View Button */}
        <button 
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onQuickView(product);
          }}
          className="absolute bottom-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-700 shadow-sm opacity-100 md:opacity-0 translate-y-0 md:translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all hover:bg-blue-600 hover:text-white touch-manipulation z-20"
          title="Quick View"
        >
          <Eye size={18} />
        </button>
      </div>

      {/* 3. Product Info */}
      <div className="flex-1 flex flex-col items-center text-center w-full px-2 mt-4">
        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 h-10 mb-1 hover:text-blue-600 transition-colors">
          {product.title}
        </h3>
        <div className="flex items-center gap-2 mb-2">
          <p className="text-lg font-bold text-blue-600">
            {formatNaira(displayPrice)}
          </p>
          {product.discountPrice && (
            <p className="text-xs text-gray-400 line-through font-medium">
              {formatNaira(product.price)}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 mb-4">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={12} fill={i < 4 ? "currentColor" : "none"} />
            ))}
          </div>
          <span className="text-[10px] text-gray-400">(120)</span>
        </div>
      </div>

      {/* 4. Functional Add to Cart Button */}
      <button 
        type="button"
        onClick={handleAddToCart}
        className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white py-2.5 rounded-full font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2 z-10"
      >
        <ShoppingCart size={16} />
        Add to Cart
      </button>
    </div>
  );
}
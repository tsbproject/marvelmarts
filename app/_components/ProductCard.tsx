"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  Star, Eye, ShoppingCart, Heart, Edit3, 
  Rocket, Store, ShieldCheck, CheckCircle2 
} from "lucide-react";
import { formatNaira } from "@/app/lib/FormatNaira";
import { SerializedProduct } from "@/types/product";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "@/store/cartSlice";
import { toggleWishlist } from "@/store/wishlistSlice";
import { RootState } from "@/store";
import { useNotification } from "@/app/_context/NotificationContext";
import { useLoadingOverlay } from "@/app/_context/LoadingOverlayContext";
import { toggleProductStatus } from "@/app/lib/actions/product-actions";
import Link from "next/link";

interface ProductCardProps {
  product: SerializedProduct;
  onQuickView?: (p: SerializedProduct) => void;
  onViewDetails?: () => void;
  viewMode?: "grid" | "list";
  isOwner?: boolean; 
}

export default function ProductCard({ 
  product, 
  onQuickView,
  onViewDetails,
  viewMode = "grid",
  isOwner = false 
}: ProductCardProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { notifySuccess, notifyError } = useNotification();
  const { setLoading } = useLoadingOverlay();
  
  const wishlist = useSelector((state: RootState) => state.wishlist.items);
  const isWishlisted = wishlist.some((item) => item.productId === product.id);
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const handleToggleStatus = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const result = await toggleProductStatus(product.id, !!product.isPublished);
    if (result.success) {
      notifySuccess(result.newState ? "Product is now LIVE" : "Product is now HIDDEN");
      router.refresh();
    } else {
      notifyError(result.error || "Failed to update status");
    }
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(toggleWishlist({
      id: product.id,
      productId: product.id, 
      title: product.title,
      slug: typeof product.slug === 'string' ? product.slug : (product.slug as any)?.current,
      price: product.discountPrice ?? product.price,
      imageUrl: product.imageUrl || product.images?.[0]?.url || "/logo.png"
    }));
    // ... API call logic remains same
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation(); 
    dispatch(addToCart({ product, quantity: 1 }));
    notifySuccess(`${product.title} added to your stash!`);
  };

  if (!mounted) {
    return <div className={`bg-white border border-gray-100 rounded-xl p-4 animate-pulse ${viewMode === 'list' ? 'h-40 w-full' : 'h-96 w-full'}`} />;
  }

  const discountPercentage = product.discountPrice 
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : null;

  const displayPrice = product.discountPrice ?? product.price;
  const isList = viewMode === "list";

  return (
    <div 
      onClick={() => {
        const slug = typeof product.slug === 'string' ? product.slug : (product.slug as any)?.current;
        if (slug) {
          setLoading(true);
          router.push(`/products/${slug}`);
        }
      }}
      className={`bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden p-4 shadow-sm hover:shadow-2xl transition-all group relative cursor-pointer active:bg-gray-50 flex ${
        isList ? "flex-row items-center gap-6" : "flex-col items-center"
      }`}
    >
      {/* Sales Label */}
      {discountPercentage && !isOwner && (
        <div className="absolute top-6 left-6 z-10 bg-red-600 text-white text-[10px] font-black w-10 h-10 flex items-center justify-center rounded-full shadow-lg uppercase tracking-tighter">
          -{discountPercentage}%
        </div>
      )}

      {/* Image Section */}
      <div className={`relative overflow-hidden rounded-[1.8rem] bg-neutral-light shrink-0 transition-all ${
        isList ? "w-48 h-48" : "w-full h-72"
      }`}>
        <Image 
          src={product.imageUrl || product.images?.[0]?.url || "/logo.png"} 
          alt={product.title}
          fill 
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className="object-contain p-6 group-hover:scale-110 transition-transform duration-700"
        />
        
        {/* Actions Overlay */}
        <div className="absolute inset-0 bg-accent-navy/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[3px]">
           {isOwner ? (
             <div className="flex flex-col gap-2 w-full px-6">
               <Link 
                 href={`/account/vendor/products/edit/${product.id}`}
                 onClick={(e) => e.stopPropagation()}
                 className="flex items-center justify-center gap-2 py-3 bg-brand-primary text-accent-navy rounded-2xl font-black text-[10px] uppercase tracking-tighter shadow-lg hover:scale-105 transition-transform"
               >
                 <Edit3 size={14} /> Edit Product
               </Link>
               <button 
                 onClick={(e) => { e.stopPropagation(); }}
                 className="flex items-center justify-center gap-2 py-3 bg-white text-accent-navy rounded-2xl font-black text-[10px] uppercase tracking-tighter shadow-lg hover:scale-105 transition-transform"
               >
                 <Rocket size={14} className="text-orange-500" /> Boost Now
               </button>
             </div>
           ) : (
             <>
               <button 
                onClick={(e) => { 
                    e.stopPropagation(); 
                    if (onQuickView) { 
                      onQuickView(product); 
                    }
                  }}
                className="p-4 bg-white rounded-full text-accent-navy shadow-xl hover:bg-brand-primary hover:scale-110 transition-all transform translate-y-6 group-hover:translate-y-0"
               >
                 <Eye size={20} />
               </button>
               <button 
                onClick={handleWishlistToggle}
                className={`p-4 rounded-full shadow-xl transition-all transform translate-y-6 group-hover:translate-y-0 delay-75 hover:scale-110 ${isWishlisted ? 'bg-red-500 text-white' : 'bg-white text-accent-navy'}`}
               >
                 <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
               </button>
             </>
           )}
        </div>
      </div>

      {/* Content Section */}
      <div className={`flex-1 flex flex-col w-full ${isList ? "text-left items-start py-2" : "text-center items-center mt-5 px-2"}`}>
        
        {/* STORE & BRAND LINE */}
        <div className="flex items-center justify-center gap-2 mb-2 overflow-hidden w-full">
          <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest truncate">
            {product.brand || "Premium"}
          </p>
          {!isOwner && product.name && (
            <>
              <span className="w-1 h-1 bg-gray-300 rounded-full" />
              <Link 
                href={`/store/${product.slug}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 group/store"
              >
                <Store size={10} className="text-neutral-gray group-hover/store:text-accent-navy" />
                <span className="text-[10px] font-bold text-neutral-gray uppercase tracking-tighter group-hover/store:text-accent-navy truncate">
                  {product.name}
                </span>
                {product.isVerified && (
                  <CheckCircle2 size={10} className="text-blue-500 fill-blue-50" />
                )}
              </Link>
            </>
          )}
        </div>

        <h3 className={`font-black italic uppercase text-accent-navy leading-tight line-clamp-2 mb-3 ${isList ? "text-2xl" : "text-[13px] h-10 px-2"}`}>
          {product.title}
        </h3>
        
        <div className="flex items-center gap-3 mb-5">
          <p className="text-2xl font-black text-accent-navy italic tracking-tighter">
            {formatNaira(displayPrice)}
          </p>
          {product.discountPrice && (
            <p className="text-xs text-gray-400 line-through font-bold">
              {formatNaira(product.price)}
            </p>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        {!isOwner ? (
          <button 
            onClick={handleAddToCart}
            className={`${isList ? "w-auto px-10" : "w-full"} bg-accent-navy hover:bg-brand-primary text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg hover:shadow-brand-primary/20 flex items-center justify-center gap-3 active:scale-95`}
          >
            <ShoppingCart size={16} /> Add to Cart
          </button>
        ) : (
          <button 
            onClick={handleToggleStatus}
            className="flex items-center gap-2 mt-auto pt-3 border-t border-gray-50 w-full justify-center hover:bg-gray-50 rounded-xl transition-colors group/status"
          >
            <span className={`w-2 h-2 rounded-full ${product.isPublished ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse' : 'bg-red-500'}`} />
            <span className="text-[9px] font-black uppercase text-neutral-gray tracking-tighter group-hover/status:text-accent-navy transition-colors">
              {product.isPublished ? 'Live on Marketplace' : 'Hidden / Draft'}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}


// "use client";

// import React, { useState, useEffect } from "react";
// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import { 
//   Star, Eye, ShoppingCart, Heart, Edit3, 
//   Rocket, Store, ShieldCheck, CheckCircle2 
// } from "lucide-react";
// import { formatNaira } from "@/app/lib/FormatNaira";
// import { SerializedProduct } from "@/types/product";
// import { useDispatch, useSelector } from "react-redux";
// import { addToCart } from "@/store/cartSlice";
// import { toggleWishlist } from "@/store/wishlistSlice";
// import { RootState } from "@/store";
// import { useNotification } from "@/app/_context/NotificationContext";
// import { useLoadingOverlay } from "@/app/_context/LoadingOverlayContext";
// import { toggleProductStatus } from "@/app/lib/actions/product-actions";
// import Link from "next/link";

// interface ProductCardProps {
//   product: SerializedProduct;
//   onQuickView?: (p: SerializedProduct) => void;
//   onViewDetails?: () => void;
//   viewMode?: "grid" | "list";
//   isOwner?: boolean; 
// }

// export default function ProductCard({ 
//   product, 
//   onQuickView,
//   onViewDetails,
//   viewMode = "grid",
//   isOwner = false 
// }: ProductCardProps) {
//   const router = useRouter();
//   const dispatch = useDispatch();
//   const { notifySuccess, notifyError } = useNotification();
//   const { setLoading } = useLoadingOverlay();
  
//   const wishlist = useSelector((state: RootState) => state.wishlist.items);
//   const isWishlisted = wishlist.some((item) => item.productId === product.id);
  
//   const [mounted, setMounted] = useState(false);
//   useEffect(() => { setMounted(true); }, []);

//   // --- IMAGE FALLBACK LOGIC ---
//   // This ensures no empty string ever reaches the Image component
//   const getValidImage = () => {
//     if (product.imageUrl && product.imageUrl.trim() !== "") return product.imageUrl;
//     if (product.images && product.images[0]?.url && product.images[0].url.trim() !== "") return product.images[0].url;
//     return "/logo.png"; // Make sure this exists in /public
//   };

//   const handleToggleStatus = async (e: React.MouseEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     const result = await toggleProductStatus(product.id, !!product.isPublished);
//     if (result.success) {
//       notifySuccess(result.newState ? "Product is now LIVE" : "Product is now HIDDEN");
//       router.refresh();
//     } else {
//       notifyError(result.error || "Failed to update status");
//     }
//   };

//   const handleWishlistToggle = async (e: React.MouseEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     dispatch(toggleWishlist({
//       id: product.id,
//       productId: product.id, 
//       title: product.title,
//       slug: typeof product.slug === 'string' ? product.slug : (product.slug as any)?.current,
//       price: product.discountPrice ?? product.price,
//       imageUrl: getValidImage()
//     }));
//   };

//   const handleAddToCart = (e: React.MouseEvent) => {
//     e.preventDefault(); 
//     e.stopPropagation(); 
//     dispatch(addToCart({ product, quantity: 1 }));
//     notifySuccess(`${product.title} added to your stash!`);
//   };

//   if (!mounted) {
//     return <div className={`bg-white border border-gray-100 rounded-[2.5rem] p-4 animate-pulse ${viewMode === 'list' ? 'h-40 w-full' : 'h-96 w-full'}`} />;
//   }

//   const discountPercentage = product.discountPrice 
//     ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
//     : null;

//   const displayPrice = product.discountPrice ?? product.price;
//   const isList = viewMode === "list";

//   return (
//     <div 
//       onClick={() => {
//         const slug = typeof product.slug === 'string' ? product.slug : (product.slug as any)?.current;
//         if (slug) {
//           setLoading(true);
//           router.push(`/products/${slug}`);
//         }
//       }}
//       className={`bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden p-4 shadow-sm hover:shadow-2xl transition-all group relative cursor-pointer active:bg-gray-50 flex ${
//         isList ? "flex-row items-center gap-6" : "flex-col items-center"
//       }`}
//     >
//       {/* Sales Label */}
//       {discountPercentage && !isOwner && (
//         <div className="absolute top-6 left-6 z-10 bg-red-600 text-white text-[10px] font-black w-10 h-10 flex items-center justify-center rounded-full shadow-lg uppercase tracking-tighter">
//           -{discountPercentage}%
//         </div>
//       )}

//       {/* Image Section */}
//       <div className={`relative overflow-hidden rounded-[1.8rem] bg-[#F8FAFC] shrink-0 transition-all ${
//         isList ? "w-48 h-48" : "w-full h-72"
//       }`}>
//         <Image 
//           src={getValidImage()} 
//           alt={product.title}
//           fill 
//           priority={false}
//           sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
//           className="object-contain p-6 group-hover:scale-110 transition-transform duration-700"
//         />
        
//         {/* Actions Overlay */}
//         <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[3px]">
//            {isOwner ? (
//              <div className="flex flex-col gap-2 w-full px-6">
//                <Link 
//                  href={`/account/vendor/products/edit/${product.id}`}
//                  onClick={(e) => e.stopPropagation()}
//                  className="flex items-center justify-center gap-2 py-3 bg-brand-primary text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-tighter shadow-lg hover:scale-105 transition-transform"
//                >
//                  <Edit3 size={14} /> Edit Product
//                </Link>
//                <button 
//                  onClick={(e) => { e.stopPropagation(); }}
//                  className="flex items-center justify-center gap-2 py-3 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-tighter shadow-lg hover:scale-105 transition-transform"
//                >
//                  <Rocket size={14} className="text-orange-500" /> Boost Now
//                </button>
//              </div>
//            ) : (
//              <>
//                <button 
//                 onClick={(e) => { 
//                     e.stopPropagation(); 
//                     if (onQuickView) { 
//                       onQuickView(product); 
//                     }
//                   }}
//                 className="p-4 bg-white rounded-full text-slate-900 shadow-xl hover:bg-brand-primary hover:scale-110 transition-all transform translate-y-6 group-hover:translate-y-0"
//                >
//                  <Eye size={20} />
//                </button>
//                <button 
//                 onClick={handleWishlistToggle}
//                 className={`p-4 rounded-full shadow-xl transition-all transform translate-y-6 group-hover:translate-y-0 delay-75 hover:scale-110 ${isWishlisted ? 'bg-red-500 text-white' : 'bg-white text-slate-900'}`}
//                >
//                  <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
//                </button>
//              </>
//            )}
//         </div>
//       </div>

//       {/* Content Section */}
//       <div className={`flex-1 flex flex-col w-full ${isList ? "text-left items-start py-2" : "text-center items-center mt-5 px-2"}`}>
        
//         {/* STORE & BRAND LINE */}
//         <div className="flex items-center justify-center gap-2 mb-2 overflow-hidden w-full">
//           <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest truncate">
//             {product.brand || "Premium"}
//           </p>
//           {!isOwner && product.vendorProfile?.storeName && (
//             <>
//               <span className="w-1 h-1 bg-gray-300 rounded-full" />
//               <Link 
//                 href={`/store/${product.vendorProfileId}`}
//                 onClick={(e) => e.stopPropagation()}
//                 className="flex items-center gap-1 group/store"
//               >
//                 <Store size={10} className="text-gray-400 group-hover/store:text-slate-900" />
//                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter group-hover/store:text-slate-900 truncate">
//                   {product.vendorProfile.storeName}
//                 </span>
//                 {product.vendorProfile.isVerified && (
//                   <CheckCircle2 size={10} className="text-blue-500 fill-blue-50" />
//                 )}
//               </Link>
//             </>
//           )}
//         </div>

//         <h3 className={`font-black italic uppercase text-slate-900 leading-tight line-clamp-2 mb-3 ${isList ? "text-2xl" : "text-[13px] h-10 px-2"}`}>
//           {product.title}
//         </h3>
        
//         <div className="flex items-center gap-3 mb-5">
//           <p className="text-2xl font-black text-slate-900 italic tracking-tighter">
//             {formatNaira(displayPrice)}
//           </p>
//           {product.discountPrice && (
//             <p className="text-xs text-gray-400 line-through font-bold">
//               {formatNaira(product.price)}
//             </p>
//           )}
//         </div>

//         {/* FOOTER ACTIONS */}
//         {!isOwner ? (
//           <button 
//             onClick={handleAddToCart}
//             className={`${isList ? "w-auto px-10" : "w-full"} bg-slate-900 hover:bg-brand-primary text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg hover:shadow-brand-primary/20 flex items-center justify-center gap-3 active:scale-95`}
//           >
//             <ShoppingCart size={16} /> Add to Cart
//           </button>
//         ) : (
//           <button 
//             onClick={handleToggleStatus}
//             className="flex items-center gap-2 mt-auto pt-3 border-t border-gray-50 w-full justify-center hover:bg-gray-50 rounded-xl transition-colors group/status"
//           >
//             <span className={`w-2 h-2 rounded-full ${product.isPublished ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse' : 'bg-red-500'}`} />
//             <span className="text-[9px] font-black uppercase text-gray-400 tracking-tighter group-hover/status:text-slate-900 transition-colors">
//               {product.isPublished ? 'Live on Marketplace' : 'Hidden / Draft'}
//             </span>
//           </button>
//         )}
//       </div>
//     </div>
//   );
// }


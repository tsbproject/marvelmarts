


"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  Eye, ShoppingCart, Heart, Edit3, 
  Rocket, Store, CheckCircle2 
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

  const getValidImage = () => {
    if (product.imageUrl && product.imageUrl.trim() !== "") return product.imageUrl;
    if (product.images && product.images[0]?.url) return product.images[0].url;
    return "/logo.png";
  };

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
      imageUrl: getValidImage()
    }));
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation(); 
    dispatch(addToCart({ product, quantity: 1 }));
    notifySuccess(`${product.title} added to your stash!`);
  };

  if (!mounted) {
    return <div className={`bg-white border border-gray-100 rounded-[2rem] p-4 animate-pulse ${viewMode === 'list' ? 'h-32 w-full' : 'h-80 w-full'}`} />;
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
      className={`bg-white border border-gray-100 rounded-[2rem] overflow-hidden p-3 shadow-sm hover:shadow-xl transition-all group relative cursor-pointer active:bg-gray-50 flex ${
        isList ? "flex-row items-center gap-4" : "flex-col items-center"
      }`}
    >
      {/* Sales Label */}
      {discountPercentage && !isOwner && (
        <div className="absolute top-4 left-4 z-10 bg-red-600 text-white text-[9px] font-black w-9 h-9 flex items-center justify-center rounded-full shadow-lg uppercase tracking-tighter">
          -{discountPercentage}%
        </div>
      )}

      {/* Image Section - Reduced Height for 16px Harmony */}
      <div className={`relative overflow-hidden rounded-[1.4rem] bg-[#F8FAFC] shrink-0 transition-all ${
        isList ? "w-32 h-32" : "w-full h-56"
      }`}>
        <Image 
          src={getValidImage()} 
          alt={product.title}
          fill 
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Actions Overlay */}
        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
           {isOwner ? (
             <div className="flex flex-col gap-2 w-full px-4">
               <Link 
                 href={`/account/vendor/products/edit/${product.id}`}
                 onClick={(e) => e.stopPropagation()}
                 className="flex items-center justify-center gap-2 py-2 bg-brand-primary text-slate-900 rounded-xl font-black text-[9px] uppercase tracking-tighter shadow-lg hover:scale-105 transition-transform"
               >
                 <Edit3 size={12} /> Edit
               </Link>
               <button 
                 onClick={(e) => { e.stopPropagation(); }}
                 className="flex items-center justify-center gap-2 py-2 bg-white text-slate-900 rounded-xl font-black text-[9px] uppercase tracking-tighter shadow-lg hover:scale-105 transition-transform"
               >
                 <Rocket size={12} className="text-orange-500" /> Boost
               </button>
             </div>
           ) : (
             <>
               <button 
                onClick={(e) => { 
                    e.stopPropagation(); 
                    if (onQuickView) onQuickView(product); 
                  }}
                className="p-3 bg-white rounded-full text-slate-900 shadow-xl hover:bg-brand-primary hover:scale-110 transition-all"
               >
                 <Eye size={18} />
               </button>
               <button 
                onClick={handleWishlistToggle}
                className={`p-3 rounded-full shadow-xl transition-all hover:scale-110 ${isWishlisted ? 'bg-red-500 text-white' : 'bg-white text-slate-900'}`}
               >
                 <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
               </button>
             </>
           )}
        </div>
      </div>

      {/* Content Section */}
      <div className={`flex-1 flex flex-col w-full ${isList ? "text-left items-start py-1" : "text-center items-center mt-3 px-1"}`}>
        
        {/* STORE & BRAND LINE */}
        <div className="flex items-center justify-center gap-2 mb-1 overflow-hidden w-full">
          <p className="text-[9px] font-black text-brand-primary uppercase tracking-widest truncate">
            {product.brand || "Premium"}
          </p>
          {!isOwner && product.vendorProfile?.storeName && (
            <>
              <span className="w-1 h-1 bg-gray-300 rounded-full" />
              <Link 
                href={`/store/${product.vendorProfileId}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 group/store"
              >
                <Store size={10} className="text-gray-400 group-hover/store:text-slate-900" />
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter group-hover/store:text-slate-900 truncate">
                  {product.vendorProfile.storeName}
                </span>
                {product.vendorProfile.isVerified && (
                  <CheckCircle2 size={10} className="text-blue-500 fill-blue-50" />
                )}
              </Link>
            </>
          )}
        </div>

        <h3 className={`font-black italic uppercase text-slate-900 leading-tight line-clamp-2 mb-2 ${isList ? "text-lg" : "text-[12px] h-8 px-1"}`}>
          {product.title}
        </h3>
        
        <div className="flex items-center gap-2 mb-3">
          <p className="text-xl font-black text-slate-900 italic tracking-tighter">
            {formatNaira(displayPrice)}
          </p>
          {product.discountPrice && (
            <p className="text-[10px] text-gray-400 line-through font-bold">
              {formatNaira(product.price)}
            </p>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        {!isOwner ? (
          <button 
            onClick={handleAddToCart}
            className={`${isList ? "w-auto px-8" : "w-full"} bg-slate-900 hover:bg-brand-primary text-white py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 active:scale-95`}
          >
            <ShoppingCart size={14} /> Add to Cart
          </button>
        ) : (
          <button 
            onClick={handleToggleStatus}
            className="flex items-center gap-2 mt-auto pt-2 border-t border-gray-50 w-full justify-center hover:bg-gray-50 rounded-lg transition-colors group/status"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${product.isPublished ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)] animate-pulse' : 'bg-red-500'}`} />
            <span className="text-[8px] font-black uppercase text-gray-400 tracking-tighter group-hover/status:text-slate-900 transition-colors">
              {product.isPublished ? 'Live' : 'Draft'}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}


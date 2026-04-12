"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Eye, ShoppingCart, Heart, Edit3,
  Rocket, Store, CheckCircle2, Zap, Star
} from "lucide-react";
import { formatNaira } from "@/app/lib/FormatNaira";
import { SerializedProduct } from "@/types/product";
import{ getDaysRemaining } from "@/app/lib/utils/boost-utils"
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
          if (typeof product.imageUrl === "string" && product.imageUrl.trim()) {
            return product.imageUrl;
          }

          if (Array.isArray(product.images) && product.images.length > 0) {
            const firstValidImage = product.images.find(
              (img: any) => typeof img?.url === "string" && img.url.trim()
            );
            if (firstValidImage?.url) return firstValidImage.url;
          }

          return "/placeholder-image.png";
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

  

      const wishlistItem = {
        id: product.id,
        productId: product.id,
        title: product.title,
        slug: typeof product.slug === "string" ? product.slug : (product.slug as any)?.current,
        price: product.discountPrice ?? product.price,
        imageUrl: getValidImage(),
        product: {
          title: product.title,
          slug: typeof product.slug === "string" ? product.slug : (product.slug as any)?.current,
          images: Array.isArray(product.images) ? product.images : [],
        },
      };

  const wasWishlisted = isWishlisted;

  // optimistic update
  dispatch(toggleWishlist(wishlistItem));

  try {
    const res = await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      // rollback
      dispatch(toggleWishlist(wishlistItem));
      notifyError(data?.error || "Failed to update wishlist");
      return;
    }

    if (data.action === "added") {
      notifySuccess("Added to Wishlist");
    } else if (data.action === "removed") {
      notifySuccess("Removed from Wishlist");
    }
  } catch (error) {
    // rollback
    dispatch(toggleWishlist(wishlistItem));
    notifyError("Failed to update wishlist");
    console.error("Wishlist sync failed:", error);
  }
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

  // ── Safe price handling ──────────────────────────────────────────────
  const rawPrice = Number(product.price) || 0;
  const rawDiscountPrice = Number(product.discountPrice) || 0;

  const displayPrice = rawDiscountPrice > 0 ? rawDiscountPrice : rawPrice;

  const hasRealDiscount = rawDiscountPrice > 0 && rawDiscountPrice < rawPrice;
  const discountPercentage = hasRealDiscount
    ? Math.round(((rawPrice - rawDiscountPrice) / rawPrice) * 100)
    : null;

  const isList = viewMode === "list";


  // 2. USE THE IMPORTED UTILITY
  // Temporary fix to stop the red error
  const daysLeft = getDaysRemaining((product as any).boostUntil);
  // const daysLeft = getDaysRemaining(product.boostUntil);
  const isBoosted = daysLeft > 0;


 return (
  <div
    onClick={() => {
      const slug = typeof product.slug === 'string' ? product.slug : (product.slug as any)?.current;
      if (slug) {
        setLoading(true);
        router.push(`/products/${slug}`);
      }
    }}
    className={`bg-white border border-gray-50 rounded-[2rem] overflow-hidden p-3 shadow-sm hover:shadow-2xl transition-all duration-500 group relative cursor-pointer flex ${
      isList ? "flex-row items-center gap-6" : "flex-col items-center"
    }`}
  >
    {/* 1. SALES BADGE */}
    {discountPercentage && !isOwner && (
      <div className="absolute top-4 left-4 z-30 bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg uppercase tracking-widest border border-white/20">
        {discountPercentage}% OFF
      </div>
    )}

    {/* 2. IMAGE SECTION - Reduced Height */}
    <div
      className={`relative overflow-hidden rounded-[1.6rem] bg-gray-50/50 shrink-0 transition-all ${
        isList ? "w-65 h-65" : "w-full h-65"   
      }`}
    >
      <Image
        src={getValidImage()}
        alt={product.title}
        fill
        className="object-contain p-6 group-hover:scale-110 transition-transform duration-700 ease-in-out"
      />

      {/* MOBILE WISHLIST */}
      {!isOwner && (
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-4 right-4 z-30 md:hidden flex h-10 w-10 items-center justify-center rounded-full shadow-xl transition-all ${
            isWishlisted ? "bg-red-500 text-white" : "bg-white/80 backdrop-blur-sm text-slate-900"
          }`}
        >
          <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
        </button>
      )}

      {/* DESKTOP HOVER OVERLAY */}
      <div className="absolute inset-0 z-20 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex items-center justify-center gap-3">
        <button
          onClick={(e) => { e.stopPropagation(); onQuickView?.(product); }}
          className="p-4 bg-white rounded-full text-slate-900 shadow-2xl hover:bg-brand-primary hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300"
        >
          <Eye size={20} />
        </button>
        <button
          onClick={handleWishlistToggle}
          className={`p-4 rounded-full shadow-2xl transition-all transform translate-y-4 group-hover:translate-y-0 duration-500 delay-75 ${
            isWishlisted ? "bg-red-500 text-white" : "bg-white text-slate-900 hover:bg-red-50"
          }`}
        >
          <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
        </button>
      </div>
    </div>

    {/* 3. CONTENT SECTION - Tighter Vertical Spacing */}
    <div className={`flex-1 flex flex-col w-full relative ${isList ? "text-left py-1" : "text-center mt-3 px-2"}`}>
      
      {/* BRAND & STORE */}
      <div className={`flex items-center gap-2 mb-1 ${isList ? "" : "justify-center"}`}>
        <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">
          {product.brand || "Original"}
        </span>
        
        {!isOwner && product.vendorProfile?.storeName && (
          <>
            <span className="w-1 h-1 bg-gray-300 rounded-full" />
            <Link
              href={`/store/${product.vendorProfile?.store?.slug || product.vendorProfileId}`} 
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 group/store overflow-hidden"
            >
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter group-hover/store:text-slate-900 transition-colors truncate">
                {product.vendorProfile?.storeName}
              </span>
              {product.vendorProfile?.isVerified && (
                <CheckCircle2 size={10} className="text-blue-500" />
              )}
            </Link>
          </>
        )}
      </div>

      {/* TITLE - Reduced min-height */}
      <h3 className={`font-bold text-slate-800 leading-tight line-clamp-2 mb-1 group-hover:text-brand-primary transition-colors ${
        isList ? "text-lg" : "text-[14px] min-h-[38px]"
      }`}>
        {product.title}
      </h3>

      {/* STAR RATING */}
      <div className={`flex items-center gap-1 mb-2 ${isList ? "" : "justify-center"}`}>
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={10}
              className={`${
                star <= (product.rating || 5) 
                  ? "text-[#F7931E] fill-[#F7931E]" 
                  : "text-gray-200 fill-gray-200"
              }`}
            />
          ))}
        </div>
        <span className="text-[9px] font-bold text-gray-400 mt-0.5">
          ({product.reviewCount || 0})
        </span>
      </div>

      {/* PRICE DISPLAY */}
      <div className={`flex items-baseline gap-2 mb-3 ${isList ? "" : "justify-center"}`}>
        <span className="text-lg font-black text-accent-navy tracking-tighter">
          {formatNaira(displayPrice)}
        </span>
        {hasRealDiscount && (
          <span className="text-[11px] text-gray-400 line-through font-medium">
            {formatNaira(rawPrice)}
          </span>
        )}
      </div>

      {/* ADD TO CART BUTTON - Slightly more compact */}
      {!isOwner && (
        <div className={`transition-all duration-500 ${isList ? "static" : "absolute inset-x-0 -bottom-2 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-[-10px] z-40"}`}>
          <button
            onClick={handleAddToCart}
            className="w-full bg-accent-navy hover:bg-brand-primary text-white py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95 border border-white/10"
          >
            <ShoppingCart size={16} /> Add To Cart
          </button>
        </div>
      )}

      {/* OWNER STATUS FOOTER */}
      {isOwner && (
        <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-center gap-3">
          <div className={`w-2 h-2 rounded-full ${product.isPublished ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-[10px] font-bold uppercase text-gray-500">
            {product.isPublished ? 'Live on Mart' : 'Draft Mode'}
          </span>
        </div>
      )}
    </div>
  </div>
);
}
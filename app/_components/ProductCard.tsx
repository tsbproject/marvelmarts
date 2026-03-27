




"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Eye, ShoppingCart, Heart, Edit3,
  Rocket, Store, CheckCircle2, Zap
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

  // const getValidImage = () => {
  //     if (product.imageUrl && product.imageUrl.trim() !== "") return product.imageUrl;
  //     if (product.images && product.images[0]?.url) return product.images[0].url;
  //     return "/placeholder-product.png";
  //   };


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

      {isOwner && isBoosted && (
        <div className="absolute top-4 right-4 z-20 bg-[#F7931E] text-[#002B5B] text-[8px] font-black w-9 h-9 flex flex-col items-center justify-center rounded-full shadow-lg uppercase tracking-tighter border border-white/20 animate-in zoom-in duration-300">
          <Zap size={10} fill="currentColor" className="animate-pulse mb-[1px]" />
          <span>{daysLeft}D</span>
        </div>
      )}

      {/* Image Section */}
        <div
          className={`relative overflow-hidden rounded-[1.4rem] bg-[#F8FAFC] shrink-0 transition-all ${
            isList ? "w-32 h-32" : "w-full h-56"
          }`}
        >
          <Image
            src={getValidImage()}
            alt={product.title?.trim() ? `${product.title} product image` : "Product image"}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
          />

          {/* Mobile Wishlist Button */}
          {!isOwner && (
            <button
              type="button"
              onClick={handleWishlistToggle}
              className={`absolute top-3 right-3 z-30 flex md:hidden h-10 w-10 items-center justify-center rounded-full shadow-xl transition-all active:scale-95 ${
                isWishlisted ? "bg-red-500 text-white" : "bg-white text-slate-900"
              }`}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
            </button>
          )}

          {/* Actions Overlay */}
          <div className="absolute inset-0 z-20 bg-slate-900/40 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px] md:flex">
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
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  className="flex items-center justify-center gap-2 py-2 bg-white text-slate-900 rounded-xl font-black text-[9px] uppercase tracking-tighter shadow-lg hover:scale-105 transition-transform"
                >
                  <Rocket size={12} className={isBoosted ? "text-green-500" : "text-[#F7931E]"} />
                  {isBoosted ? "Extend" : "Boost"}
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (onQuickView) onQuickView(product);
                  }}
                  className="p-3 bg-white rounded-full text-slate-900 shadow-xl hover:bg-brand-primary hover:scale-110 transition-all"
                >
                  <Eye size={18} />
                </button>

                <button
                  type="button"
                  onClick={handleWishlistToggle}
                  className={`hidden md:flex p-3 rounded-full shadow-xl transition-all hover:scale-110 ${
                    isWishlisted ? "bg-red-500 text-white" : "bg-white text-slate-900"
                  }`}
                  aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
                </button>
              </>
            )}
          </div>
        </div>

      {/* Content Section */}
      <div className={`flex-1 flex flex-col w-full ${isList ? "text-left items-start py-1" : "text-center items-center mt-3 px-1"}`}>
          
          {/* SMALL TRENDING INDICATOR */}
            {isOwner && isBoosted && (
              <div className="flex items-center gap-1 mb-1 animate-pulse">
                <span className="text-[7px] font-black text-green-600 uppercase tracking-widest italic">
                  Trending Engine Active
                </span>
              </div>
            )}
        
        {/* STORE & BRAND LINE */}
        <div className="flex items-center justify-center gap-2 mb-1 overflow-hidden w-full">
          <p className="text-[9px] font-black text-brand-primary uppercase tracking-widest truncate">
            {product.brand || "Premium"}
          </p>
          {!isOwner && product.vendorProfile?.storeName && (
            <>
              <span className="w-1 h-1 bg-gray-300 rounded-full" />
              <Link
               
                href={`/store/${product.vendorProfile?.store?.slug || product.vendorProfileId}`} 
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 group/store"
              >
                <Store size={10} className="text-gray-400 group-hover/store:text-slate-900" />
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter group-hover/store:text-slate-900 truncate">
                  {product.vendorProfile?.storeName}
                </span>
                {product.vendorProfile?.isVerified && (
                  <CheckCircle2 size={10} className="text-blue-500 fill-blue-50" />
                )}
              </Link>
            </>
          )}
        </div>

        <h3 className={`font-black  italic uppercase text-brand-primary leading-tight line-clamp-2 mb-2 ${isList ? "text-xs" : "text-[12px] h-10 px-1"}`}>
          {product.title}
        </h3>

        {/* PRICE DISPLAY SECTION */}
        <div className="flex items-center gap-2 mb-3 min-h-[24px]">
          <p className="text-xs font-black text-accent-navy italic tracking-tighter whitespace-nowrap">
            {formatNaira(displayPrice)}
          </p>

          {hasRealDiscount && (
            <p className="text-[10px] text-gray-400 line-through font-bold whitespace-nowrap">
              {formatNaira(rawPrice)}
            </p>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        {!isOwner ? (
          <button
            onClick={handleAddToCart}
            className={`${isList ? "w-auto px-8" : "w-full"} bg-accent-navy hover:bg-brand-primary text-white py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 active:scale-95`}
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
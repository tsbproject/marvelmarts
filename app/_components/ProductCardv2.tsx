"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Eye,
  ShoppingCart,
  Heart,
  CheckCircle2,
  Star,
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
    const result = await toggleProductStatus(product.id);
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
    notifySuccess(`${product.title} added to your cart!`);
  };

 if (!mounted) {
  return (
    <div
      className={`overflow-hidden rounded-3xl border border-gray-200 bg-white animate-pulse ${
        viewMode === "list"
          ? "h-40 w-full"
          : "aspect-[0.82] w-full"
      }`}
    >
      <div className="aspect-square w-full bg-gray-100" />

      <div className="space-y-3 p-5">
        <div className="h-3 w-24 rounded bg-gray-200" />
        <div className="h-4 w-full rounded bg-gray-200" />
        <div className="h-4 w-3/4 rounded bg-gray-200" />
        <div className="h-6 w-32 rounded bg-gray-200" />
      </div>
    </div>
  );
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
        const slug =
        typeof product.slug === "string"
            ? product.slug
            : (product.slug as any)?.current;

        if (slug) {
        setLoading(true);
        router.push(`/products/${slug}`);
        }
    }}
    className={`group relative overflow-hidden  rounded-3xl  border-slate-200/80 bg-white transition-all duration-500 cursor-pointer
    hover:-translate-y-2
    hover:border-brand-primary/30
    hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)]
    ${
        isList
        ? "flex flex-row gap-6 p-5"
        : "flex flex-col p-4"
    }`}
    >
    {/* 1. SALES BADGE */}
    {discountPercentage && !isOwner && (
      <div className="absolute left-3 top-3 z-30 rounded-full bg-gradient-to-r from-red-500 to-rose-500 px-3 py-1 text-[11px] font-bold text-white shadow-lg backdrop-blur">
        {discountPercentage}% OFF
      </div>
    )}

    {/* 2. IMAGE SECTION - Reduced Height */}
    <div
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-50 to-white ${
            isList
            ? "h-52 w-52 shrink-0"
            : "aspect-square max-full"
        }`}
        >
      <Image
        src={getValidImage()}
        alt={product.title}
        fill
        className="object-center p-3 md:p-5 transition-transform duration-700 group-hover:scale-105 group-hover:rotate-[1deg]"
        />

      {/* MOBILE WISHLIST */}
      {!isOwner && (
        <button
          onClick={handleWishlistToggle}
          className={`absolute right-3 top-3 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-white/40 backdrop-blur-md shadow-lg transition-all md:hidden ${
            isWishlisted ? "bg-red-500 text-white" : "bg-white/80 backdrop-blur-sm text-slate-900"
          }`}
        >
          <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
        </button>
      )}

      {/* DESKTOP HOVER OVERLAY */}
      <div className="absolute inset-0 z-20 bg-gradient-to-t from-slate-900/20 via-transparent to-transparent backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex items-center justify-center gap-3">
        <button
          onClick={(e) => { e.stopPropagation(); onQuickView?.(product); }}
          className="flex h-10 w-10 lg:h-11 lg:w-11 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-xl backdrop-blur transition-all duration-300 hover:bg-brand-primary hover:text-white translate-y-3 group-hover:translate-y-0"
        >
          <Eye size={20} />
        </button>
        <button
          onClick={handleWishlistToggle}
          className={`flex h-11 w-11 items-center justify-center rounded-full shadow-xl backdrop-blur transition-all duration-500 delay-75 translate-y-3 group-hover:translate-y-0 ${
            isWishlisted ? "bg-red-500 text-white" : "bg-white text-slate-900 hover:bg-red-50"
          }`}
        >
          <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
        </button>
      </div>
    </div>

    {/* 3. CONTENT SECTION - Tighter Vertical Spacing */}
    <div
        className={`relative flex flex-1 flex-col w-full ${
            isList
            ? "justify-center py-1"
            : "pt-4"
        }`}
        >
      
      {/* BRAND & STORE */}
      <div
        className={`flex items-center gap-2 text-xs ${
            isList ? "" : "justify-between"
        }`}
        >
        <span className="text-xs font-bold uppercase tracking-wide text-brand-primary hidden">
          {product.brand || "Original"}
        </span>
        
        {!isOwner && product.vendorProfile?.storeName && (
          <>
            <span className="w-1 h-1 bg-gray-300 rounded-full" />
            <Link
              href={`/store/${product.vendorProfile?.store?.slug || product.vendorProfileId}`} 
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 group/store overflow-hidden "
            >
              <span className="truncate text-xs font-medium text-slate-500 transition-colors group-hover/store:text-slate-900">
                {product.vendorProfile?.storeName}
              </span>
              {product.vendorProfile?.isVerified && (
                <CheckCircle2 size={14} className="text-blue-500" />
              )}
            </Link>
          </>
        )}
      </div>

      {/* TITLE */}
      <h3 className={`mt-0 line-clamp-5 font-medium leading-snug text-slate-900 transition-colors group-hover:text-brand-primary ${
        isList
            ? "text-sm"
            : "max-h-[15px] text-xs lg:text-xs"
        }`}>
        {product.title}
      </h3>

      {/* STAR RATING */}
      <div className={`mt-2 flex items-center gap-2 ${isList ? "" : "justify-center hidden"}`}>
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={14}
              className={`${
                star <= Math.round(product.rating || 5) 
                  ? "text-[#F7931E] fill-[#F7931E]" 
                  : "text-gray-200 fill-gray-200"
              }`}
            />
          ))}
        </div>
        <span className="text-xs font-medium text-slate-500">
          ({product.reviewCount || 0})
        </span>
      </div>

      {/* PRICE DISPLAY */}
      <div
        className={`mt-4 flex items-end gap-2 ${
            isList ? "" : "justify-between"
        }`}
        >
        <div className="flex flex-col">
            <span className="text-[10px]  font-extrabold tracking-tight text-accent-navy lg:text-xl">
            {formatNaira(displayPrice)}
            </span>

            {hasRealDiscount && (
            <span className="text-xs text-slate-400 line-through">
                {formatNaira(rawPrice)}
            </span>
            )}
        </div>

  {discountPercentage && (
    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
      Save {discountPercentage}%
    </span>
  )}
</div>

      {/* ADD TO CART BUTTON - Slightly more compact */}
      {!isOwner && (
        <div
            className={`mt-5 transition-all duration-300 ${
                isList
                ? ""
                : "translate-y-3 opacity-0 group-hover:translate-y-2 group-hover:opacity-110 "
            }`}
            >
            <button
                onClick={handleAddToCart}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-accent-navy text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:bg-brand-primary active:scale-[0.98]"
            >
                <ShoppingCart size={18} />
                Add to Cart
            </button>
            </div>
      )}

      {/* OWNER STATUS FOOTER */}
      {isOwner && (
        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <div className={`w-2.5 h-2.5 rounded-full ${product.isPublished ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {product.isPublished ? 'Live on Mart' : 'Draft Mode'}
          </span>
        </div>
      )}
    </div>
  </div>
);
}

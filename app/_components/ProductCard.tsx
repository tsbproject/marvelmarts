"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Eye, ShoppingCart, Heart, Edit3,
  Rocket, Store, CheckCircle2, Zap, Power, Star
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
        const slug =
          typeof product.slug === "string"
            ? product.slug
            : (product.slug as any)?.current;
        if (slug) {
          setLoading(true);
          router.push(`/products/${slug}`);
        }
      }}
      className={`group relative bg-white border border-slate-150/80 rounded-3xl p-3.5 shadow-sm hover:shadow-xl hover:shadow-slate-900/5 transition-all duration-300 cursor-pointer flex ${
        isList
          ? "flex-col sm:flex-row items-center gap-6"
          : "flex-col justify-between h-full"
      }`}
    >
      {/* ── TOP BADGES ── */}
      <div className="absolute top-5 left-5 z-20 flex flex-col gap-1.5 pointer-events-none">
        {discountPercentage && !isOwner && (
          <span className="bg-gradient-to-r from-red-600 to-rose-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-md uppercase tracking-widest border border-white/20 backdrop-blur-md">
            -{discountPercentage}%
          </span>
        )}

        {isBoosted && (
          <span className="bg-gradient-to-r from-amber-500 to-brand-primary text-accent-navy text-[9px] font-black px-2.5 py-1 rounded-full shadow-md uppercase tracking-wider flex items-center gap-1 border border-white/30">
            <Zap size={10} className="fill-current" /> Boosted
          </span>
        )}
      </div>

      {/* ── IMAGE SECTION ── */}
      <div
        className={`relative overflow-hidden rounded-2xl bg-slate-50/80 shrink-0 border border-slate-100/60 transition-all ${
          isList ? "w-full sm:w-56 h-56" : "w-full aspect-square"
        }`}
      >
        <Image
          src={getValidImage()}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-contain p-4 group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Mobile Wishlist Quick Button */}
        {!isOwner && (
          <button
            onClick={handleWishlistToggle}
            aria-label="Wishlist"
            className={`absolute top-3 right-3 z-20 md:hidden flex h-9 w-9 items-center justify-center rounded-full shadow-md backdrop-blur-md transition-all active:scale-90 ${
              isWishlisted
                ? "bg-red-500 text-white"
                : "bg-white/90 text-slate-700 hover:bg-white"
            }`}
          >
            <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
          </button>
        )}

        {/* Desktop Quick Actions Overlay */}
        {!isOwner && (
          <div className="absolute inset-0 z-20 bg-slate-900/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 hidden md:flex items-center justify-center gap-2.5">
            {onQuickView && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickView(product);
                }}
                className="p-3 bg-white rounded-xl text-accent-navy shadow-lg hover:bg-brand-primary hover:text-accent-navy transition-all duration-200 transform translate-y-2 group-hover:translate-y-0"
                title="Quick View"
              >
                <Eye size={18} />
              </button>
            )}
            <button
              onClick={handleWishlistToggle}
              className={`p-3 rounded-xl shadow-lg transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 ${
                isWishlisted
                  ? "bg-red-500 text-white"
                  : "bg-white text-slate-800 hover:bg-red-50 hover:text-red-500"
              }`}
              title="Add to Wishlist"
            >
              <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
            </button>
          </div>
        )}
      </div>

      {/* ── CONTENT SECTION ── */}
      <div
        className={`flex-1 flex flex-col justify-between w-full ${
          isList ? "py-1" : "mt-3 px-1"
        }`}
      >
        <div>
          {/* Brand & Vendor Details */}
          <div className="flex items-center justify-between gap-2 mb-1.5 text-[11px]">
            <span className="font-extrabold text-brand-primary uppercase tracking-wider truncate">
              {product.brand || "Original"}
            </span>

            {!isOwner && product.vendorProfile?.storeName && (
              <Link
                href={`/store/${
                  product.vendorProfile?.store?.slug || product.vendorProfileId
                }`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 group/store overflow-hidden max-w-[50%]"
              >
                <span className="font-semibold text-slate-400 group-hover/store:text-accent-navy transition-colors truncate">
                  {product.vendorProfile?.storeName}
                </span>
                {product.vendorProfile?.isVerified && (
                  <CheckCircle2
                    size={12}
                    className="text-blue-500 shrink-0 fill-blue-500/10"
                  />
                )}
              </Link>
            )}
          </div>

          {/* Title */}
          <h3
            className={`font-semibold text-slate-800 leading-snug line-clamp-2 group-hover:text-brand-primary transition-colors ${
              isList ? "text-base md:text-lg mb-2" : "text-xs md:text-sm mb-1.5 h-10"
            }`}
          >
            {product.title}
          </h3>

          {/* Ratings */}
          <div className="flex items-center gap-1.5 mb-2.5">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={12}
                  className={
                    star <= (product.rating || 5)
                      ? "text-amber-400 fill-amber-400"
                      : "text-slate-200 fill-slate-200"
                  }
                />
              ))}
            </div>
            <span className="text-[11px] font-bold text-slate-400">
              ({product.reviewCount || 0})
            </span>
          </div>
        </div>

        {/* Pricing & Add To Cart */}
        <div className="pt-2 border-t border-slate-100/80">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-base md:text-lg font-black text-accent-navy tracking-tight">
              {formatNaira(displayPrice)}
            </span>
            {hasRealDiscount && (
              <span className="text-xs text-slate-400 line-through font-medium">
                {formatNaira(rawPrice)}
              </span>
            )}
          </div>

          {!isOwner && (
            <button
              onClick={handleAddToCart}
              className="w-full bg-accent-navy hover:bg-brand-primary hover:text-accent-navy text-white py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <ShoppingCart size={15} />
              <span>Add To Cart</span>
            </button>
          )}

          {/* Owner Dashboard Control Options */}
          {isOwner && (
            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                onClick={handleToggleStatus}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl border text-[11px] font-bold transition-all ${
                  product.isPublished
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <Power size={12} />
                <span>{product.isPublished ? "Live" : "Draft"}</span>
              </button>

              <Link
                href={`/dashboard/vendor/products/edit/${product.id}`}
                onClick={(e) => e.stopPropagation()}
                className="py-1.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-bold transition-all"
              >
                Edit
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

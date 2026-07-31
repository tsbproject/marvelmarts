"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";

import { addToCart } from "@/store/cartSlice";
import { toggleWishlist } from "@/store/wishlistSlice";
import { RootState } from "@/store";
import { useNotification } from "@/app/_context/NotificationContext";
import { useLoadingOverlay } from "@/app/_context/LoadingOverlayContext";
import { toggleProductStatus } from "@/app/lib/actions/product-actions";

import { ProductCardProps } from "./ProductCardTypes";
import { ProductBadges } from "./ProductBadges";
import { ProductImageContainer } from "./ProductImageContainer";
import { ProductVendorInfo } from "./ProductVendorInfo";
import { ProductRating } from "./ProductRating";
import { ProductPricingBar } from "./ProductPricingBar";
import { ProductOwnerControls } from "./ProductOwnerControl";

export default function ProductCard({
  product,
  onQuickView,
  viewMode = "grid",
  isOwner = false,
}: ProductCardProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { notifySuccess, notifyError } = useNotification();
  const { setLoading } = useLoadingOverlay();

  const wishlist = useSelector((state: RootState) => state.wishlist.items);
  const isWishlisted = wishlist.some((item) => item.productId === product.id);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

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
      notifySuccess(
        result.newState ? "Product is now LIVE" : "Product is now HIDDEN"
      );
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
      slug:
        typeof product.slug === "string"
          ? product.slug
          : (product.slug as any)?.current,
      price: product.discountPrice ?? product.price,
      imageUrl: getValidImage(),
      product: {
        title: product.title,
        slug:
          typeof product.slug === "string"
            ? product.slug
            : (product.slug as any)?.current,
        images: Array.isArray(product.images) ? product.images : [],
      },
    };

    // Optimistic Update
    dispatch(toggleWishlist(wishlistItem));

    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });

    if (res.status === 401) {
        dispatch(toggleWishlist(wishlistItem)); // rollback optimistic update
    
        notifyError("Please sign in to save items to your wishlist.");
    
        return;
        }

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // Rollback
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
      // Rollback
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
        className={`bg-white border border-slate-100 rounded-2xl p-2.5 animate-pulse ${
          viewMode === "list" ? "h-40 w-full" : "h-72 w-full"
        }`}
      />
    );
  }

  const isList = viewMode === "list";

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
      className={`group relative bg-white border border-slate-200/70 rounded-2xl p-2.5 shadow-sm hover:shadow-xl hover:shadow-slate-950/5 hover:border-slate-300 transition-all duration-300 ease-out cursor-pointer flex ${
        isList
          ? "flex-col sm:flex-row items-center gap-4"
          : "flex-col justify-between h-full"
      }`}
    >
      {/* 1. Floating Badges Component */}
      <ProductBadges product={product} isOwner={isOwner} />

      {/* 2. Image Component */}
      <ProductImageContainer
        product={product}
        isList={isList}
        isOwner={isOwner}
        validImage={getValidImage()}
        isWishlisted={isWishlisted}
        handleWishlistToggle={handleWishlistToggle}
        onQuickView={onQuickView}
      />

      {/* 3. Product Info Section */}
      <div
        className={`flex-1 flex flex-col justify-between w-full ${
          isList ? "py-0.5" : "mt-2 px-0.5"
        }`}
      >
        <div>
          {/* Vendor Details Component */}
          <ProductVendorInfo product={product} isOwner={isOwner} />

          {/* Title */}
          <h3
            className={`font-medium text-slate-800 leading-snug line-clamp-2 group-hover:text-brand-primary transition-colors ${
              isList ? "text-sm md:text-base mb-1" : "text-xs mb-1 min-h-[32px]"
            }`}
          >
            {product.title}
          </h3>

          {/* Rating Component */}
          <ProductRating
            rating={product.rating}
            reviewCount={product.reviewCount}
          />
        </div>

        {/* 4. Pricing / Controls Footer */}
        {isOwner ? (
          <ProductOwnerControls
            product={product}
            handleToggleStatus={handleToggleStatus}
          />
        ) : (
          <ProductPricingBar
            product={product}
            isOwner={isOwner}
            handleAddToCart={handleAddToCart}
          />
        )}
      </div>
    </div>
  );
}
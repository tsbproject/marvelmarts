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

import { ProductCardProps } from "./types";
import {
  getValidImage,
  getProductSlug,
  getPriceState,
  getBoostState,
} from "./utils";
import ProductCardBadges from "./ProductCardBadges";
import ProductCardImage from "./ProductCardImage";
import ProductCardInfo from "./ProductCardInfo";
import ProductCardPricing from "./ProductCardPricing";
import ProductCardCustomerActions from "./ProductCardCustomerActions";
import ProductCardOwnerActions from "./ProductCardOwnerActions";

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

  // ── Handlers (all original logic preserved) ──────────────────────────
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

  const imageUrl = getValidImage(product);
  const slug = getProductSlug(product) ?? ""; // ensure string

  const wishlistItem = {
    id: product.id,
    productId: product.id,
    title: product.title,
    slug, // now always string
    price: product.discountPrice ?? product.price,
    imageUrl,
    product: {
      title: product.title,
      slug, // now always string
      images: Array.isArray(product.images) ? product.images : [],
    },
  };

  // optimistic update
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
      dispatch(toggleWishlist(wishlistItem)); // rollback
      notifyError(data?.error || "Failed to update wishlist");
      return;
    }

    if (data.action === "added") notifySuccess("Added to Wishlist");
    else if (data.action === "removed") notifySuccess("Removed from Wishlist");
  } catch (error) {
    dispatch(toggleWishlist(wishlistItem)); // rollback
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

  const handleCardClick = () => {
    const slug = getProductSlug(product);
    if (slug) {
      setLoading(true);
      router.push(`/products/${slug}`);
    }
  };

  // ── Derived state ────────────────────────────────────────────────────
  if (!mounted) {
    return (
      <div
        className={`bg-white border border-slate-100 rounded-2xl p-3 animate-pulse ${
          viewMode === "list" ? "h-28 w-full" : "h-64 w-full"
        }`}
      />
    );
  }

  if (!product?.id) return null;

  const price = getPriceState(product);
  const { isBoosted } = getBoostState(product);
  const imageSrc = getValidImage(product);
  const isList = viewMode === "list";

  return (
    <div
      onClick={handleCardClick}
      className={`group relative bg-white border border-slate-100/90 rounded-2xl p-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,43,91,0.08)] hover:border-slate-200 transition-all duration-300 cursor-pointer flex ${
        isList
          ? "flex-col sm:flex-row items-center gap-4"
          : "flex-col justify-between h-full"
      }`}
    >
      <ProductCardBadges
        discountPercentage={price.discountPercentage}
        isBoosted={isBoosted}
        isOwner={isOwner}
      />

      <ProductCardImage
        product={product}
        imageSrc={imageSrc}
        isList={isList}
        isOwner={isOwner}
        isWishlisted={isWishlisted}
        onQuickView={onQuickView}
        onWishlistToggle={handleWishlistToggle}
      />

      <div
        className={`flex-1 flex flex-col justify-between w-full min-w-0 ${
          isList ? "py-0.5" : "mt-2.5 px-0.5"
        }`}
      >
        <ProductCardInfo product={product} isList={isList} isOwner={isOwner} />

        <div className="mt-2.5 pt-2 border-t border-slate-100/70 space-y-2">
          <ProductCardPricing price={price} />

          {!isOwner ? (
            <ProductCardCustomerActions onAddToCart={handleAddToCart} />
          ) : (
            <ProductCardOwnerActions
              product={product}
              onToggleStatus={handleToggleStatus}
            />
          )}
        </div>
      </div>
    </div>
  );
}
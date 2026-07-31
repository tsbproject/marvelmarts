"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
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
import ProductImage from "@/app/_components/product-card/ProductImage";
import ProductInfo from "@/app/_components/product-card/ProductInfo";
import ProductPrice from "@/app/_components/product-card/ProductPrice";
import ProductActions from "@/app/_components/product-card/ProductActions";
import ProductOwnerFooter from "@/app/_components/product-card/ProductOwnerFooter";


interface ProductCardProps {
  product: SerializedProduct;
  onQuickView?: (p: SerializedProduct) => void;
  onViewDetails?: () => void;
  viewMode?: "grid" | "list";
  isOwner?: boolean;
  density?: "comfortable" | "compact";
}



export default function ProductCard({
  product,
  onQuickView,
  viewMode = "grid",
  isOwner = false,
  density = "comfortable",
}: ProductCardProps) {
  
  
  
  const isList = viewMode === "list";
  const isCompact = density === "compact";
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


    if (res.status === 401) {
      dispatch(toggleWishlist(wishlistItem)); // rollback optimistic update

      notifyError("Please sign in to save items to your wishlist.");

      return;
    }

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
        ? "flex flex-row gap-2 p-4 md:p-5"
        : isCompact
          ? "flex flex-col p-2 sm:p-2.5 md:p-4"
          : "flex flex-col p-4"
          }`}
    >
    {/* PRODUCT IMAGE SECTION */}
    <ProductImage
        product={product}
        imageUrl={getValidImage()}
        isList={isList}
        isOwner={isOwner}
        isWishlisted={isWishlisted}
        discountPercentage={discountPercentage}
        onWishlist={handleWishlistToggle}
        onQuickView={onQuickView}
        />

    {/* 3. CONTENT SECTION - Tighter Vertical Spacing */}
    <div
        className={`relative flex flex-1 flex-col w-full ${
           isList
            ? "justify-center py-1"
            : isCompact
              ? "pt-2"
              : "pt-4"
                  }`}
        >
      
      <ProductInfo
        product={product}
        isOwner={isOwner}
        isList={isList}
/>

      {/* PRICE DISPLAY */}
     <ProductPrice
        displayPrice={displayPrice}
        rawPrice={rawPrice}
        hasRealDiscount={hasRealDiscount}
        discountPercentage={discountPercentage}
        isList={isList}
        formatNaira={formatNaira}
        />

      {/* ADD TO CART BUTTON - Slightly more compact */}
      <ProductActions
        isOwner={isOwner}
        isList={isList}
        onAddToCart={handleAddToCart}
        />

      {/* OWNER STATUS FOOTER */}
     <ProductOwnerFooter
        isOwner={isOwner}
        isPublished={product.isPublished}
        />
    </div>
  </div>
);
}

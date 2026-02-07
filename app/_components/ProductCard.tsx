"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Star, Eye, ShoppingCart, Heart } from "lucide-react";
import { formatNaira } from "@/app/lib/FormatNaira";
import { SerializedProduct } from "@/types/product";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "@/store/cartSlice";
import { toggleWishlist } from "@/store/wishlistSlice";
import { RootState } from "@/store";
import { useNotification } from "@/app/_context/NotificationContext";
import { useLoadingOverlay } from "@/app/_context/LoadingOverlayContext";

interface ProductCardProps {
  product: SerializedProduct;
  onQuickView: (p: SerializedProduct) => void;
  onViewDetails?: () => void;
  viewMode?: "grid" | "list";
}

export default function ProductCard({ 
  product, 
  onQuickView,
  onViewDetails,
  viewMode = "grid"
}: ProductCardProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { notifySuccess } = useNotification();
  const { setLoading } = useLoadingOverlay();
  
  // 1. Redux Wishlist State
  const wishlist = useSelector((state: RootState) => state.wishlist.items);
  const isWishlisted = wishlist.some((item) => item.id === product.id);

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // 2. Wishlist Toggle Function (The missing piece!)
  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Instant Redux Update for snappy UI
    dispatch(toggleWishlist({
      id: product.id,
      productId: product.id, 
      name: product.title,   
      slug: typeof product.slug === 'string' ? product.slug : (product.slug as any)?.current,
      price: product.discountPrice ?? product.price,
      image: product.imageUrl || product.images?.[0]?.url || "/logo.png" 
    }));

    // Sync with Database in background
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
      className={`bg-white border border-gray-100 rounded-[2rem] overflow-hidden p-4 shadow-sm hover:shadow-xl transition-all group relative cursor-pointer active:bg-gray-50 flex ${
        isList ? "flex-row items-center gap-6" : "flex-col items-center"
      }`}
    >
      {/* Sales Label */}
      {discountPercentage && (
        <div className="absolute top-4 left-4 z-10 bg-red-600 text-white text-[10px] font-black w-10 h-10 flex items-center justify-center rounded-full shadow-lg uppercase">
          -{discountPercentage}%
        </div>
      )}

      {/* Image Section */}
      <div className={`relative overflow-hidden rounded-2xl bg-neutral-light shrink-0 transition-all ${
        isList ? "w-40 h-40" : "w-full h-64"
      }`}>
        <Image 
          src={product.imageUrl || product.images?.[0]?.url || "/logo.png"} 
          alt={product.title}
          fill 
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          unoptimized
          className="object-contain p-4 group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Actions Overlay */}
        <div className="absolute inset-0 bg-accent-navy/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
           <button 
            onClick={(e) => { e.stopPropagation(); onQuickView(product); }}
            className="p-3 bg-white rounded-full text-accent-navy shadow-xl hover:bg-brand-primary hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0"
           >
             <Eye size={18} />
           </button>
           <button 
            onClick={handleWishlistToggle}
            className={`p-3 rounded-full shadow-xl transition-all transform translate-y-4 group-hover:translate-y-0 delay-75 ${isWishlisted ? 'bg-red-500 text-white' : 'bg-white text-accent-navy'}`}
           >
             <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
           </button>
        </div>
      </div>

      {/* Content Section */}
      <div className={`flex-1 flex flex-col ${isList ? "text-left items-start" : "text-center items-center mt-4 w-full px-2"}`}>
        <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-1">
          {product.brand || "Premium Gear"}
        </p>
        <h3 className={`font-black italic uppercase text-accent-navy leading-tight line-clamp-2 mb-2 ${isList ? "text-xl" : "text-sm h-10"}`}>
          {product.title}
        </h3>
        
        <div className="flex items-center gap-3 mb-4">
          <p className="text-xl font-black text-accent-navy italic">
            {formatNaira(displayPrice)}
          </p>
          {product.discountPrice && (
            <p className="text-xs text-gray-400 line-through font-bold">
              {formatNaira(product.price)}
            </p>
          )}
        </div>

        <button 
          onClick={handleAddToCart}
          className={`${isList ? "w-auto px-8" : "w-full"} bg-accent-navy hover:bg-brand-primary text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2`}
        >
          <ShoppingCart size={14} /> Add to Cart
        </button>
      </div>
    </div>
  );
}
"use client";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { toggleWishlist } from "@/store/wishlistSlice";
import { addToCart } from "@/store/cartSlice";
import { useNotification } from "@/app/_context/NotificationContext";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Heart, ArrowRight, ShoppingBag } from "lucide-react";
import { formatNaira } from "@/app/lib/FormatNaira";

// 1. Defined the interface to match your Redux state structure
interface WishlistItem {
  id: string;
  title: string;
  slug: string;
  price: number;
  imageUrl: string;
}

export default function WishlistPage() {
  const dispatch = useDispatch();
  
  // 2. Explicitly typed the selector to prevent Line 15 errors
  const items = useSelector((state: RootState) => state.wishlist.items) as WishlistItem[];
  const { notifySuccess } = useNotification();

  // 3. Cleaned up handleMoveToCart (fixed the duplicate notify and braces)
  const handleMoveToCart = (item: WishlistItem) => {
    dispatch(addToCart({ 
      product: { 
        id: item.id,
        title: item.title,
        slug: item.slug,
        price: item.price,
        imageUrl: item.imageUrl,
        categoryName: "Gear" 
      }, 
      quantity: 1 
    }));
    notifySuccess(`${item.title} moved to stash!`);
  };

  // 4. Properly typed the removal function
  const removeFromWishlist = async (item: WishlistItem) => {
    dispatch(toggleWishlist(item));
    try {
      await fetch("/api/wishlist", {
        method: "POST",
        body: JSON.stringify({ productId: item.id }),
      });
    } catch (error) {
      console.error("Failed to sync wishlist removal:", error);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="w-24 h-24 bg-neutral-light rounded-full flex items-center justify-center text-neutral-gray mb-6">
          <Heart size={40} />
        </div>
        <h1 className="text-4xl font-black italic uppercase text-accent-navy tracking-tighter mb-4">
          Your Stash is <span className="text-brand-primary">Empty</span>
        </h1>
        <p className="text-neutral-gray text-sm font-bold uppercase tracking-widest mb-10 text-center">
          You haven&apos;t marked any tactical gear yet.
        </p>
        <Link 
          href="/shop" 
          className="bg-brand-primary text-neutral-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-accent-navy transition-all flex items-center gap-3"
        >
          Explore Armory <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
        <div>
          <p className="text-brand-primary font-black uppercase tracking-[0.4em] text-[10px] mb-2">
            Your Personal Collection
          </p>
          <h1 className="text-5xl md:text-7xl font-black italic uppercase text-accent-navy tracking-tighter leading-none">
            Saved <span className="text-brand-primary">Loot</span>
          </h1>
        </div>
        <div className="text-neutral-gray font-bold text-[10px] uppercase tracking-[0.2em]">
          {items.length} Items Reserved
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item: WishlistItem) => (
          <div 
            key={item.id} 
            className="group relative bg-white rounded-[2.5rem] border border-neutral-light p-4 transition-all hover:shadow-2xl hover:shadow-brand-primary/10 overflow-hidden"
          >
            {/* Image Container */}
            <Link 
              href={`/products/${item.slug}`} 
              className="block relative aspect-square bg-neutral-light rounded-[2rem] mb-6 overflow-hidden"
            >
              <Image
                src={item.imageUrl || "/logo.png"}
                alt={item.title}
                fill
                className="object-contain p-6 transition-transform duration-500 group-hover:scale-110"
              />
            </Link>

            {/* Content */}
            <div className="px-2 space-y-1 mb-6">
              <h3 className="font-black uppercase italic text-accent-navy text-sm tracking-tight truncate">
                {item.title}
              </h3>
              <p className="text-brand-primary font-black text-lg italic">
                {formatNaira(item.price)}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => handleMoveToCart(item)}
                className="flex-1 bg-accent-navy text-neutral-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-brand-primary transition-colors"
              >
                <ShoppingBag size={14} /> Add to Stash
              </button>
              <button
                onClick={() => removeFromWishlist(item)}
                className="w-14 h-14 bg-neutral-light text-neutral-gray rounded-xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setWishlist, removeFromWishlist } from "@/store/wishlistSlice";
import { addToCart } from "@/store/cartSlice"; 
import { RootState } from "@/store";
import DashboardHeader from "@/app/_components/DashboardHeader";
import { Trash2, ShoppingCart, Heart, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useNotification } from "@/app/_context/NotificationContext";

interface WishlistItem {
  id: string; 
  productId: string;
  name?: string;
  price?: number;
  image?: string;
  slug?: string;
  product?: {
    name: string;
    price: number;
    images: { url: string }[];
    slug: string;
  };
}

export default function WishlistClient({ initialItems }: { initialItems: WishlistItem[] }) {
  const [mounted, setMounted] = useState(false);
  const dispatch = useDispatch();
  const { notifySuccess, notifyError } = useNotification(); 
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);

  useEffect(() => {
    setMounted(true);
    dispatch(setWishlist(initialItems as any));
  }, [initialItems, dispatch]);

  const nairaFormatter = useMemo(() => new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }), []);

  const handleDelete = async (id: string) => {
    if (!id || id === "undefined") return;

    // 1. Find the specific item we are deleting (for rollback only)
    const itemToRestore = wishlistItems.find(item => item.id === id);
    setLoadingId(id);
    
    try {
      // 2. Optimistic Update: Remove ONLY this item from Redux
      dispatch(removeFromWishlist(id)); 

      const response = await fetch(`/api/wishlist/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Server rejected deletion");
      }

      notifySuccess("Item removed");
    } catch (error: any) {
      console.error("Delete Error:", error.message);
      
      // 3. SMART ROLLBACK: Only put back the item that failed
      if (itemToRestore) {
        // We add it back to the existing items instead of overwriting with a full backup
        const restoredList = [...wishlistItems, itemToRestore];
        dispatch(setWishlist(restoredList));
      }
      
      notifyError("Failed to remove item. It has been restored.");
    } finally {
      setLoadingId(null);
    }
  };

  if (!mounted) return <div className="min-h-screen bg-neutral-light/20 animate-pulse" />;

  return (
    <div className="min-h-screen bg-neutral-light/20">
      <DashboardHeader title="My Wishlist" showLogout={false} />
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        {wishlistItems.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {wishlistItems.map((item: WishlistItem) => {
              const currentId = item.id;
              const pName = item.name || item.product?.name || "Product";
              const pPrice = item.price || item.product?.price || 0;
              const pImage = item.image || item.product?.images?.[0]?.url || "/placeholder-product.png";

              return (
                <div key={currentId} className="bg-white rounded-[24px] p-3 border border-gray-100 shadow-sm flex flex-col">
                  <div className="relative aspect-[4/5] mb-3 overflow-hidden rounded-[18px] bg-neutral-100">
                    <Image src={pImage} alt={pName} fill unoptimized className="object-cover" />
                  </div>
                  <div className="flex-1 px-1">
                    <h3 className="font-bold text-accent-navy text-xs md:text-sm line-clamp-1 uppercase">{pName}</h3>
                    <p className="text-brand-primary font-black text-sm md:text-base">{nairaFormatter.format(pPrice)}</p>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button className="flex-1 bg-brand-primary text-accent-navy h-9 rounded-xl font-black text-[9px] uppercase">Add to Cart</button>
                    <button 
                      onClick={() => handleDelete(currentId)}
                      disabled={loadingId === currentId}
                      className="w-9 h-9 flex items-center justify-center border border-red-50 text-red-400 rounded-xl"
                    >
                      {loadingId === currentId ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
           <div className="text-center py-24 bg-white rounded-[40px] border border-gray-100 shadow-sm">
            <Heart size={32} className="mx-auto mb-4 text-brand-primary" />
            <h2 className="text-xl font-black text-accent-navy">Your Wishlist is Empty</h2>
            <Link href="/shop" className="inline-block bg-brand-primary text-accent-navy px-8 py-3 rounded-xl font-black uppercase text-xs mt-6 transition-hover hover:scale-105">
              Explore Shop
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
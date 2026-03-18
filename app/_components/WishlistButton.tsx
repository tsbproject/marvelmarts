



"use client";

import { Heart } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { toggleWishlist, WishlistItem } from "@/store/wishlistSlice";
import { useNotification } from "@/app/_context/NotificationContext";

interface Product {
  id: string;
  title: string;
  price: number;
  images: string[];
  slug: string;
  [key: string]: any; // Allows for other properties
}

export default function WishlistButton({ product }: { product: Product }) {
  const dispatch = useDispatch();
  const { notifySuccess } = useNotification();
  const wishlist = useSelector((state: RootState) => state.wishlist.items);

  // Check if item exists using productId for consistency with the slice logic
  const isWishlisted = wishlist.some((item) => item.productId === product.id);

  const handleToggle = async (e: React.MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();

  const wishlistItem: WishlistItem = {
  id: product.id,
  productId: product.id,
  title: product.title,
  imageUrl: product.images?.[0] || "",
  price: product.price,
  slug: product.slug,
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
      console.error("Wishlist server rejection:", data);
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
    console.error("Wishlist sync failed:", error);
  }
};

  return (
    <button
      onClick={handleToggle}
      className={`p-3 rounded-2xl transition-all duration-300 ${
        isWishlisted 
          ? "bg-red-500 text-white shadow-lg" 
          : "bg-white text-gray-400 hover:text-red-500 border border-gray-100"
      }`}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
    </button>
  );
}
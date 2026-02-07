// "use client";

// import { Heart } from "lucide-react";
// import { useDispatch, useSelector } from "react-redux";
// import { RootState } from "@/store"; // Adjust path to your store
// import { toggleWishlist } from "@/store/wishlistSlice";
// import { useNotification } from "@/app/_context/NotificationContext";

// export default function WishlistButton({ product }: { product: any }) {
//   const dispatch = useDispatch();
//   const { notifySuccess } = useNotification();
//   const wishlist = useSelector((state: RootState) => state.wishlist.items);
//   const isWishlisted = wishlist.some((item) => item.id === product.id);

//   const handleToggle = async (e: React.MouseEvent) => {
//     e.preventDefault();
//     e.stopPropagation();

//     // 1. Instant UI update
//     dispatch(toggleWishlist(product));

//     // 2. Sync with Database
//     try {
//       const res = await fetch("/api/wishlist", {
//         method: "POST",
//         body: JSON.stringify({ productId: product.id }),
//       });
      
//       if (res.ok) {
//         const data = await res.json();
//         if (data.action === "added") notifySuccess("Added to Wishlist");
//       }
//     } catch (error) {
//       console.error("Wishlist sync failed");
//     }
//   };

//   return (
//     <button
//       onClick={handleToggle}
//       className={`p-3 rounded-2xl transition-all duration-300 ${
//         isWishlisted 
//           ? "bg-red-500 text-white shadow-lg" 
//           : "bg-white text-gray-400 hover:text-red-500 border border-gray-100"
//       }`}
//     >
//       <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
//     </button>
//   );
// }





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

    // 1. Map product to match the WishlistItem interface strictly
    const wishlistItem: WishlistItem = {
      id: product.id, // Fallback ID
      productId: product.id,
      title: product.title,
      imageUrl: product.images?.[0] || "", // Ensure we pass the image
      price: product.price,
      slug: product.slug,
    };

    // 2. Instant Redux update
    dispatch(toggleWishlist(wishlistItem));

    // 3. Sync with Database
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });
      
      if (res.ok) {
        const data = await res.json();
        // Notify based on the server response action
        if (data.action === "added") {
          notifySuccess("Added to Wishlist");
        }
      }
    } catch (error) {
      console.error("Wishlist sync failed:", error);
      // Optional: notifyError("Failed to update wishlist")
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
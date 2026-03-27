// "use client";

// import { useSelector, useDispatch } from "react-redux";
// import { RootState } from "@/store";
// import { toggleWishlist, WishlistItem } from "@/store/wishlistSlice"; 
// import { addToCart } from "@/store/cartSlice";
// import { useNotification } from "@/app/_context/NotificationContext";
// import Image from "next/image";
// import Link from "next/link";
// import { Trash2, Heart, ArrowRight, ShoppingBag } from "lucide-react";
// import { formatNaira } from "@/app/lib/FormatNaira";
// import { SerializedProduct } from "@/types/product";

// export default function WishlistPage() {
//   const dispatch = useDispatch();
//   const { notifySuccess } = useNotification();

//   // 1. Select items from Redux - RootState now provides the type naturally
//   const items = useSelector((state: RootState) => state.wishlist.items);


//           const getWishlistImage = (item: any) => {
//           if (typeof item?.imageUrl === "string" && item.imageUrl.trim()) {
//             if (
//               item.imageUrl !== "/placeholder-image.png" &&
//               item.imageUrl !== "/placeholder-product.png"
//             ) {
//               return item.imageUrl;
//             }
//           }

//           if (Array.isArray(item?.images) && item.images.length > 0) {
//             const firstValidImage = item.images.find(
//               (img: any) => typeof img?.url === "string" && img.url.trim()
//             );
//             if (firstValidImage?.url) return firstValidImage.url;
//           }

//           return "/placeholder-image.png";
//         };


      

//   /**
//    * 2. Handle Move to Cart
//    * Maps the WishlistItem structure to the SerializedProduct structure strictly.
//    * Includes all missing mandatory fields to satisfy TypeScript/Build constraints.
//    */
//  const handleMoveToCart = (item: WishlistItem) => {
//  const productForCart: SerializedProduct = {
//       id: item.productId, // Use the product reference ID
//       title: item.title,
//       name: item.title,
//       slug: item.slug || "",
//       price: item.price,
//       imageUrl: item.imageUrl,
//       categoryName: (item as any).categoryName || "Tactical Gear",
//       description: "", 
//       discountPrice: null,
//       images: [{ url: item.imageUrl }], 
//       stock: 10, 
//       isPublished: true, 
//       isTrending: false, 
//       createdAt: new Date().toISOString(), 
//       updatedAt: new Date().toISOString(),
//       vendorProfileId: (item as any).vendorProfileId || (item as any).vendorId || "",

//     vendorProfile: {
//     storeName: "Vendor",
//     isVerified: false, 
//   }
//     };
//     dispatch(addToCart({ 
//       product: productForCart, 
//       quantity: 1 
//     }));

    
    
//     notifySuccess(`${item.title} moved to stash!`);
//   };

//   /**
//    * 3. Sync Removal
//    * Uses the centralized type to ensure productId is never undefined.
//    */
//   const removeFromWishlist = async (item: WishlistItem) => {
//     // UI updates instantly via Redux
//     dispatch(toggleWishlist(item));
    
//     try {
//       await fetch("/api/wishlist", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ productId: item.productId }),
//       });
//     } catch (error) {
//       console.error("Failed to sync wishlist removal:", error);
//     }
//   };

//   if (items.length === 0) {
//     return (
//       <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
//         <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-6">
//           <Heart size={40} />
//         </div>
//         <h1 className="text-md md:text-3xl font-black italic uppercase text-accent-navy tracking-tighter mb-4 text-center">
//           Your Cart is <span className="text-brand-primary">Empty</span>
//         </h1>
//         <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-10 text-center">
//           You haven&apos;t marked any tactical gear yet.
//         </p>
//         <Link 
//           href="/shop" 
//           className="bg-accent-navy text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-slate-900 transition-all flex items-center gap-3"
//         >
//           Explore Armory <ArrowRight size={16} />
//         </Link>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-4 py-12 min-h-screen">
//       <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
//         <div>
//           <p className="text-accent-navy font-black uppercase tracking-[0.4em] text-[10px] mb-2">
//             Your Personal Collection
//           </p>
//           <h1 className="text-sm md:text-3xl font-black italic uppercase text-aceent-navy tracking-tighter leading-none">
//             Saved <span className="text-brand-primary">Loot</span>
//           </h1>
//         </div>
//         <div className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em]">
//           {items.length} Items Reserved
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//         {items.map((item) => (
//           <div 
//             key={item.id} 
//             className="group relative bg-white rounded-[2.5rem] border border-gray-100 p-4 transition-all hover:shadow-2xl hover:shadow-blue-600/10 overflow-hidden"
//           >

            
//             <Link
//               href={`/products/${item.slug}`}
//               className="block relative aspect-square bg-gray-50 rounded-[2rem] mb-6 overflow-hidden"
//             >
//               <Image
//                 src={getWishlistImage(item)}
//                 alt={item.title?.trim() ? `${item.title} product image` : "Product image"}
//                 fill
//                 className="object-contain text-brand-primary p-6 transition-transform duration-500 group-hover:scale-110"
//               />
//             </Link>

//             <div className="px-2 space-y-1 mb-6">
//               <h3 className="font-black uppercase italic text-accent-navy text-sm tracking-tight truncate">
//                 {item.title}
//               </h3>
//               <p className="text-accent-navy font-black text-lg italic">
//                 {formatNaira(item.price)}
//               </p>
//             </div>

//             <div className="flex gap-2">
//               <button
//                 onClick={() => handleMoveToCart(item)}
//                 className="flex-1 bg-accent-navy text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors"
//               >
//                 <ShoppingBag size={14} /> Add to Stash
//               </button>
//               <button
//                 onClick={() => removeFromWishlist(item)}
//                 className="w-14 h-14 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors"
//               >
//                 <Trash2 size={18} />
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );





"use client";

import { useEffect, useState } from "react";
import { addToCart } from "@/store/cartSlice";
import { useDispatch } from "react-redux";
import { useNotification } from "@/app/_context/NotificationContext";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Heart, ArrowRight, ShoppingBag } from "lucide-react";
import { formatNaira } from "@/app/lib/FormatNaira";
import { SerializedProduct } from "@/types/product";

type WishlistItem = {
  id: string;
  productId: string;
  name: string;
  slug: string;
  price: number;
  image: string;
};

export default function WishlistPage() {
  const dispatch = useDispatch();
  const { notifySuccess, notifyError } = useNotification();

  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchWishlist = async () => {
        try {
          setLoading(true);
          setError("");

          const res = await fetch("/api/wishlist", {
            method: "GET",
            cache: "no-store",
          });

          const data = await res.json().catch(() => []);

          if (!res.ok) {
            const message =
              data?.error ||
              data?.message ||
              `Failed to load wishlist (${res.status})`;

            console.error("WISHLIST GET FAILED:", {
              status: res.status,
              statusText: res.statusText,
              data,
            });

            throw new Error(message);
          }

          setItems(Array.isArray(data) ? data : []);
        } catch (err: any) {
          console.error("WISHLIST FETCH ERROR:", err);
          setError(err?.message || "Failed to load wishlist.");
        } finally {
          setLoading(false);
        }
      };

    fetchWishlist();
  }, []);

  const handleMoveToCart = (item: WishlistItem) => {
    const productForCart: SerializedProduct = {
      id: item.productId,
      title: item.name,
      name: item.name,
      slug: item.slug || "",
      price: item.price,
      imageUrl: item.image,
      categoryName: "Tactical Gear",
      description: "",
      discountPrice: null,
      images: [{ url: item.image }],
      stock: 10,
      isPublished: true,
      isTrending: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      vendorProfileId: "",
      vendorProfile: {
        storeName: "Vendor",
        isVerified: false,
      },
    };

    dispatch(addToCart({ product: productForCart, quantity: 1 }));
    notifySuccess(`${item.name} moved to stash!`);
  };

  const removeFromWishlist = async (item: WishlistItem) => {
    const previousItems = items;
    setItems((current) => current.filter((entry) => entry.productId !== item.productId));

    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: item.productId }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setItems(previousItems);
        throw new Error(data?.error || "Failed to update wishlist");
      }
    } catch (err: any) {
      console.error("Failed to sync wishlist removal:", err);
      notifyError(err?.message || "Failed to remove item from wishlist.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-xs">
          Loading Wishlist...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center text-red-400 mb-6">
          <Heart size={40} />
        </div>
        <h1 className="text-md md:text-3xl font-black italic uppercase text-accent-navy tracking-tighter mb-4 text-center">
          Unable to Load <span className="text-red-500">Wishlist</span>
        </h1>
        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest text-center">
          {error}
        </p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-6">
          <Heart size={40} />
        </div>
        <h1 className="text-md md:text-3xl font-black italic uppercase text-accent-navy tracking-tighter mb-4 text-center">
          Your Wishlist is <span className="text-brand-primary">Empty</span>
        </h1>
        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-10 text-center">
          You haven&apos;t marked any tactical gear yet.
        </p>
        <Link
          href="/shop"
          className="bg-accent-navy text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-slate-900 transition-all flex items-center gap-3"
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
          <p className="text-accent-navy font-black uppercase tracking-[0.4em] text-[10px] mb-2">
            Your Personal Collection
          </p>
          <h1 className="text-sm md:text-3xl font-black italic uppercase text-accent-navy tracking-tighter leading-none">
            Saved <span className="text-brand-primary">Loot</span>
          </h1>
        </div>
        <div className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em]">
          {items.length} Items Reserved
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="group relative bg-white rounded-[2.5rem] border border-gray-100 p-4 transition-all hover:shadow-2xl hover:shadow-blue-600/10 overflow-hidden"
          >
            <Link
              href={`/products/${item.slug}`}
              className="block relative aspect-square bg-gray-50 rounded-[2rem] mb-6 overflow-hidden"
            >
              <Image
                src={item.image || "/placeholder-product.png"}
                alt={item.name?.trim() ? `${item.name} product image` : "Product image"}
                fill
                className="object-contain text-brand-primary p-6 transition-transform duration-500 group-hover:scale-110"
              />
            </Link>

            <div className="px-2 space-y-1 mb-6">
              <h3 className="font-black uppercase italic text-accent-navy text-sm tracking-tight truncate">
                {item.name}
              </h3>
              <p className="text-accent-navy font-black text-lg italic">
                {formatNaira(item.price)}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleMoveToCart(item)}
                className="flex-1 bg-accent-navy text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors"
              >
                <ShoppingBag size={14} /> Add to Stash
              </button>
              <button
                onClick={() => removeFromWishlist(item)}
                className="w-14 h-14 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors"
                aria-label="Remove from wishlist"
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
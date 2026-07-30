// "use client";

// import React from "react";
// import { useSelector } from "react-redux";
// import { motion } from "framer-motion";
// import { Flame, ChevronRight, ShoppingCart, Rocket } from "lucide-react";
// import Link from "next/link";
// import Image from "next/image";
// import { SerializedProduct } from "@/types/product";
// import { formatNaira } from "@/app/lib/FormatNaira";

// interface TrendingCarouselProps {
//   initialData: SerializedProduct[];
// }

// export default function TrendingCarousel({ initialData }: TrendingCarouselProps) {
//   const reduxItems = useSelector((state: any) => state.trending?.items);
//   const rawProducts = reduxItems && reduxItems.length > 0 ? reduxItems : initialData;

//   // --- BOOST LOGIC SORTING ---
//   // Ensure products with active boostUntil dates appear first if the server hasn't sorted them
//   const trendingProducts = [...rawProducts].sort((a, b) => {
//     const aIsBoosted = a.boostUntil && new Date(a.boostUntil) > new Date();
//     const bIsBoosted = b.boostUntil && new Date(b.boostUntil) > new Date();
//     if (aIsBoosted && !bIsBoosted) return -1;
//     if (!aIsBoosted && bIsBoosted) return 1;
//     return 0;
//   });

//   if (!trendingProducts || trendingProducts.length === 0) return null;

//   return (
//     <section className="py-12 bg-white overflow-hidden">
//       <div className="container mx-auto px-4">
//         {/* Header */}
//         <div className="flex items-end justify-between mb-8">
//           <div>
//             <div className="flex items-center gap-2 text-orange-600 mb-2">
//               <Flame size={18} fill="currentColor" className="animate-pulse" />
//               <span className="text-[10px] font-black uppercase tracking-[0.2em]">Hot Products</span>
//             </div>
//             <h2 className="text-md md:text-2xl font-black uppercase italic tracking-tighter text-[var(--accent-navy)]">
//               Trending <span className="text-[var(--brand-primary)]">Products</span>
//             </h2>
//           </div>
//           <Link 
//             href="/shop" 
//             className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-600 transition-colors"
//           >
//             View All Armory <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
//           </Link>
//         </div>

//         {/* Carousel Rail */}
//         <div className="relative group">
//           <motion.div 
//             className="flex gap-6 pb-8 cursor-grab active:cursor-grabbing"
//             animate={{
//               x: [0, -1000, 0], 
//             }}
//             transition={{
//               duration: 25,
//               ease: "linear",
//               repeat: Infinity,
//               repeatType: "reverse",
//             }}
//             whileHover={{ animationPlayState: "paused" }} 
//           >
//             {trendingProducts.map((product: SerializedProduct) => {
//               // --- IMAGE LOGIC ---
//               const validSrc = (product.imageUrl && product.imageUrl.trim() !== "") 
//                 ? product.imageUrl 
//                 : (product.images && product.images[0]?.url) 
//                 ? product.images[0].url 
//                 : "/logo.png"; 

//               const slug = typeof product.slug === 'string' ? product.slug : (product.slug as any)?.current;

//               // --- BOOST ACTIVE CHECK ---
//               const isBoosted = product.boostUntil && new Date(product.boostUntil) > new Date();

//               return (
//                 <div 
//                   key={product.id} 
//                   className="min-w-[280px] md:min-w-[320px] group/card"
//                 >
//                   <Link href={`/products/${slug}`}>
//                     <div className="relative aspect-[4/5] bg-gray-50 rounded-3xl overflow-hidden mb-4 border border-gray-100 transition-all hover:shadow-2xl hover:shadow-blue-100">
                      
//                       {/* BOOST BADGE */}
//                       {isBoosted && (
//                         <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 bg-[var(--accent-navy)] text-[var(--brand-primary)] px-3 py-1.5 rounded-full shadow-xl">
//                           <Rocket size={12} className="animate-bounce" />
//                           <span className="text-[8px] font-black uppercase tracking-widest italic">Promoted</span>
//                         </div>
//                       )}

//                       <Image 
//                         src={validSrc} 
//                         alt={product.title}
//                         fill
//                         className="object-cover transition-transform duration-700 group-hover/card:scale-110"
//                         sizes="(max-width: 768px) 280px, 320px"
//                       />
                      
//                       <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex items-end p-6">
//                          <button className="w-full bg-white text-black py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition-colors">
//                            <ShoppingCart size={14} /> Quick Add
//                          </button>
//                       </div>
//                     </div>
//                   </Link>

//                   <div className="space-y-1 px-2">
//                     <div className="flex items-center justify-between">
//                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
//                         {product.categoryName || "Tactical"}
//                         </p>
//                         {isBoosted && <span className="text-[8px] font-black text-orange-500 uppercase italic">Featured</span>}
//                     </div>
//                     <h3 className="font-black text-lg uppercase tracking-tight text-gray-900 leading-tight group-hover/card:text-blue-600 transition-colors">
//                       {product.title}
//                     </h3>
//                                         <p className="text-blue-600 font-black text-xl">
//                       {formatNaira(product.price)}
//                     </p>
//                   </div>
//                 </div>
//               );
//             })}
//           </motion.div>
//         </div>
//       </div>
//     </section>
//   );
// }



"use client";

import React, { useRef, useState } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Flame, ChevronRight, ShoppingCart, Rocket } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { SerializedProduct } from "@/types/product";
import { formatNaira } from "@/app/lib/FormatNaira";

interface TrendingCarouselProps {
  initialData: SerializedProduct[];
}

export default function TrendingCarousel({ initialData }: TrendingCarouselProps) {
  const reduxItems = useSelector((state: any) => state.trending?.items);
  const rawProducts = reduxItems && reduxItems.length > 0 ? reduxItems : initialData;

  // --- BOOST LOGIC SORTING ---
  const trendingProducts = [...(rawProducts || [])]
    .filter((p: SerializedProduct) => p && p.id)
    .sort((a, b) => {
      const aIsBoosted = a.boostUntil && new Date(a.boostUntil) > new Date();
      const bIsBoosted = b.boostUntil && new Date(b.boostUntil) > new Date();
      if (aIsBoosted && !bIsBoosted) return -1;
      if (!aIsBoosted && bIsBoosted) return 1;
      return 0;
    });

  if (!trendingProducts || trendingProducts.length === 0) return null;

  // Duplicate for seamless loop
  const loopProducts = [...trendingProducts, ...trendingProducts];

  return (
    <section className="relative overflow-hidden bg-white py-10">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <div className="mb-1.5 flex items-center gap-2 text-[#F7931E]">
              <Flame size={14} fill="currentColor" className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.22em]">
                Hot Right Now
              </span>
            </div>
            <h2 className="text-lg font-black uppercase italic tracking-tighter text-[var(--accent-navy)] md:text-2xl">
              Trending{" "}
              <span className="text-[var(--brand-primary)]">Products</span>
            </h2>
          </div>

          <Link
            href="/shop"
            className="group flex shrink-0 items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400 transition-colors hover:text-[var(--accent-navy)]"
          >
            View All
            <ChevronRight
              size={14}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>

        {/* Carousel Rail */}
        <div className="relative -mx-4 overflow-hidden px-4">
          {/* Soft edge fades */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-white to-transparent md:w-12" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-white to-transparent md:w-12" />

          <motion.div
            className="flex gap-4 pb-2"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              duration: Math.max(18, trendingProducts.length * 3.2),
              ease: "linear",
              repeat: Infinity,
            }}
            whileHover={{ animationPlayState: "paused" as any }}
            style={{ width: "max-content" }}
            onHoverStart={(e) => {
              const el = e.target as HTMLElement;
              el.style.animationPlayState = "paused";
            }}
          >
            {loopProducts.map((product: SerializedProduct, index: number) => {
              // --- IMAGE LOGIC ---
              const validSrc =
                product.imageUrl && product.imageUrl.trim() !== ""
                  ? product.imageUrl
                  : product.images && product.images[0]?.url
                  ? product.images[0].url
                  : "/logo.png";

              const slug =
                typeof product.slug === "string"
                  ? product.slug
                  : (product.slug as any)?.current;

              // --- BOOST ACTIVE CHECK ---
              const isBoosted =
                product.boostUntil && new Date(product.boostUntil) > new Date();

              const rawPrice = Number(product.price) || 0;
              const rawDiscount = Number(product.discountPrice) || 0;
              const displayPrice =
                rawDiscount > 0 && rawDiscount < rawPrice ? rawDiscount : rawPrice;

              return (
                <div
                  key={`${product.id}-${index}`}
                  className="group/card w-[160px] shrink-0 sm:w-[180px] md:w-[200px]"
                >
                  <Link href={`/products/${slug}`} className="block">
                    <div className="relative mb-3 aspect-[4/5] overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 transition-all duration-300 group-hover/card:border-gray-200 group-hover/card:shadow-[0_10px_30px_rgba(0,43,91,0.08)]">
                      {/* BOOST BADGE */}
                      {isBoosted && (
                        <div className="absolute left-2.5 top-2.5 z-10 flex items-center gap-1 rounded-full bg-[var(--accent-navy)] px-2 py-1 text-[var(--brand-primary)] shadow-md">
                          <Rocket size={10} />
                          <span className="text-[8px] font-black uppercase tracking-wider">
                            Boost
                          </span>
                        </div>
                      )}

                      <Image
                        src={validSrc}
                        alt={product.title}
                        fill
                        className="object-contain p-3 transition-transform duration-500 group-hover/card:scale-105"
                        sizes="(max-width: 640px) 160px, (max-width: 768px) 180px, 200px"
                      />

                      {/* Hover CTA */}
                      <div className="absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-black/50 via-black/20 to-transparent p-3 opacity-0 transition-all duration-300 group-hover/card:translate-y-0 group-hover/card:opacity-100">
                        <span className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-white py-2 text-[9px] font-black uppercase tracking-widest text-[var(--accent-navy)] shadow-sm">
                          <ShoppingCart size={12} />
                          View
                        </span>
                      </div>
                    </div>
                  </Link>

                  <div className="space-y-1 px-0.5">
                    <div className="flex items-center justify-between gap-1">
                      <p className="truncate text-[9px] font-bold uppercase tracking-widest text-gray-400">
                        {product.categoryName || "Featured"}
                      </p>
                      {isBoosted && (
                        <span className="shrink-0 text-[8px] font-black uppercase italic text-[#F7931E]">
                          Hot
                        </span>
                      )}
                    </div>

                    <h3 className="line-clamp-2 min-h-[2.2rem] text-[12px] font-bold leading-snug text-gray-900 transition-colors group-hover/card:text-[var(--brand-primary)]">
                      {product.title}
                    </h3>

                    <p className="text-sm font-black tracking-tight text-[var(--accent-navy)]">
                      {formatNaira(displayPrice)}
                    </p>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}







// "use client";

// import React from "react";
// import { useSelector } from "react-redux";
// import { motion } from "framer-motion";
// import { Flame, ChevronRight, ShoppingCart } from "lucide-react";
// import Link from "next/link";
// import Image from "next/image";
// import { SerializedProduct } from "@/types/product";

// interface TrendingCarouselProps {
//   initialData: SerializedProduct[];
// }

// export default function TrendingCarousel({ initialData }: TrendingCarouselProps) {
//   const reduxItems = useSelector((state: any) => state.trending?.items);
//   const trendingProducts = reduxItems && reduxItems.length > 0 ? reduxItems : initialData;

//   if (!trendingProducts || trendingProducts.length === 0) return null;

//   return (
//     <section className="py-12 bg-white overflow-hidden">
//       <div className="container mx-auto px-4">
//         {/* Header */}
//         <div className="flex items-end justify-between mb-8">
//           <div>
//             <div className="flex items-center gap-2 text-orange-600 mb-2">
//               <Flame size={18} fill="currentColor" className="animate-pulse" />
//               <span className="text-sm font-black uppercase tracking-[0.2em]">Hot Products</span>
//             </div>
//             <h2 className="text-4xl font-black uppercase italic tracking-tighter text-[var(--accent-navy)]">
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

//         {/* Carousel Rail with Auto-Loop Logic */}
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
//               // --- IMPROVED IMAGE LOGIC ---
//               // Check primary imageUrl, then check the images array from Prisma include
//               const validSrc = (product.imageUrl && product.imageUrl.trim() !== "") 
//                 ? product.imageUrl 
//                 : (product.images && product.images[0]?.url) 
//                 ? product.images[0].url 
//                 : "/logo.png"; 

//               const slug = typeof product.slug === 'string' ? product.slug : (product.slug as any)?.current;

//               return (
//                 <div 
//                   key={product.id} 
//                   className="min-w-[280px] md:min-w-[320px] group/card"
//                 >
//                   <Link href={`/products/${slug}`}>
//                     <div className="relative aspect-[4/5] bg-gray-50 rounded-3xl overflow-hidden mb-4 border border-gray-100 transition-all hover:shadow-2xl hover:shadow-blue-100">
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
//                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
//                       {product.categoryName || "Tactical"}
//                     </p>
//                     <h3 className="font-black text-lg uppercase tracking-tight text-gray-900 leading-tight">
//                       {product.title}
//                     </h3>
//                     <p className="text-blue-600 font-black text-xl">
//                       ${Number(product.price).toLocaleString()}
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

import React from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Flame, ChevronRight, ShoppingCart, Rocket } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { SerializedProduct } from "@/types/product";

interface TrendingCarouselProps {
  initialData: SerializedProduct[];
}

export default function TrendingCarousel({ initialData }: TrendingCarouselProps) {
  const reduxItems = useSelector((state: any) => state.trending?.items);
  const rawProducts = reduxItems && reduxItems.length > 0 ? reduxItems : initialData;

  // --- BOOST LOGIC SORTING ---
  // Ensure products with active boostUntil dates appear first if the server hasn't sorted them
  const trendingProducts = [...rawProducts].sort((a, b) => {
    const aIsBoosted = a.boostUntil && new Date(a.boostUntil) > new Date();
    const bIsBoosted = b.boostUntil && new Date(b.boostUntil) > new Date();
    if (aIsBoosted && !bIsBoosted) return -1;
    if (!aIsBoosted && bIsBoosted) return 1;
    return 0;
  });

  if (!trendingProducts || trendingProducts.length === 0) return null;

  return (
    <section className="py-12 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-orange-600 mb-2">
              <Flame size={18} fill="currentColor" className="animate-pulse" />
              <span className="text-sm font-black uppercase tracking-[0.2em]">Hot Products</span>
            </div>
            <h2 className="text-4xl font-black uppercase italic tracking-tighter text-[var(--accent-navy)]">
              Trending <span className="text-[var(--brand-primary)]">Products</span>
            </h2>
          </div>
          <Link 
            href="/shop" 
            className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-600 transition-colors"
          >
            View All Armory <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Carousel Rail */}
        <div className="relative group">
          <motion.div 
            className="flex gap-6 pb-8 cursor-grab active:cursor-grabbing"
            animate={{
              x: [0, -1000, 0], 
            }}
            transition={{
              duration: 25,
              ease: "linear",
              repeat: Infinity,
              repeatType: "reverse",
            }}
            whileHover={{ animationPlayState: "paused" }} 
          >
            {trendingProducts.map((product: SerializedProduct) => {
              // --- IMAGE LOGIC ---
              const validSrc = (product.imageUrl && product.imageUrl.trim() !== "") 
                ? product.imageUrl 
                : (product.images && product.images[0]?.url) 
                ? product.images[0].url 
                : "/logo.png"; 

              const slug = typeof product.slug === 'string' ? product.slug : (product.slug as any)?.current;

              // --- BOOST ACTIVE CHECK ---
              const isBoosted = product.boostUntil && new Date(product.boostUntil) > new Date();

              return (
                <div 
                  key={product.id} 
                  className="min-w-[280px] md:min-w-[320px] group/card"
                >
                  <Link href={`/products/${slug}`}>
                    <div className="relative aspect-[4/5] bg-gray-50 rounded-3xl overflow-hidden mb-4 border border-gray-100 transition-all hover:shadow-2xl hover:shadow-blue-100">
                      
                      {/* BOOST BADGE */}
                      {isBoosted && (
                        <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 bg-[var(--accent-navy)] text-[var(--brand-primary)] px-3 py-1.5 rounded-full shadow-xl">
                          <Rocket size={12} className="animate-bounce" />
                          <span className="text-[8px] font-black uppercase tracking-widest italic">Promoted</span>
                        </div>
                      )}

                      <Image 
                        src={validSrc} 
                        alt={product.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover/card:scale-110"
                        sizes="(max-width: 768px) 280px, 320px"
                      />
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex items-end p-6">
                         <button className="w-full bg-white text-black py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition-colors">
                           <ShoppingCart size={14} /> Quick Add
                         </button>
                      </div>
                    </div>
                  </Link>

                  <div className="space-y-1 px-2">
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {product.categoryName || "Tactical"}
                        </p>
                        {isBoosted && <span className="text-[8px] font-black text-orange-500 uppercase italic">Featured</span>}
                    </div>
                    <h3 className="font-black text-lg uppercase tracking-tight text-gray-900 leading-tight group-hover/card:text-blue-600 transition-colors">
                      {product.title}
                    </h3>
                    <p className="text-blue-600 font-black text-xl">
                      ${Number(product.price).toLocaleString()}
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
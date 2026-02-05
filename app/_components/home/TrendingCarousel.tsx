// "use client";

// import React from "react";
// import { useSelector } from "react-redux";
// import { motion } from "framer-motion";
// import { Flame, ChevronRight, ShoppingCart } from "lucide-react";
// import Link from "next/link";
// import Image from "next/image"; // Switched to Next.js Image for optimization
// import { SerializedProduct } from "@/types/product";

// interface TrendingCarouselProps {
//   initialData: SerializedProduct[];
// }

// export default function TrendingCarousel({ initialData }: TrendingCarouselProps) {
//   // TACTICAL FIX: Safe selection with fallback to initialData from props
//   // This prevents the "Cannot read properties of undefined" crash
//   const reduxItems = useSelector((state: any) => state.trending?.items);
  
//   // Use Redux if it has data, otherwise fall back to the Prisma data from page.tsx
//   const trendingProducts = reduxItems && reduxItems.length > 0 ? reduxItems : initialData;

//   // If both are empty, hide the section entirely
//   if (!trendingProducts || trendingProducts.length === 0) return null;

//   return (
//     <section className="py-12 bg-white overflow-hidden">
//       <div className="container mx-auto px-4">
//         {/* Header */}
//         <div className="flex items-end justify-between mb-8">
//           <div>
//             <div className="flex items-center gap-2 text-orange-600 mb-2">
//               <Flame size={18} fill="currentColor" className="animate-pulse" />
//               <span className="text-xs font-black uppercase tracking-[0.2em]">Hot Deployment</span>
//             </div>
//             <h2 className="text-4xl font-black uppercase italic tracking-tighter text-gray-900">
//               Trending <span className="text-blue-600">Gear</span>
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
//         <motion.div 
//           className="flex gap-6 overflow-x-auto pb-8 snap-x no-scrollbar scroll-smooth"
//           initial={{ opacity: 0, x: 20 }}
//           whileInView={{ opacity: 1, x: 0 }}
//           viewport={{ once: true }}
//           transition={{ duration: 0.5 }}
//         >
//           {trendingProducts.map((product: SerializedProduct) => (
//             <div 
//               key={product.id} 
//               className="min-w-[280px] md:min-w-[320px] snap-start group"
//             >
//               <Link href={`/product/${product.slug}`}>
//                 <div className="relative aspect-[4/5] bg-gray-50 rounded-3xl overflow-hidden mb-4 border border-gray-100 transition-all group-hover:shadow-2xl group-hover:shadow-blue-100">
//                   <Image 
//                     src={product.imageUrl} 
//                     alt={product.title}
//                     fill
//                     className="object-cover transition-transform duration-700 group-hover:scale-110"
//                     sizes="(max-width: 768px) 280px, 320px"
//                   />
                  
//                   {/* Tactical Overlay */}
//                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
//                      <button className="w-full bg-white text-black py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition-colors">
//                        <ShoppingCart size={14} /> Quick Add
//                      </button>
//                   </div>
//                 </div>
//               </Link>

//               <div className="space-y-1 px-2">
//                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
//                   {product.categoryName || "Tactical"}
//                 </p>
//                 <h3 className="font-black text-lg uppercase tracking-tight text-gray-900 leading-tight">
//                   {product.title}
//                 </h3>
//                 <p className="text-blue-600 font-black text-xl">
//                   ${product.price.toLocaleString()}
//                   {product.discountPrice && (
//                     <span className="ml-2 text-sm text-gray-400 line-through decoration-red-500/50">
//                       ${product.discountPrice.toLocaleString()}
//                     </span>
//                   )}
//                 </p>
//               </div>
//             </div>
//           ))}
//         </motion.div>
//       </div>
//     </section>
//   );
// }




"use client";

import React from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Flame, ChevronRight, ShoppingCart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { SerializedProduct } from "@/types/product";

interface TrendingCarouselProps {
  initialData: SerializedProduct[];
}

export default function TrendingCarousel({ initialData }: TrendingCarouselProps) {
  const reduxItems = useSelector((state: any) => state.trending?.items);
  const trendingProducts = reduxItems && reduxItems.length > 0 ? reduxItems : initialData;

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
            <h2 className="text-4xl font-black uppercase italic tracking-tighter text-accent-navy">
              Trending <span className="text-brand-primary">Products</span>
            </h2>
          </div>
          <Link 
            href="/shop" 
            className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-600 transition-colors"
          >
            View All Armory <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Carousel Rail with Auto-Loop Logic */}
        <div className="relative group">
          <motion.div 
            className="flex gap-6 pb-8 cursor-grab active:cursor-grabbing"
            animate={{
              // This moves the rail from start to end and back
              // -50% assumes the container is long enough
              x: [0, -1000, 0], 
            }}
            transition={{
              duration: 25, // Adjust speed (higher is slower)
              ease: "linear",
              repeat: Infinity,
              repeatType: "reverse", // Ping-pongs back to the start
            }}
            // Pauses the motion when the user hovers to check a product
            whileHover={{ animationPlayState: "paused" }} 
          >
            {trendingProducts.map((product: SerializedProduct) => (
              <div 
                key={product.id} 
                className="min-w-[280px] md:min-w-[320px] group/card"
              >
                <Link href={`/product/${product.slug}`}>
                  <div className="relative aspect-[4/5] bg-gray-50 rounded-3xl overflow-hidden mb-4 border border-gray-100 transition-all hover:shadow-2xl hover:shadow-blue-100">
                    <Image 
                      src={product.imageUrl} 
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
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {product.categoryName || "Tactical"}
                  </p>
                  <h3 className="font-black text-lg uppercase tracking-tight text-gray-900 leading-tight">
                    {product.title}
                  </h3>
                  <p className="text-blue-600 font-black text-xl">
                    ${product.price.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
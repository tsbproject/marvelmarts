// "use client";

// import React from "react";
// import ProductCard from "./ProductCard";
// import ProductSkeleton from "./ProductSkeleton";
// import { SerializedProduct } from "@/types/product";
// import { ArrowRight } from "lucide-react";
// import Link from "next/link";

// export default function NewArrival({ products }: { products: SerializedProduct[] }) {
//   const handleQuickView = (product: SerializedProduct) => {
//     console.log("Quick view for:", product.title);
//   };

//   return (
//     <section className="py-12">
//       <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 border-b border-neutral-light pb-8 gap-4">
//         <div>
//           <h2 className="text-4xl md:text-5xl font-black italic text-accent-navy uppercase tracking-tighter">
//             New <span className="text-brand-primary">Arrivals</span>
//           </h2>
//           <p className="text-xs font-bold text-neutral-gray uppercase tracking-[0.3em] mt-2">
//             The Latest Deployments to the Stash
//           </p>
//         </div>
        
//         <Link 
//           href="/shop?sort=newest" 
//           className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-accent-navy hover:text-brand-primary transition-colors"
//         >
//           View Full Armory <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
//         </Link>
//       </div>

//       {/* Changed grid-cols-1 to grid-cols-2 */}
//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
//          {loading 
//     ? [...Array(4)].map((_, i) => <ProductSkeleton key={i} />)
//     : products.map((product) => (
//         <ProductCard key={product.id} product={product} onQuickView={handleQuickView} />
//       ))
//   }
// </div>
//     </section>
//   );
// }



"use client";

import React from "react";
import ProductCard from "./ProductCard";
import ProductSkeleton from "./ProductSkeleton";
import { SerializedProduct } from "@/types/product";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useLoadingOverlay } from "@/app/_context/LoadingOverlayContext"; // Adjust path as needed

export default function NewArrival({ products }: { products: SerializedProduct[] }) {
  const { loading } = useLoadingOverlay();

  const handleQuickView = (product: SerializedProduct) => {
    console.log("Quick view for:", product.title);
  };

  return (
    <section className="py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 border-b border-neutral-light pb-8 gap-4">
        <div>
          <h2 className="text-4xl md:text-5xl font-black italic text-accent-navy uppercase tracking-tighter">
            New <span className="text-brand-primary">Arrivals</span>
          </h2>
          <p className="text-xs font-bold text-neutral-gray uppercase tracking-[0.3em] mt-2">
            The Latest Deployments to the Stash
          </p>
        </div>
        
        <Link 
          href="/shop?sort=newest" 
          className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-accent-navy hover:text-brand-primary transition-colors"
        >
          View Full Armory <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Grid configured for 2 columns on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
        {loading 
          ? [...Array(8)].map((_, i) => <ProductSkeleton key={i} />)
          : products.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onQuickView={handleQuickView} 
              />
            ))
        }
      </div>
    </section>
  );
}
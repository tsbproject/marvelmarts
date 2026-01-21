// "use client";

// import { useState, useEffect, useMemo } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import { ShoppingBag, Star, LayoutGrid, List, Search, Loader2 } from "lucide-react";

// interface Product {
//   id: string | number;
//   title: string;
//   price: number;
//   category?: { id: string; name: string };
//   imageUrl?: string;
//   images?: { url: string }[]; // Matches your Prisma include
//   rating?: number;
// }

// export default function ShopPage() {
//   const [products, setProducts] = useState<Product[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
//   const [searchQuery, setSearchQuery] = useState("");

//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         setIsLoading(true);
//         const res = await fetch("/api/products");
//         if (!res.ok) throw new Error("Failed to fetch products");
        
//         const data = await res.json();

//         // FIX: Your API returns { success: true, items: [...] }
//         // We also handle the mapping of the 'images' array to a single 'imageUrl'
//         if (data.success && Array.isArray(data.items)) {
//           const formattedProducts = data.items.map((p: any) => ({
//             ...p,
//             // If imageUrl is missing, use the first image from the 'images' relation
//             imageUrl: p.imageUrl || p.images?.[0]?.url || "/images/placeholder.jpg"
//           }));
//           setProducts(formattedProducts);
//         } else {
//           console.error("API structure mismatch:", data);
//           setProducts([]);
//         }
//       } catch (error) {
//         console.error("Error loading products:", error);
//         setProducts([]);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchProducts();
//   }, []);

//   const filteredProducts = useMemo(() => {
//     if (!Array.isArray(products)) return [];
//     return products.filter((p) =>
//       p.title?.toLowerCase().includes(searchQuery.toLowerCase())
//     );
//   }, [products, searchQuery]);

//   return (
//     <div className="bg-neutral-white min-h-screen">
//       {/* Brand Header */}
//       <div className="bg-accent-navy py-12 border-b-4 border-brand-primary">
//         <div className="container mx-auto px-4">
//           <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-neutral-white">
//             The <span className="text-brand-primary">Armory</span>
//           </h1>
//         </div>
//       </div>

//       <div className="container mx-auto px-4 py-8">
//         {/* Toolbar */}
//         <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-neutral-light p-4 rounded-2xl border border-neutral-light">
//           <div className="relative w-full md:w-96">
//             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-gray" />
//             <input 
//               type="text"
//               placeholder="SEARCH GEAR..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="w-full bg-neutral-white border-none rounded-xl py-3 pl-12 pr-4 text-xs font-bold uppercase tracking-widest text-accent-navy outline-none"
//             />
//           </div>
//           <div className="flex items-center gap-2">
//             <button onClick={() => setViewMode("grid")} className={`p-2 rounded-lg ${viewMode === "grid" ? "bg-accent-navy text-neutral-white" : "text-neutral-gray"}`}><LayoutGrid size={20}/></button>
//             <button onClick={() => setViewMode("list")} className={`p-2 rounded-lg ${viewMode === "list" ? "bg-accent-navy text-neutral-white" : "text-neutral-gray"}`}><List size={20}/></button>
//           </div>
//         </div>

//         {isLoading ? (
//           <div className="flex flex-col items-center justify-center py-24">
//             <Loader2 className="w-12 h-12 text-brand-primary animate-spin mb-4" />
//             <p className="text-neutral-gray font-black uppercase tracking-widest text-[10px]">Syncing with Multiverse...</p>
//           </div>
//         ) : filteredProducts.length === 0 ? (
//           <div className="text-center py-24 bg-neutral-light rounded-[3rem]">
//             <p className="text-neutral-gray font-bold italic text-xl uppercase">No gear in stock.</p>
//           </div>
//         ) : (
//           <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-4"}>
//             {filteredProducts.map((product) => (
//               <div key={product.id} className={`group bg-neutral-white border border-neutral-light rounded-[2rem] overflow-hidden hover:border-brand-primary/50 transition-all duration-300 ${viewMode === "list" ? "flex gap-6 p-4 items-center" : "flex flex-col"}`}>
                
//                 <div className={`relative bg-neutral-light overflow-hidden ${viewMode === "list" ? "w-40 h-40 rounded-2xl flex-shrink-0" : "aspect-square"}`}>
//                   <Image 
//                     src={product.imageUrl || "/images/placeholder.jpg"} 
//                     alt={product.title} 
//                     fill 
//                     className="object-cover group-hover:scale-105 transition-transform duration-500" 
//                   />
//                 </div>
                
//                 <div className="p-6 flex-1 flex flex-col justify-between">
//                   <div>
//                     <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] mb-1">
//                       {product.category?.name || "General Gear"}
//                     </p>
//                     <h3 className="text-lg font-black italic uppercase text-accent-navy mb-4 leading-tight group-hover:text-brand-primary transition-colors">
//                       {product.title}
//                     </h3>
//                   </div>
                  
//                   <div className="flex items-center justify-between mt-auto">
//                     <span className="text-xl font-black text-accent-navy italic">
//                       ₦{product.price.toLocaleString()}
//                     </span>
//                     <Link 
//                       href={`/shop/${product.id}`} 
//                       className="bg-neutral-light text-accent-navy p-3 rounded-xl hover:bg-brand-primary hover:text-neutral-white transition-all"
//                     >
//                       <ShoppingBag size={20} />
//                     </Link>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }




"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link"; // Added for routing
import { ShoppingBag, Star, LayoutGrid, List, Search, Loader2, Eye } from "lucide-react";

// ... (Product interface remains the same)

export default function ShopPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/products");
        const data = await res.json();
        // Matching your API response: { success: true, items: [...] }
        if (data.success && Array.isArray(data.items)) {
          setProducts(data.items);
        }
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((p) =>
      p.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  return (
    <div className="bg-neutral-white min-h-screen">
      {/* ... Hero Section remains same ... */}

      <div className="container mx-auto px-4 py-8">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-neutral-light p-4 rounded-2xl border border-neutral-light">
          {/* Search Bar */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-gray" />
            <input 
              type="text"
              placeholder="SEARCH GEAR..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-white border-none rounded-xl py-3 pl-12 pr-4 text-xs font-bold uppercase tracking-widest text-accent-navy outline-none"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={() => setViewMode("grid")} className={`p-2 rounded-lg transition-colors ${viewMode === "grid" ? "bg-accent-navy text-neutral-white" : "text-neutral-gray"}`}><LayoutGrid size={20}/></button>
            <button onClick={() => setViewMode("list")} className={`p-2 rounded-lg transition-colors ${viewMode === "list" ? "bg-accent-navy text-neutral-white" : "text-neutral-gray"}`}><List size={20}/></button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-10 h-10 text-brand-primary animate-spin" />
          </div>
        ) : (
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-6"}>
            {filteredProducts.map((product) => (
              <div key={product.id} className={`group bg-neutral-white border border-neutral-light rounded-[2.5rem] overflow-hidden hover:border-brand-primary/40 transition-all duration-500 hover:shadow-2xl hover:shadow-accent-navy/5 ${viewMode === "list" ? "flex gap-8 p-4 items-center" : "flex flex-col"}`}>
                
                {/* Image Section - Wrapped in Link */}
                <Link 
                  href={`/shop/${product.slug}`} 
                  className={`relative bg-neutral-light overflow-hidden block ${viewMode === "list" ? "w-48 h-48 rounded-2xl" : "aspect-square"}`}
                >
                  <Image 
                    src={product.images?.[0]?.url || "/images/placeholder.jpg"} 
                    alt={product.title} 
                    fill 
                    className="object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-accent-navy/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     <div className="bg-neutral-white p-4 rounded-full text-accent-navy shadow-xl translate-y-4 group-hover:translate-y-0 transition-transform">
                        <Eye size={24} />
                     </div>
                  </div>
                </Link>
                
                {/* Content Section */}
                <div className={`p-6 flex-1 flex flex-col justify-between ${viewMode === "list" ? "py-2" : ""}`}>
                  <div>
                    <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] mb-1">
                      {product.category?.name || "Premium Gear"}
                    </p>
                    {/* Title - Wrapped in Link */}
                    <Link href={`/shop/${product.slug}`}>
                      <h3 className="text-xl font-black italic uppercase text-accent-navy mb-4 leading-tight group-hover:text-brand-primary transition-colors">
                        {product.title}
                      </h3>
                    </Link>
                  </div>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-2xl font-black text-accent-navy italic">
                      ₦{product.price.toLocaleString()}
                    </span>
                    
                    {/* Action Button - Wrapped in Link */}
                    <Link 
                      href={`/shop/${product.slug}`} 
                      className="bg-neutral-light text-accent-navy px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary hover:text-neutral-white transition-all flex items-center gap-2"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
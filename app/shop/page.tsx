// // "use client";

// // import { useState, useEffect, useMemo } from "react";
// // import Image from "next/image";
// // import Link from "next/link"; 
// // import { ShoppingBag, Star, LayoutGrid, List, Search, Loader2, Eye } from "lucide-react";

// // // ... (Product interface remains the same)

// // export default function ShopPage() {
// //   const [products, setProducts] = useState<any[]>([]);
// //   const [isLoading, setIsLoading] = useState(true);
// //   const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
// //   const [searchQuery, setSearchQuery] = useState("");

// //   useEffect(() => {
// //     const fetchProducts = async () => {
// //       try {
// //         setIsLoading(true);
// //         const res = await fetch("/api/products");
// //         const data = await res.json();
// //         // Matching your API response: { success: true, items: [...] }
// //         if (data.success && Array.isArray(data.items)) {
// //           setProducts(data.items);
// //         }
// //       } catch (error) {
// //         console.error("Error loading products:", error);
// //       } finally {
// //         setIsLoading(false);
// //       }
// //     };
// //     fetchProducts();
// //   }, []);

// //   const filteredProducts = useMemo(() => {
// //     return products.filter((p) =>
// //       p.title?.toLowerCase().includes(searchQuery.toLowerCase())
// //     );
// //   }, [products, searchQuery]);

// //   return (
// //     <div className="bg-neutral-white min-h-screen">
// //       {/* ... Hero Section remains same ... */}

// //       <div className="container mx-auto px-4 py-8">
// //         {/* Toolbar */}
// //         <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-neutral-light p-4 rounded-2xl border border-neutral-light">
// //           {/* Search Bar */}
// //           <div className="relative w-full md:w-96">
// //             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-gray" />
// //             <input 
// //               type="text"
// //               placeholder="SEARCH GEAR..."
// //               value={searchQuery}
// //               onChange={(e) => setSearchQuery(e.target.value)}
// //               className="w-full bg-neutral-white border-none rounded-xl py-3 pl-12 pr-4 text-xs font-bold uppercase tracking-widest text-accent-navy outline-none"
// //             />
// //           </div>
          
// //           <div className="flex items-center gap-2">
// //             <button onClick={() => setViewMode("grid")} className={`p-2 rounded-lg transition-colors ${viewMode === "grid" ? "bg-accent-navy text-neutral-white" : "text-neutral-gray"}`}><LayoutGrid size={20}/></button>
// //             <button onClick={() => setViewMode("list")} className={`p-2 rounded-lg transition-colors ${viewMode === "list" ? "bg-accent-navy text-neutral-white" : "text-neutral-gray"}`}><List size={20}/></button>
// //           </div>
// //         </div>

// //         {isLoading ? (
// //           <div className="flex flex-col items-center justify-center py-24">
// //             <Loader2 className="w-10 h-10 text-brand-primary animate-spin" />
// //           </div>
// //         ) : (
// //           <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-6"}>
// //             {filteredProducts.map((product) => (
// //               <div key={product.id} className={`group bg-neutral-white border border-neutral-light rounded-[2.5rem] overflow-hidden hover:border-brand-primary/40 transition-all duration-500 hover:shadow-2xl hover:shadow-accent-navy/5 ${viewMode === "list" ? "flex gap-8 p-4 items-center" : "flex flex-col"}`}>
                
// //                 {/* Image Section - Wrapped in Link */}
// //                 <Link 
// //                   href={`/shop/${product.slug}`} 
// //                   className={`relative bg-neutral-light overflow-hidden block ${viewMode === "list" ? "w-48 h-48 rounded-2xl" : "aspect-square"}`}
// //                 >
// //                   <Image 
// //                     src={product.images?.[0]?.url || "/images/placeholder.jpg"} 
// //                     alt={product.title} 
// //                     fill 
// //                     className="object-cover group-hover:scale-110 transition-transform duration-700" 
// //                   />
// //                   {/* Hover Overlay */}
// //                   <div className="absolute inset-0 bg-accent-navy/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
// //                      <div className="bg-neutral-white p-4 rounded-full text-accent-navy shadow-xl translate-y-4 group-hover:translate-y-0 transition-transform">
// //                         <Eye size={24} />
// //                      </div>
// //                   </div>
// //                 </Link>
                
// //                 {/* Content Section */}
// //                 <div className={`p-6 flex-1 flex flex-col justify-between ${viewMode === "list" ? "py-2" : ""}`}>
// //                   <div>
// //                     <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] mb-1">
// //                       {product.category?.name || "Premium Gear"}
// //                     </p>
// //                     {/* Title - Wrapped in Link */}
// //                     <Link href={`/shop/${product.slug}`}>
// //                       <h3 className="text-xl font-black italic uppercase text-accent-navy mb-4 leading-tight group-hover:text-brand-primary transition-colors">
// //                         {product.title}
// //                       </h3>
// //                     </Link>
// //                   </div>
                  
// //                   <div className="flex items-center justify-between mt-auto">
// //                     <span className="text-2xl font-black text-accent-navy italic">
// //                       ₦{product.price.toLocaleString()}
// //                     </span>
                    
// //                     {/* Action Button - Wrapped in Link */}
// //                     <Link 
// //                       href={`/shop/${product.slug}`} 
// //                       className="bg-neutral-light text-accent-navy px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary hover:text-neutral-white transition-all flex items-center gap-2"
// //                     >
// //                       View Details
// //                     </Link>
// //                   </div>
// //                 </div>
// //               </div>
// //             ))}
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // }



// // app/shop/page.tsx
// import { prisma } from "@/app/lib/prisma";
// import ShopSidebar from "@/app/_components/ShopSidebar";
// import ProductCard from "@/app/_components/ProductCard";
// import { SlidersHorizontal } from "lucide-react";

// export default async function ShopPage({
//   searchParams,
// }: {
//   searchParams: Promise<{ 
//     category?: string; 
//     subcategory?: string; 
//     brand?: string; 
//     minPrice?: string; 
//     maxPrice?: string 
//   }>;
// }) {
//   const filters = await searchParams;

//   // 1. Fetch Categories for the Sidebar
//   const categories = await prisma.category.findMany({
//     where: { parentId: null },
//     include: { children: true },
//   });

//   // 2. Build Prisma Query
//   const where: any = {};
//   if (filters.category) where.category = { slug: filters.category };
//   if (filters.subcategory) where.category = { slug: filters.subcategory };
//   if (filters.brand) where.brand = filters.brand;
//   if (filters.minPrice || filters.maxPrice) {
//     where.price = {
//       gte: filters.minPrice ? parseFloat(filters.minPrice) : 0,
//       lte: filters.maxPrice ? parseFloat(filters.maxPrice) : 9999999,
//     };
//   }

//   const products = await prisma.product.findMany({
//     where,
//     include: { images: true, variants: true },
//     orderBy: { createdAt: 'desc' }
//   });

//   return (
//     <div className="bg-white min-h-screen">
//       <div className="bg-accent-navy py-12 px-4">
//         <div className="container mx-auto">
//           <h1 className="text-4xl md:text-6xl font-black italic uppercase text-white tracking-tighter">
//             The <span className="text-brand-primary">Armory</span>
//           </h1>
//           <p className="text-neutral-gray text-sm font-bold uppercase tracking-widest mt-2">
//             Professional Grade Tactical Equipment
//           </p>
//         </div>
//       </div>

//       <div className="container mx-auto px-4 py-12 flex flex-col lg:flex-row gap-12">
//         {/* Sidebar */}
//         <ShopSidebar categories={categories} />

//         {/* Main Content */}
//         <main className="flex-1">
//           <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-light">
//             <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-accent-navy">
//               <SlidersHorizontal size={14} /> {products.length} Units Found
//             </div>
//           </div>

//           {products.length === 0 ? (
//             <div className="py-20 text-center bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
//               <p className="font-black uppercase italic text-gray-400">No tactical gear matches your current filters.</p>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
//               {products.map((product) => (
//                 <ProductCard 
//                   key={product.id} 
//                   product={{
//                     ...product,
//                     imageUrl: product.images?.[0]?.url || "/logo.png",
//                     price: Number(product.variants?.[0]?.price || 0)
//                   }} 
//                   onQuickView={() => {}} 
//                 />
//               ))}
//             </div>
//           )}
//         </main>
//       </div>
//     </div>
//   );
// }





// app/shop/page.tsx
import { prisma } from "@/app/lib/prisma";
import ShopSidebar from "@/app/_components/ShopSidebar";
import ShopContent from "@/app/shop/components/Shopcontent"; 

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ 
    category?: string; 
    subcategory?: string; 
    brand?: string; 
    minPrice?: string; 
    maxPrice?: string 
  }>;
}) {
  const filters = await searchParams;

  // 1. Fetch real categories for the sidebar
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    include: { children: true },
  });

  // 2. Build the query
  const where: any = {};
  if (filters.category) where.category = { slug: filters.category };
  if (filters.subcategory) where.category = { slug: filters.subcategory };
  if (filters.brand) where.brand = filters.brand;
  if (filters.minPrice || filters.maxPrice) {
    where.price = {
      gte: filters.minPrice ? parseFloat(filters.minPrice) : 0,
      lte: filters.maxPrice ? parseFloat(filters.maxPrice) : 9999999,
    };
  }

  const rawProducts = await prisma.product.findMany({
    where,
    include: { images: true, variants: true, category: true },
    orderBy: { createdAt: 'desc' }
  });

  // 3. SERIALIZE DATA: Convert Decimals and Dates to plain types
  const products = rawProducts.map(p => ({
    ...p,
    price: Number(p.price || 0),
    discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    variants: p.variants.map(v => ({ ...v, price: Number(v.price) })),
  }));

  return (
    <div className="bg-neutral-white min-h-screen">
      {/* Hero Section */}
      <div className="bg-accent-navy py-16 px-4">
        <div className="container mx-auto">
          <p className="text-brand-primary font-black uppercase tracking-[0.4em] text-[10px] mb-4">
            Elite Equipment Selection
          </p>
          <h1 className="text-5xl md:text-7xl font-black italic uppercase text-white tracking-tighter leading-none">
            The <span className="text-brand-primary">Armory</span>
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 flex flex-col lg:flex-row gap-12">
        <ShopSidebar categories={categories} />
        {/* Pass serialized products to the Client-side Grid */}
        <ShopContent initialProducts={products} />
      </div>
    </div>
  );
}
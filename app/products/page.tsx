// "use client";

// import React, { useEffect, useState } from "react";
// import Link from "next/link";
// import { ShoppingBag, ArrowRight, Eye, Star } from "lucide-react";
// import ProductQuickView from "@/app/_components/ProductQuickView";
// import { formatNaira } from "@/app/lib/FormatNaira";

// interface ProductImage {
//   id: string;
//   url: string;
//   order: number;
// }

// interface Product {
//   id: string;
//   slug: string;
//   title: string;
//   description: string;
//   price: number;
//   discountPrice?: number | null;
//   imageUrl: string;
//   brand?: string | null;
//   images: ProductImage[];
//   stock: number;
//   rating?: number;
//   reviewCount?: number;
// }

// export default function ProductsPage() {
//   const [products, setProducts] = useState<Product[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
//   const [selectedProductForQuickView, setSelectedProductForQuickView] = useState<Product | null>(null);

//   useEffect(() => {
//     async function fetchProducts() {
//       try {
//         const res = await fetch("/api/products?status=ACTIVE");
//         if (res.ok) {
//           const data = await res.json();
//           setProducts(data.items ?? []);
//         }
//       } finally {
//         setLoading(false);
//       }
//     }
//     fetchProducts();
//   }, []);

//   const openQuickView = (product: Product) => {
//     setSelectedProductForQuickView(product);
//     setIsQuickViewOpen(true);
//   };

//   const closeQuickView = () => {
//     setIsQuickViewOpen(false);
//     setSelectedProductForQuickView(null);
//   };

  

//   if (loading) return <LoadingSkeleton />;

//   return (
//     <div className="bg-[#F9FAFB] min-h-screen">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-25 py-25">
//         {/* Header Section */}
//         <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-900">Featured Products</h1>
//             <p className="mt-1 text-gray-500 text-sm">Quality items curated just for you.</p>
//           </div>
//           <Link 
//             href="/categories" 
//             className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
//           >
//             All Categories <ArrowRight size={16} />
//           </Link>
//         </div>

//         {products.length === 0 ? (
//           <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-300">
//             <ShoppingBag className="mx-auto h-16 w-16 text-gray-200" />
//             <h3 className="mt-4 text-lg font-medium text-gray-900">Your store is empty</h3>
//             <p className="mt-1 text-gray-500">Upload products to see them appear here.</p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
//             {products.map((product) => (
//               <div 
//                 key={product.id} 
//                 className="group bg-white border border-gray-100 rounded-2xl p-4 flex flex-col items-center transition-all duration-300 hover:shadow-xl hover:border-blue-100"
//               >
//                 {/* Image Container: Light grey background, contain object */}
//                 <div className="relative w-full aspect-square bg-[#F3F4F6] rounded-xl overflow-hidden mb-5 flex items-center justify-center p-6">
//                   <img
//                     src={product.imageUrl || product.images?.[0]?.url || "/placeholder.png"}
//                     alt={product.title}
//                     className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
//                   />
                  
//                   {/* Quick View Button: Minimalist hover overlay */}
//                   <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
//                     <button 
//                       onClick={() => openQuickView(product)}
//                       className="bg-white/90 backdrop-blur-sm p-3 rounded-full text-gray-900 shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-white"
//                       title="Quick View"
//                     >
//                       <Eye size={20} />
//                     </button>
//                   </div>
//                 </div>

//                 {/* Content: Centered Text */}
//                 <div className="flex-1 flex flex-col items-center text-center w-full px-2">
//                   <Link href={`/products/${product.slug}`} className="block w-full">
//                     <h2 className="text-[14px] font-medium text-gray-800 line-clamp-2 h-10 mb-2 leading-snug group-hover:text-blue-600 transition-colors">
//                       {product.title}
//                     </h2>
//                   </Link>

//                   {/* Price */}
//                   <p className="text-lg font-extrabold text-[#2563EB] mb-2">
//                     {formatNaira(product.discountPrice || product.price)}
//                   </p>

//                   {/* Ratings: Static mock for the UI style */}
//                   <div className="flex items-center gap-1.5 mb-5">
//                     <div className="flex text-yellow-400">
//                       {[...Array(5)].map((_, i) => (
//                         <Star key={i} size={14} fill={i < 4 ? "currentColor" : "none"} />
//                       ))}
//                     </div>
//                     <span className="text-[11px] text-gray-400 font-medium">(120)</span>
//                   </div>
//                 </div>

//                 {/* Centered Add to Cart Button */}
//                 <button 
//                   onClick={() => alert(`Added ${product.title} to cart`)}
//                   className="w-full bg-[#2563EB] hover:bg-blue-700 text-white py-3 rounded-full font-bold text-sm transition-all shadow-md active:scale-[0.97] flex items-center justify-center gap-2"
//                 >
//                   Add to Cart
//                 </button>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       <ProductQuickView
//         product={selectedProductForQuickView}
//         isOpen={isQuickViewOpen}
//         onClose={closeQuickView}
//       />
//     </div>
//   );
// }

// function LoadingSkeleton() {
//   return (
//     <div className="max-w-7xl mx-auto px-4 py-12">
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
//         {[1, 2, 3, 4].map((i) => (
//           <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 animate-pulse">
//             <div className="aspect-square bg-gray-200 rounded-xl mb-5" />
//             <div className="h-4 w-3/4 bg-gray-200 rounded mx-auto mb-3" />
//             <div className="h-4 w-1/4 bg-gray-200 rounded mx-auto mb-6" />
//             <div className="h-10 w-full bg-gray-200 rounded-full" />
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }



"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag, ArrowRight, Eye, Star } from "lucide-react";
import ProductQuickView from "@/app/_components/ProductQuickView";
import { formatNaira } from "@/app/lib/FormatNaira";

// Import your shared types to ensure alignment
import { SerializedProduct } from "@/types/product"; 
interface ProductImage {
  id: string;
  url: string;
  order: number;
}

interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  discountPrice?: number | null;
  imageUrl: string;
  brand?: string | null;
  images: ProductImage[];
  stock: number;
  rating?: number;
  reviewCount?: number;
  category?: { name: string }; // Added to support transformation
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  
  // Use SerializedProduct type here to match the component prop
  const [selectedProductForQuickView, setSelectedProductForQuickView] = useState<SerializedProduct | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products?status=ACTIVE");
        if (res.ok) {
          const data = await res.json();
          setProducts(data.items ?? []);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  /**
   * TRANSFORMATION LOGIC
   * This converts the raw Product into a SerializedProduct
   */
  const openQuickView = (product: Product) => {
    const serialized: SerializedProduct = {
      ...product,
      // Map category name or provide a fallback to satisfy the type
      categoryName: product.category?.name || "General",
      // Ensure dates are strings for the client component
      createdAt: product.createdAt instanceof Date 
        ? product.createdAt.toISOString() 
        : (product.createdAt || new Date().toISOString()),
      updatedAt: product.updatedAt instanceof Date 
        ? product.updatedAt.toISOString() 
        : (product.updatedAt || new Date().toISOString()),
      // Ensure discountPrice is explicitly handled
      discountPrice: product.discountPrice ?? null,
    } as SerializedProduct;

    setSelectedProductForQuickView(serialized);
    setIsQuickViewOpen(true);
  };

  const closeQuickView = () => {
    setIsQuickViewOpen(false);
    setSelectedProductForQuickView(null);
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="bg-[#F9FAFB] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-25 py-25">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Featured Products</h1>
            <p className="mt-1 text-gray-500 text-sm">Quality items curated just for you.</p>
          </div>
          <Link 
            href="/categories" 
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
          >
            All Categories <ArrowRight size={16} />
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-300">
            <ShoppingBag className="mx-auto h-16 w-16 text-gray-200" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Your store is empty</h3>
            <p className="mt-1 text-gray-500">Upload products to see them appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <div 
                key={product.id} 
                className="group bg-white border border-gray-100 rounded-2xl p-4 flex flex-col items-center transition-all duration-300 hover:shadow-xl hover:border-blue-100"
              >
                <div className="relative w-full aspect-square bg-[#F3F4F6] rounded-xl overflow-hidden mb-5 flex items-center justify-center p-6">
                  <img
                    src={product.imageUrl || product.images?.[0]?.url || "/placeholder.png"}
                    alt={product.title}
                    className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                  />
                  
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      onClick={() => openQuickView(product)}
                      className="bg-white/90 backdrop-blur-sm p-3 rounded-full text-gray-900 shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-white"
                      title="Quick View"
                    >
                      <Eye size={20} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 flex flex-col items-center text-center w-full px-2">
                  <Link href={`/products/${product.slug}`} className="block w-full">
                    <h2 className="text-[14px] font-medium text-gray-800 line-clamp-2 h-10 mb-2 leading-snug group-hover:text-blue-600 transition-colors">
                      {product.title}
                    </h2>
                  </Link>

                  <p className="text-lg font-extrabold text-[#2563EB] mb-2">
                    {formatNaira(product.discountPrice || product.price)}
                  </p>

                  <div className="flex items-center gap-1.5 mb-5">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill={i < 4 ? "currentColor" : "none"} />
                      ))}
                    </div>
                    <span className="text-[11px] text-gray-400 font-medium">(120)</span>
                  </div>
                </div>

                <button 
                  onClick={() => alert(`Added ${product.title} to cart`)}
                  className="w-full bg-[#2563EB] hover:bg-blue-700 text-white py-3 rounded-full font-bold text-sm transition-all shadow-md active:scale-[0.97] flex items-center justify-center gap-2"
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <ProductQuickView
        product={selectedProductForQuickView}
        isOpen={isQuickViewOpen}
        onClose={closeQuickView}
      />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 animate-pulse">
            <div className="aspect-square bg-gray-200 rounded-xl mb-5" />
            <div className="h-4 w-3/4 bg-gray-200 rounded mx-auto mb-3" />
            <div className="h-4 w-1/4 bg-gray-200 rounded mx-auto mb-6" />
            <div className="h-10 w-full bg-gray-200 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
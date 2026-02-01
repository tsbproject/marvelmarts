// "use client";

// import React, { useEffect, useState } from "react";
// import Link from "next/link";
// import { ShoppingBag, ArrowRight, Eye, Star, ShoppingCart, Heart } from "lucide-react";
// import ProductQuickView from "@/app/_components/ProductQuickView";
// import ProductSkeleton from "@/app/_components/ProductSkeleton";
// import { formatNaira } from "@/app/lib/FormatNaira";
// import { useDispatch, useSelector } from "react-redux";
// import { addToCart } from "@/store/cartSlice";
// // Assuming you have a wishlistSlice. If not, the structure follows your cartSlice pattern.
// import { toggleWishlist } from "@/store/wishlistSlice"; 
// import { RootState } from "@/store";
// import { useNotification } from "@/app/_context/NotificationContext";
// import { SerializedProduct } from "@/types/product";

// interface ApiProductResponse {
//   id: string;
//   slug: string;
//   title: string;
//   description: string;
//   price: number | string;
//   discountPrice?: number | string | null;
//   imageUrl?: string;
//   images: { url: string }[];
//   stock: number;
//   category?: { name: string };
//   createdAt?: string;
//   updatedAt?: string;
// }

// export default function ProductsPage() {
//   const dispatch = useDispatch();
//   const { notifySuccess, notifyInfo } = useNotification();
  
//   // 1. Access Wishlist from Redux
//   const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  
//   const [products, setProducts] = useState<SerializedProduct[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
//   const [selectedProduct, setSelectedProduct] = useState<SerializedProduct | null>(null);

//   useEffect(() => {
//     async function fetchProducts() {
//       try {
//         const res = await fetch("/api/products?status=ACTIVE");
//         if (res.ok) {
//           const data = await res.json();
//           const rawItems: ApiProductResponse[] = data.items ?? [];
          
//           const serialized = rawItems.map(item => ({
//             id: item.id,
//             slug: item.slug,
//             title: item.title,
//             description: item.description || "",
//             price: Number(item.price),
//             discountPrice: item.discountPrice ? Number(item.discountPrice) : null,
//             categoryName: item.category?.name || "General",
//             stock: item.stock || 0,
//             imageUrl: item.imageUrl || item.images?.[0]?.url || "/placeholder.png",
//             images: item.images.map(img => ({ url: img.url })),
//             createdAt: item.createdAt || new Date().toISOString(),
//             updatedAt: item.updatedAt || new Date().toISOString(),
//           }));

//           setProducts(serialized);
//         }
//       } catch (error) {
//         console.error("Failed to fetch products:", error);
//       } finally {
//         setLoading(false);
//       }
//     }
//     fetchProducts();
//   }, []);

//   const openQuickView = (product: SerializedProduct) => {
//     setSelectedProduct(product);
//     setIsQuickViewOpen(true);
//   };

//   const handleAddToCart = (product: SerializedProduct) => {
//     dispatch(addToCart({ product, quantity: 1 }));
//     notifySuccess(`${product.title} added to stash!`); 
//   };

//   // 2. Wishlist Toggle Handler
//   const handleWishlistToggle = (product: SerializedProduct) => {
//     dispatch(toggleWishlist(product));
//     const isCurrentlyInWishlist = wishlistItems.some(item => item.id === product.id);
//     if (isCurrentlyInWishlist) {
//       notifyInfo("Removed from wishlist");
//     } else {
//       notifySuccess("Added to wishlist!");
//     }
//   };

//   if (loading) {
//     return (
//       <div className="max-w-7xl mx-auto px-4 py-12">
//         <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
//           {[...Array(8)].map((_, i) => <ProductSkeleton key={i} />)}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-[#F9FAFB] min-h-screen">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//         {/* Header Section */}
//         <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4">
//           <div>
//             <h1 className="text-4xl md:text-6xl font-black italic text-slate-900 uppercase tracking-tighter leading-none">
//               The <span className="text-blue-600">Armory</span>
//             </h1>
//             <p className="mt-2 text-gray-500 text-[10px] font-black uppercase tracking-[0.3em]">
//               Elite Equipment Deployment
//             </p>
//           </div>
//           <Link 
//             href="/categories" 
//             className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-800 flex items-center gap-2 transition-all group"
//           >
//             All Categories <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
//           </Link>
//         </div>

//         {products.length === 0 ? (
//           <div className="text-center py-24 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-200">
//             <ShoppingBag className="mx-auto h-16 w-16 text-gray-200" />
//             <h3 className="mt-4 text-lg font-black italic uppercase text-gray-400">Inventory Depleted</h3>
//           </div>
//         ) : (
//           <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
//             {products.map((product) => {
//               // Check if item is in wishlist
//               const isInWishlist = wishlistItems.some(item => item.id === product.id);

//               return (
//                 <div 
//                   key={product.id} 
//                   className="group bg-white border border-gray-100 rounded-[2rem] p-3 md:p-4 flex flex-col items-center transition-all duration-500 hover:shadow-2xl relative"
//                 >
//                   {/* Image Container */}
//                   <div className="relative w-full aspect-square bg-[#F3F4F6] rounded-[1.5rem] overflow-hidden mb-4 flex items-center justify-center p-4">
//                     <Link href={`/products/${product.slug}`} className="w-full h-full relative z-10">
//                       <img
//                         src={product.imageUrl}
//                         alt={product.title}
//                         className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700"
//                       />
//                     </Link>
                    
//                     {/* Action Overlay Buttons */}
//                     <div className="absolute top-2 right-2 flex flex-col gap-2 z-20">
//                       {/* 3. Wishlist Button */}
//                       <button 
//                         onClick={() => handleWishlistToggle(product)}
//                         className={`p-2.5 rounded-full shadow-md transition-all duration-300 ${
//                           isInWishlist 
//                           ? "bg-red-500 text-white" 
//                           : "bg-white/90 text-gray-900 hover:bg-red-50"
//                         }`}
//                       >
//                         <Heart size={18} fill={isInWishlist ? "currentColor" : "none"} />
//                       </button>

//                       <button 
//                         onClick={() => openQuickView(product)}
//                         className="bg-white/90 backdrop-blur-sm p-2.5 rounded-full text-gray-900 shadow-md opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 hover:bg-blue-600 hover:text-white"
//                       >
//                         <Eye size={18} />
//                       </button>
//                     </div>
//                   </div>

//                   {/* Content */}
//                   <div className="flex-1 flex flex-col items-center text-center w-full px-1">
//                     <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1 opacity-60">
//                       {product.categoryName}
//                     </p>
//                     <Link href={`/products/${product.slug}`} className="block w-full">
//                       <h2 className="text-[13px] md:text-sm font-black text-slate-800 line-clamp-2 h-10 mb-1 hover:text-blue-600 transition-colors uppercase italic">
//                         {product.title}
//                       </h2>
//                     </Link>

//                     <p className="text-lg md:text-xl font-black text-slate-900 mb-3 italic">
//                       {formatNaira(product.discountPrice || product.price)}
//                     </p>
//                   </div>

//                   <button 
//                     onClick={() => handleAddToCart(product)}
//                     className="w-full bg-slate-900 hover:bg-blue-600 text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/20"
//                   >
//                     <ShoppingCart size={14} />
//                     Deploy to Cart
//                   </button>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>

//       <ProductQuickView
//         product={selectedProduct}
//         isOpen={isQuickViewOpen}
//         onClose={() => {
//           setIsQuickViewOpen(false);
//           setSelectedProduct(null);
//         }}
//       />
//     </div>
//   );
// }




// app/shop/page.tsx
import { prisma } from "@/app/lib/prisma";
import ShopSidebar from "@/app/_components/ShopSidebar";
import ShopContent from "@/app/shop/components/Shopcontent"; 
import { SerializedProduct } from "@/types/product"; // Ensure this import path is correct

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

  // 3. SINGLE SOURCE OF TRUTH: Map raw DB data to SerializedProduct interface
  const serializedProducts: SerializedProduct[] = rawProducts.map((p: any) => ({
    // ID, title, slug, and other basic strings
    id: p.id,
    title: p.title,
    slug: p.slug,
    description: p.description || "",
    stock: p.stock || 0,
    
    // Numeric conversions for Decimals
    price: Number(p.price || 0),
    discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
    
    // UI-specific flattened fields
    categoryName: p.category?.name || "Tactical Gear",
    imageUrl: p.images?.[0]?.url || "/placeholder.png",
    
    // Array properties
    images: p.images && p.images.length > 0 ? p.images : [{ url: "/placeholder.png" }],
    variants: p.variants ? p.variants.map((v: any) => ({
      ...v,
      price: Number(v.price)
    })) : [],

    // Date to String serialization
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : new Date(p.createdAt).toISOString(),
    updatedAt: p.updatedAt instanceof Date ? p.updatedAt.toISOString() : new Date(p.updatedAt).toISOString(),
    
    // Additional optional fields
    brand: p.brand || null,
    vendorId: p.vendorId || null,
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
        {/* Pass the fully serialized array to the Client component */}
        <ShopContent initialProducts={serializedProducts} />
      </div>
    </div>
  );
}



"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag, ArrowRight, Eye, Star, ShoppingCart } from "lucide-react";
import ProductQuickView from "@/app/_components/ProductQuickView";
import ProductSkeleton from "@/app/_components/ProductSkeleton";
import { formatNaira } from "@/app/lib/FormatNaira";
import { useDispatch } from "react-redux";
import { addToCart } from "@/store/cartSlice";
import { useNotification } from "@/app/_context/NotificationContext";
import { SerializedProduct } from "@/types/product";

// Internal interface to map raw API response
interface ApiProductResponse {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number | string;
  discountPrice?: number | string | null;
  imageUrl?: string;
  images: { url: string }[];
  stock: number;
  category?: { name: string };
  createdAt?: string;
  updatedAt?: string;
}

export default function ProductsPage() {
  const dispatch = useDispatch();
  const { notifySuccess } = useNotification();
  
  // Use the standard type to avoid "not assignable" errors
  const [products, setProducts] = useState<SerializedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<SerializedProduct | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products?status=ACTIVE");
        if (res.ok) {
          const data = await res.json();
          const rawItems: ApiProductResponse[] = data.items ?? [];
          
          // Transform immediately upon fetch
          const serialized = rawItems.map(item => ({
            id: item.id,
            slug: item.slug,
            title: item.title,
            description: item.description || "",
            price: Number(item.price),
            discountPrice: item.discountPrice ? Number(item.discountPrice) : null,
            categoryName: item.category?.name || "General",
            stock: item.stock || 0,
            imageUrl: item.imageUrl || item.images?.[0]?.url || "/placeholder.png",
            images: item.images.map(img => ({ url: img.url })),
            createdAt: item.createdAt || new Date().toISOString(),
            updatedAt: item.updatedAt || new Date().toISOString(),
          }));

          setProducts(serialized);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const openQuickView = (product: SerializedProduct) => {
    setSelectedProduct(product);
    setIsQuickViewOpen(true);
  };

  const handleAddToCart = (product: SerializedProduct) => {
    dispatch(addToCart({ product, quantity: 1 }));
    notifySuccess(`${product.title} added to stash!`); 
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {[...Array(8)].map((_, i) => <ProductSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F9FAFB] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black italic text-slate-900 uppercase tracking-tighter">
              The <span className="text-blue-600">Armory</span>
            </h1>
            <p className="mt-1 text-gray-500 text-xs font-bold uppercase tracking-widest">
              Full Deployment of Available Gear
            </p>
          </div>
          <Link 
            href="/categories" 
            className="text-xs font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
          >
            All Categories <ArrowRight size={16} />
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-300">
            <ShoppingBag className="mx-auto h-16 w-16 text-gray-200" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Your store is empty</h3>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {products.map((product) => (
              <div 
                key={product.id} 
                className="group bg-white border border-gray-100 rounded-3xl p-3 md:p-4 flex flex-col items-center transition-all duration-300 hover:shadow-xl relative"
              >
                {/* Image Container */}
                <div className="relative w-full aspect-square bg-[#F3F4F6] rounded-2xl overflow-hidden mb-4 flex items-center justify-center p-4">
                  <Link href={`/products/${product.slug}`} className="w-full h-full relative z-10">
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                    />
                  </Link>
                  
                  <button 
                    onClick={() => openQuickView(product)}
                    className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm p-2 rounded-full text-gray-900 shadow-md opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all hover:bg-blue-600 hover:text-white z-20"
                  >
                    <Eye size={18} />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col items-center text-center w-full px-1">
                  <Link href={`/products/${product.slug}`} className="block w-full">
                    <h2 className="text-[13px] md:text-sm font-bold text-gray-800 line-clamp-2 h-10 mb-1 hover:text-blue-600 transition-colors">
                      {product.title}
                    </h2>
                  </Link>

                  <p className="text-base md:text-lg font-black text-blue-600 mb-2">
                    {formatNaira(product.discountPrice || product.price)}
                  </p>

                  <div className="flex items-center gap-1 mb-4">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={10} fill={i < 4 ? "currentColor" : "none"} />
                      ))}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => handleAddToCart(product)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-full font-bold text-xs md:text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={16} />
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <ProductQuickView
        product={selectedProduct}
        isOpen={isQuickViewOpen}
        onClose={() => {
          setIsQuickViewOpen(false);
          setSelectedProduct(null);
        }}
      />
    </div>
  );
}
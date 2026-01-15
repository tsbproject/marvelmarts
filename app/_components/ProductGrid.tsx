"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Zap, Star, Clock } from "lucide-react";

interface Product {
  id: string;
  slug: string;
  title: string;
  price: number;
  discountPrice: number | null;
  imageUrl: string;
  category: { name: string };
}

interface ProductGridProps {
  title: string;
  type: "new" | "flash" | "featured";
  limit?: number;
}

export default function ProductGrid({ title, type, limit = 4 }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch(`/api/products?type=${type}&pageSize=${limit}`);
        const data = await res.json();
        if (data.success) setProducts(data.items);
      } catch (err) {
        console.error(`Failed to load ${type} products`, err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [type, limit]);

  if (loading) return <div className="h-64 flex items-center justify-center animate-pulse text-gray-400">Loading {title}...</div>;
  if (products.length === 0) return null; // Hide the section if no products exist

  const getIcon = () => {
    if (type === "flash") return <Zap size={20} className="text-amber-500 fill-amber-500" />;
    if (type === "featured") return <Star size={20} className="text-blue-500 fill-blue-500" />;
    return <Clock size={20} className="text-green-500" />;
  };

  return (
    <section className="py-12">
      <div className="flex items-center justify-between mb-8 border-b pb-4">
        <div className="flex items-center gap-2">
          {getIcon()}
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 uppercase">{title}</h2>
        </div>
        <Link href={`/shop?filter=${type}`} className="text-sm font-semibold text-blue-600 hover:underline">
          View All
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => {
          const discount = product.discountPrice 
            ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
            : null;

          return (
            <Link key={product.id} href={`/products/${product.slug}`} className="group">
              <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100 border transition-all group-hover:shadow-md">
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {discount && (
                  <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded">
                    -{discount}%
                  </span>
                )}
              </div>
              <div className="mt-4 space-y-1">
                <p className="text-xs text-gray-500 uppercase tracking-wider">{product.category.name}</p>
                <h3 className="text-sm font-medium text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                  {product.title}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900">
                    ₦{(product.discountPrice || product.price).toLocaleString()}
                  </span>
                  {product.discountPrice && (
                    <span className="text-xs text-gray-400 line-through">
                      ₦{product.price.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
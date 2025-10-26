'use client';

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import Image from "next/image";

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("https://fakestoreapi.com/products?limit=8");
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-500 text-xl">
        Loading featured products...
      </div>
    );
  }

  return (
    <section className="w-full max-w-[1200px] mx-auto px-6 py-16 -mt-[45rem]">
      <h2 className="text-4xl font-bold mb-10 text-gray-800 text-center">
        Featured Products
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
          >
            <div className="relative w-full h-64 bg-gray-50 flex items-center justify-center">
              <Image
                src={product.image}
                alt={product.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-5 flex flex-col justify-between h-[180px]">
              <h3 className="text-gray-700 text-lg font-semibold mb-2 line-clamp-2">
                {product.title}
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-blue-600 text-2xl font-bold">
                  ${product.price.toFixed(2)}
                </span>
                <div className="flex items-center text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.round(product.rating.rate)
                          ? "fill-yellow-400"
                          : "fill-gray-200"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}


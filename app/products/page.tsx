"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  discountPrice?: number;
  imageUrl: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function fetchProducts() {
      const res = await fetch("/api/products?status=ACTIVE");
      if (res.ok) {
        const data = await res.json();
        setProducts(data.items ?? []);
      }
    }
    fetchProducts();
  }, []);

  return (
    <div className="p-6 md:p-10">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center">
        Our Products
      </h1>

      {products.length === 0 ? (
        <p className="text-center text-gray-500">No products available.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="border rounded-lg shadow-sm hover:shadow-md transition bg-white flex flex-col"
            >
              {/* Product Image */}
              <div className="relative">
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="h-56 w-full object-cover rounded-t-lg"
                />
                {product.discountPrice && (
                  <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                    Sale
                  </span>
                )}
              </div>

              {/* Product Details */}
              <div className="p-4 flex flex-col flex-grow">
                <h2 className="text-lg font-semibold mb-2">{product.title}</h2>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {product.description}
                </p>

                {/* Pricing */}
                <div className="mb-4">
                  {product.discountPrice ? (
                    <div className="flex items-center gap-2">
                      <span className="text-red-600 font-bold text-lg">
                        ${product.discountPrice}
                      </span>
                      <span className="line-through text-gray-400 text-sm">
                        ${product.price}
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-800 font-bold text-lg">
                      ${product.price}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-auto flex gap-2">
                  <Link
                    href={`/products/${product.slug}`}
                    className="flex-1 bg-blue-600 text-white text-center py-2 rounded hover:bg-blue-700 transition"
                  >
                    Shop Now
                  </Link>
                  <button
                    className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
                    onClick={() => alert(`Added ${product.title} to cart`)}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Star } from "lucide-react";

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  const categories = [
    { key: "all", label: "All Products" },
    { key: "electronics", label: "Electronics" },
    { key: "jewelery", label: "Jewelry" },
    { key: "men's clothing", label: "Men’s Clothing" },
    { key: "women's clothing", label: "Women’s Clothing" },
  ];

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("https://fakestoreapi.com/products");
        const data = await res.json();
        setProducts(data);
        setFiltered(data);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    if (category === "all") {
      setFiltered(products);
    } else {
      setFiltered(products.filter((p) => p.category === category));
    }
  }, [category, products]);

  return (
    <section className="w-full  -mt-[40rem]">
      {/* 🏷️ Category Tabs */}
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setCategory(cat.key)}
            className={`px-5 py-2 rounded-full font-semibold text-md md:text-2xl transition-all duration-200 
            ${
              category === cat.key
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 🛍️ Product Grid */}
      {loading ? (
        <div className="text-center text-lg text-gray-500">Loading products...</div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 px-4 md:px-10"
          >
            {filtered.map((product) => (
              <motion.div
                key={product.id}
                whileHover={{ scale: 1.03 }}
                className="bg-white rounded-2xl shadow-lg p-4 flex flex-col items-center transition-transform"
              >
                <div className="relative w-full h-52 flex items-center justify-center mb-4">
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    className="object-contain p-4"
                  />
                </div>
                <h3 className="font-semibold text-center text-gray-800 text-sm md:text-base line-clamp-2">
                  {product.title}
                </h3>
                <p className="mt-2 text-lg font-bold text-blue-600">${product.price}</p>
                <div className="flex items-center mt-2 space-x-1">
                  {Array.from({ length: Math.round(product.rating?.rate || 4) }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                  <span className="text-sm text-gray-500">({product.rating?.count || 0})</span>
                </div>
                <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-full font-semibold transition-all duration-200">
                  Add to Cart
                </button>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </section>
  );
}


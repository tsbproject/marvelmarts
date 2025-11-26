"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Star } from "lucide-react";
import { getAllProducts } from "@/app/lib/api";



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
        const data = await getAllProducts();

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
    <section className="w-full bg-linear-to-b from-gray-50 to-white py-20 px-4 md:px-10">
      {/* 🏷️ Section Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-extrabold text-gray-800">
          🌟 Featured Products
        </h2>
        <p className="text-gray-500 mt-3 text-lg">
          Discover our most popular and trending products
        </p>
      </div>

      {/* 🧭 Category Tabs */}
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        {categories.map((cat) => (
          <motion.button
            key={cat.key}
            onClick={() => setCategory(cat.key)}
            whileTap={{ scale: 0.95 }}
            className={`px-5 py-2 rounded-full font-semibold text-md md:text-lg transition-all duration-200 
              ${
                category === cat.key
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700"
              }`}
          >
            {cat.label}
          </motion.button>
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
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8"
          >
            {filtered.map((product) => (
              <motion.div
                key={product.id}
                whileHover={{ scale: 1.03 }}
                className="bg-white rounded-2xl shadow-md hover:shadow-2xl p-4 flex flex-col items-center transition-all duration-300"
              >
                {/* 🖼️ Image */}
                <div className="relative w-full h-52 flex items-center justify-center mb-4 overflow-hidden rounded-xl bg-gray-50">
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    className="object-contain p-6 transition-transform duration-300 hover:scale-110"
                  />
                </div>

                {/* 🏷️ Info */}
                <h3 className="font-semibold text-center text-gray-800 text-sm md:text-base line-clamp-2 h-10">
                  {product.title}
                </h3>

                <p className="mt-2 text-lg font-bold text-blue-600">
                  ${product.price.toFixed(2)}
                </p>

                {/* ⭐ Rating */}
                <div className="flex items-center mt-2 space-x-1">
                  {Array.from({ length: Math.round(product.rating?.rate || 4) }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 text-yellow-400 fill-yellow-400 animate-pulse"
                    />
                  ))}
                  <span className="text-sm text-gray-500">
                    ({product.rating?.count || 0})
                  </span>
                </div>

                {/* 🛒 Button */}
                <button className="mt-5 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-full font-semibold transition-all duration-300">
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

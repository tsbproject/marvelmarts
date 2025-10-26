"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Star } from "lucide-react";

export default function FlashSales() {
  const [products, setProducts] = useState([]);
  const [timeLeft, setTimeLeft] = useState({ h: 3, m: 15, s: 42 });

  // ⏱️ Countdown logic
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        let { h, m, s } = prev;
        if (s > 0) s--;
        else if (m > 0) {
          s = 59;
          m--;
        } else if (h > 0) {
          m = 59;
          s = 59;
          h--;
        }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function fetchFlash() {
      const res = await fetch("https://fakestoreapi.com/products?limit=6");
      const data = await res.json();
      setProducts(data);
    }
    fetchFlash();
  }, []);

  return (
    <section className="mt-20 px-4 md:px-12">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
          ⚡ Flash Sales
        </h2>

        <div className="flex items-center space-x-2 text-lg text-gray-700">
          <span>Ends in:</span>
          <span className="font-bold text-blue-600">
            {`${timeLeft.h.toString().padStart(2, "0")}:${timeLeft.m
              .toString()
              .padStart(2, "0")}:${timeLeft.s.toString().padStart(2, "0")}`}
          </span>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
        {products.map((product) => (
          <motion.div
            key={product.id}
            whileHover={{ scale: 1.03 }}
            className="bg-white shadow-lg rounded-xl p-4 relative overflow-hidden"
          >
            <span className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              -{Math.floor(Math.random() * 50) + 10}%
            </span>

            <div className="relative w-full h-40 flex items-center justify-center mb-3">
              <Image
                src={product.image}
                alt={product.title}
                fill
                className="object-contain p-3"
              />
            </div>

            <h3 className="text-sm font-semibold text-gray-800 line-clamp-2">
              {product.title}
            </h3>
            <p className="text-blue-600 font-bold mt-2">${product.price}</p>

            <div className="flex items-center mt-1 space-x-1">
              {Array.from({ length: Math.round(product.rating?.rate || 4) }).map(
                (_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                )
              )}
            </div>

            <button className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-full text-sm font-semibold">
              Shop Now
            </button>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

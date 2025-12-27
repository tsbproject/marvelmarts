"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Star, Zap } from "lucide-react";
import { getFlashProducts } from "@/app/lib/api";

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

  // 🛒 Fetch products
  useEffect(() => {
    async function fetchFlash() {
      const data = await getFlashProducts();
      setProducts(data);
    }
    fetchFlash();
  }, []);

  return (
    <section className="mt-24 relative overflow-hidden">
      {/* 🔥 Flash Sale Banner */}
      <div className="bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 text-white px-6 md:px-12 py-10 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center md:justify-between mb-10">
        <div className="flex items-center gap-3">
          <Zap className="w-10 h-10 animate-pulse" />
          <h2 className="text-3xl md:text-4xl font-extrabold drop-shadow-md">
            FLASH SALES
          </h2>
        </div>

        {/* Countdown */}
        <div className="mt-4 md:mt-0 flex items-center gap-2 text-lg md:text-2xl font-bold">
          <span className="opacity-90">Ends In:</span>
          <motion.span
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="bg-white text-red-600 px-4 py-1 rounded-md font-extrabold shadow-lg tracking-wider"
          >
            {`${timeLeft.h.toString().padStart(2, "0")}:${timeLeft.m
              .toString()
              .padStart(2, "0")}:${timeLeft.s.toString().padStart(2, "0")}`}
          </motion.span>
        </div>
      </div>

      {/* 🛍️ Product Grid */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5 px-4 md:px-12"
      >
        {products.map((product) => {
          const discount = Math.floor(Math.random() * 40) + 10;
          const discountedPrice = (product.price * (1 - discount / 100)).toFixed(2);
          const stockLeft = Math.floor(Math.random() * 80) + 20; // Fake stock

          return (
            <motion.div
              key={product.id}
              whileHover={{ scale: 1.03 }}
              className="bg-white shadow-lg rounded-2xl p-4 relative overflow-hidden hover:shadow-2xl transition-all duration-300"
            >
              {/* 🔖 Discount Badge */}
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md flex items-center gap-1"
              >
                <Zap className="w-3 h-3" /> -{discount}%
              </motion.span>

              {/* 🖼️ Product Image */}
              <div className="relative w-full h-40 flex items-center justify-center mb-3 bg-gray-50 rounded-xl">
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  className="object-contain p-3 transition-transform duration-300 hover:scale-110"
                />
              </div>

              {/* 🏷️ Info */}
              <h3 className="text-sm font-semibold text-gray-800 line-clamp-2">
                {product.title}
              </h3>

              {/* 💰 Price */}
              <div className="flex items-center gap-2 mt-2">
                <p className="text-blue-600 font-bold text-lg">${discountedPrice}</p>
                <p className="text-gray-400 text-sm line-through">${product.price}</p>
              </div>

              {/* ⭐ Rating */}
              <div className="flex items-center mt-1 space-x-1">
                {Array.from({ length: Math.round(product.rating?.rate || 4) }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-yellow-400 fill-yellow-400 animate-pulse"
                  />
                ))}
              </div>

              {/* 📊 Stock Progress */}
              <div className="mt-3 w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-orange-500 to-red-600 h-full"
                  style={{ width: `${stockLeft}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{stockLeft}% sold</p>

              {/* 🛒 Button */}
              <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-full text-sm font-semibold transition-all duration-300">
                Shop Now
              </button>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}


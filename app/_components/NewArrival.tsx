"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Star } from "lucide-react";
import { getNewArrivals } from "@/app/lib/api";

export default function NewArrivals() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function fetchNew() {
      const data = await getNewArrivals();
      setProducts(data.slice(0, 8));
    }
    fetchNew();
  }, []);

  return (
    <section className="mt-24 px-4 md:px-12">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8">
        🆕 New Arrivals
      </h2>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6"
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white shadow-md rounded-xl p-4 flex flex-col items-center hover:shadow-lg transition"
          >
            <div className="relative w-full h-48 flex items-center justify-center mb-4">
              <Image
                src={product.image}
                alt={product.title}
                fill
                className="object-contain p-4"
              />
            </div>
            <h3 className="text-sm font-semibold text-gray-700 text-center line-clamp-2">
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
          </div>
        ))}
      </motion.div>
    </section>
  );
}

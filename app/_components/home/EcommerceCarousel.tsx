"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";

const slides = [
  {
    id: 1,
    title: "Step Into Style",
    subtitle: "Explore the latest fashion collections for every season.",
    img: "/images/carousel5x.png",
    accent: "text-brand-primary",
  },
  {
    id: 2,
    title: "Upgrade Your Tech",
    subtitle: "Find premium gadgets and accessories at unbeatable prices.",
    img: "/images/Carousel1.png",
    accent: "text-white",
  },
  {
    id: 3,
    title: "Online Shopping Redefined",
    subtitle: "Discover more of your favorites on MarvelMarts.",
    img: "/images/Carousel3.png",
    accent: "text-brand-primary",
  },
  {
    id: 4,
    title: "Sport in Style",
    subtitle: "Performance meets comfort with our new activewear line.",
    img: "/images/carousel4.png",
    accent: "text-white",
  },
];

export default function EcommerceCarousel() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0); // For sliding effect direction

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(nextSlide, 8000); // Slower, more premium feel
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <div className="relative w-full mx-auto overflow-hidden group">
      {/* Container Height */}
      <div className="relative w-full h-[45vh] md:h-[70vh]  overflow-hidden">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0"
          >
            {/* Cinematic Parallax Background */}
            <motion.div 
              initial={{ scale: 1.15 }}
              animate={{ scale: 1 }}
              transition={{ duration: 10, ease: "linear" }}
              className="relative w-full h-full"
            >
              <Image
                src={slides[current].img}
                alt={slides[current].title}
                fill
                priority
                quality={100}
                className="object-center"
              />
              {/* Subtle Gradient Overlay for Readability */}
              <div className="absolute inset-0 bg-black/20" />
            </motion.div>

            {/* Staggered Text Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-20">
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="text-xs md:text-sm font-black uppercase tracking-[0.4em] text-white/80 mt-6 mb-4"
              >
                New Arrival 2026
              </motion.span>
              
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className={`text-lg md:text-5xl font-black italic uppercase tracking-tighter leading-none mb-6 drop-shadow-2xl ${slides[current].accent}`}
              >
                {slides[current].title}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="text-sm md:text-xl text-white/90 max-w-xl font-medium drop-shadow-md mb-8"
              >
                {slides[current].subtitle}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <Link
                  href="/shop"
                  className="group relative inline-flex items-center gap-3 bg-white text-accent-navy px-8 py-4 rounded-full font-black uppercase text-xs transition-all hover:bg-brand-primary hover:text-white overflow-hidden"
                >
                  <span className="relative z-10">Shop Collection</span>
                  <ShoppingBag className="w-4 h-4 relative z-10 transition-transform group-hover:rotate-12" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Professional Navigation Controls */}
        <div className="absolute inset-x-0 bottom-10 flex items-center justify-between px-6 md:px-12 z-30">
          
          {/* Progress Indicators (Left side) */}
          <div className="flex gap-4">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                className="relative h-1 w-12 md:w-20 bg-white/20 overflow-hidden rounded-full"
              >
                {index === current && (
                  <motion.div
                    layoutId="progress"
                    className="absolute inset-0 bg-brand-primary"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 8, ease: "linear" }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Minimalist Arrow Controls (Right side) */}
          <div className="flex gap-2">
            <button
              onClick={prevSlide}
              className="p-4 border border-white/30 text-white rounded-full hover:bg-white hover:text-black transition-all backdrop-blur-md"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              className="p-4 border border-white/30 text-white rounded-full hover:bg-white hover:text-black transition-all backdrop-blur-md"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

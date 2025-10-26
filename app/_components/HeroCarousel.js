'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Sample slides (replace with your images)
const slides = [
  {
    id: 1,
    image: '/images/slide1.jpg',
    title: 'Discover the Future of Smart Devices',
    subtitle: 'Phones • Laptops • Accessories',
    color: 'from-blue-600/70 to-black/80',
  },
  {
    id: 2,
    image: '/images/slide2.jpg',
    title: 'Stay Connected, Stay Powerful',
    subtitle: 'MarvelMarts Telecom Collection',
    color: 'from-indigo-600/70 to-gray-900/80',
  },
  {
    id: 3,
    image: '/images/slide3.jpg',
    title: 'Performance Meets Style',
    subtitle: 'Laptops & Desktops Built for You',
    color: 'from-emerald-600/70 to-black/80',
  },
  {
    id: 4,
    image: '/images/slide4.jpg',
    title: 'Accessories that Define Your Experience',
    subtitle: 'Audio • Storage • Essentials',
    color: 'from-rose-600/70 to-gray-900/80',
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prevSlide = () =>
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  const textVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.2, duration: 0.6, ease: 'easeOut' },
    }),
  };

  return (
    <div className="relative w-full h-[85vh] overflow-hidden rounded-b-3xl">
      <AnimatePresence>
        {slides.map(
          (slide, index) =>
            index === current && (
              <motion.div
                key={slide.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className="absolute inset-0 w-full h-full"
              >
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  priority
                  className="object-cover"
                />

                {/* Gradient overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${slide.color}`}
                ></div>

                {/* Text overlay */}
                <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-24 text-white max-w-2xl">
                  <motion.h1
                    custom={0}
                    variants={textVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-3xl md:text-6xl font-extrabold leading-tight drop-shadow-lg"
                  >
                    {slide.title}
                  </motion.h1>
                  <motion.p
                    custom={1}
                    variants={textVariants}
                    initial="hidden"
                    animate="visible"
                    className="mt-3 md:mt-5 text-lg md:text-2xl text-gray-200 tracking-wide"
                  >
                    {slide.subtitle}
                  </motion.p>

                  <motion.button
                    custom={2}
                    variants={textVariants}
                    initial="hidden"
                    animate="visible"
                    className="mt-8 px-6 py-3 md:px-8 md:py-4 bg-blue-600 hover:bg-blue-700 rounded-full text-lg md:text-xl font-semibold shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    Shop Now
                  </motion.button>
                </div>
              </motion.div>
            )
        )}
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 p-3 rounded-full text-white transition"
      >
        <ChevronLeft size={28} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 p-3 rounded-full text-white transition"
      >
        <ChevronRight size={28} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
        {slides.map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              i === current ? 'bg-white scale-125' : 'bg-gray-400/70'
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
}



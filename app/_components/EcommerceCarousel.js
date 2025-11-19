'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    id: 1,
    title: 'Step Into Style',
    subtitle: 'Explore the latest fashion collections for every season.',
    img: '/images/slide1.jpg',
    bgColor: 'from-purple-500 via-pink-500 to-orange-400',
  },
  {
    id: 2,
    title: 'Upgrade Your Tech',
    subtitle: 'Find premium gadgets and accessories at unbeatable prices.',
    img: '/images/slide2.jpg',
    bgColor: 'from-indigo-500 via-sky-500 to-cyan-400',
  },
  {
    id: 3,
    title: 'Your Home, Reimagined',
    subtitle: 'Discover elegant furniture and home décor collections.',
    img: '/images/slide3.jpg',
    bgColor: 'from-green-400 via-lime-500 to-yellow-400',
  },
  {
    id: 4,
    title: 'Sport in Style',
    subtitle: 'Performance meets comfort with our new activewear line.',
    img: '/images/slide4.jpg',
    bgColor: 'from-rose-500 via-red-500 to-orange-400',
  },
];

export default function EcommerceCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="relative -mb-170 w-full md:w-full mx-auto  overflow-hidden shadow-2xl">
      <div className="relative  w-full h-112 md:h-160 bg-gray-200 rounded-2xl">
        <AnimatePresence mode="wait">
          {slides.map(
            (slide, index) =>
              index === current && (
                <motion.div
                  key={slide.id}
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.8, ease: 'easeInOut' }}
                  className={`absolute inset-0 bg-linear-to-r ${slide.bgColor} flex items-center justify-center`}
                >
                  {/* Background image with soft overlay */}
                  <div className="absolute inset-0">
                    <Image
                      src={slide.img}
                      alt={slide.title}
                      fill
                      priority
                      className="object-cover opacity-40"
                    />
                  </div>

                  {/* Text content */}
                  <motion.div
                    key={slide.title}
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10 text-center text-white px-6 max-w-2xl"
                  >
                    <h1 className="text-3xl md:text-6xl font-bold drop-shadow-xl mb-4">
                      {slide.title}
                    </h1>
                    <p className="text-lg md:text-2xl font-light drop-shadow-lg">
                      {slide.subtitle}
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="mt-6 px-8 py-3 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition"
                    >
                      Shop Now
                    </motion.button>
                  </motion.div>
                </motion.div>
              )
          )}
        </AnimatePresence>

        {/* Navigation arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black rounded-full p-3 shadow-md transition"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black rounded-full p-3 shadow-md transition"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Dots indicator */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, index) => (
            <div
              key={index}
              onClick={() => setCurrent(index)}
              className={`w-3 h-3 rounded-full cursor-pointer transition-all duration-300 ${
                index === current ? 'bg-white scale-125' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

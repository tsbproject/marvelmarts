


// "use client";

// import { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import Image from "next/image";
// import { ChevronLeft, ChevronRight } from "lucide-react";

// const slides = [
//   {
//     id: 1,
//     title: "Step Into Style",
//     subtitle: "Explore the latest fashion collections for every season.",
//     img: "/images/slide002.jpg",
//   },
//   {
//     id: 2,
//     title: "Upgrade Your Tech",
//     subtitle: "Find premium gadgets and accessories at unbeatable prices.",
//     img: "/images/slide00001.jpg",
//   },
//   {
//     id: 3,
//     title: "Online Shopping Redefined",
//     subtitle: "Discover more and more of your favorites items on MarvelMarts.",
//     img: "/images/slide003.jpg",
//   },
//   {
//     id: 4,
//     title: "Sport in Style",
//     subtitle: "Performance meets comfort with our new activewear line.",
//     img: "/images/slide004.jpg",
//   },
// ];

// export default function EcommerceCarousel() {
//   const [current, setCurrent] = useState(0);

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setCurrent((prev) => (prev + 1) % slides.length);
//     }, 6000);
//     return () => clearInterval(timer);
//   }, []);

//   const nextSlide = () =>
//     setCurrent((prev) => (prev + 1) % slides.length);
//   const prevSlide = () =>
//     setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

//   return (
//     <div className="relative -mb-170 w-full mx-auto overflow-hidden shadow-2xl">
//       <div className="relative w-full h-112 md:h-165 bg-gray-200 rounded-2xl">
//         <AnimatePresence mode="wait">
//           {slides.map(
//             (slide, index) =>
//               index === current && (
//                 <motion.div
//                   key={slide.id}
//                   initial={{ opacity: 1, scale: 1.02 }}
//                   animate={{ opacity: 1, scale: 1 }}
//                   exit={{ opacity: 0, scale: 1.02 }}
//                   transition={{ duration: 0.8, ease: "easeInOut" }}
//                   className="absolute inset-0 flex items-center justify-center"
//                 >
//                   {/* Background image (NO overlay) */}
//                   <Image
//                     src={slide.img}
//                     alt={slide.title}
//                     fill
//                     priority
//                     quality={80}
//                     className="object-cover"
//                   />

//                   {/* Text content */}
//                   <motion.div
//                     key={slide.title}
//                     initial={{ y: 40, opacity: 0 }}
//                     animate={{ y: 0, opacity: 1 }}
//                     transition={{ duration: 0.8 }}
//                     className="relative z-10 text-center text-brand-primary px-6 max-w-2xl"
//                   >
//                     <h1 className="text-3xl md:text-6xl font-bold drop-shadow-xl mb-4">
//                       {slide.title}
//                     </h1>
//                     <p className="text-lg md:text-2xl text-accent-navy font-light drop-shadow-lg">
//                       {slide.subtitle}
//                     </p>
//                     <motion.button
//                       whileHover={{ scale: 1.1 }}
//                       whileTap={{ scale: 0.95 }}
//                       className="mt-6 px-8 py-3 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition"
//                     >
//                       Shop Now
//                     </motion.button>
//                   </motion.div>
//                 </motion.div>
//               )
//           )}
//         </AnimatePresence>

//         {/* Navigation arrows */}
//         <button
//           onClick={prevSlide}
//           className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black rounded-full p-3 shadow-md transition"
//         >
//           <ChevronLeft className="w-6 h-6" />
//         </button>

//         <button
//           onClick={nextSlide}
//           className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black rounded-full p-3 shadow-md transition"
//         >
//           <ChevronRight className="w-6 h-6" />
//         </button>

//         {/* Dots indicator */}
//         <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
//           {slides.map((_, index) => (
//             <div
//               key={index}
//               onClick={() => setCurrent(index)}
//               className={`w-3 h-3 rounded-full cursor-pointer transition-all duration-300 ${
//                 index === current
//                   ? "bg-white scale-125"
//                   : "bg-white/50"
//               }`}
//             />
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }




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
    img: "/images/slide002.jpg",
    accent: "text-brand-primary",
  },
  {
    id: 2,
    title: "Upgrade Your Tech",
    subtitle: "Find premium gadgets and accessories at unbeatable prices.",
    img: "/images/slide00001.jpg",
    accent: "text-white",
  },
  {
    id: 3,
    title: "Online Shopping Redefined",
    subtitle: "Discover more of your favorites on MarvelMarts.",
    img: "/images/slide003.jpg",
    accent: "text-brand-primary",
  },
  {
    id: 4,
    title: "Sport in Style",
    subtitle: "Performance meets comfort with our new activewear line.",
    img: "/images/slide004.jpg",
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
      <div className="relative w-full h-[70vh] md:h-[45vh] min-h-[500px] overflow-hidden">
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
                className="object-cover object-center"
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
                className="text-xs md:text-sm font-black uppercase tracking-[0.4em] text-white/80 mb-4"
              >
                New Arrival 2026
              </motion.span>
              
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className={`text-4xl md:text-8xl font-black italic uppercase tracking-tighter leading-none mb-6 drop-shadow-2xl ${slides[current].accent}`}
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
                  className="group relative inline-flex items-center gap-3 bg-white text-accent-navy px-10 py-4 rounded-full font-black uppercase text-sm transition-all hover:bg-brand-primary hover:text-white overflow-hidden"
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

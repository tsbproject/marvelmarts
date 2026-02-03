"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";

interface ProductGalleryProps {
  images: { url: string }[];
  title: string;
}

export default function ProductGallery({ images, title }: ProductGalleryProps) {
  const [activeImage, setActiveImage] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    setMousePos({ x, y });
  };

  return (
    <div className="space-y-6">
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className="relative aspect-square bg-white rounded-[3.5rem] overflow-hidden border border-gray-100 shadow-inner cursor-zoom-in"
      >
        <div 
          className="relative w-full h-full transition-transform duration-200 ease-out"
          style={{
            transform: isHovering ? "scale(2)" : "scale(1)",
            transformOrigin: `${mousePos.x}% ${mousePos.y}%`
          }}
        >
          <Image
            src={images[activeImage].url}
            alt={title}
            fill
            priority
            className="object-contain p-12"
          />
        </div>
      </div>

      {images.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImage(idx)}
              className={`relative w-24 h-24 shrink-0 rounded-[1.5rem] overflow-hidden border-2 transition-all bg-white ${
                activeImage === idx ? "border-[#F7931E] scale-95 shadow-lg" : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <Image src={img.url} alt={`View ${idx}`} fill className="object-contain p-2" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
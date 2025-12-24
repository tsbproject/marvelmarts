// app/components/CategoryTopbar.tsx
"use client";

import Link from "next/link";
import { categories } from "@/app/_data/CategoriesSidebar";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function CategoryTopbar() {
  const [hovered, setHovered] = useState<string | null>(null);

  // Variants for staggered submenu animation
  const listVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.08, // delay between items
      },
    },
    exit: { opacity: 0, y: 10, transition: { duration: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.25,
        ease: "easeOut" as const, 
      },
    },
  };

  return (
    <nav className="bg-accent-navy shadow-md border-t border-gray-200">
      <div className="flex items-center justify-center px-6 py-3">
        {/* Title */}
        <span className="mr-8 text-gray-50 text-xl font-bold uppercase tracking-wide">
          Categories
        </span>

        {/* Main categories horizontally */}
        <div className="flex items-center space-x-6 flex-1">
          {categories.map(({ name, subcategories }) => (
            <div
              key={name}
              className="relative"
              onMouseEnter={() => setHovered(name)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Main category */}
              <Link
                href={`/categories/${name.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-brand-primary py-2 font-medium hover:text-brand-primary transition-colors duration-200 text-lg rounded-xl 
                           relative after:block after:h-0.5 after:bg-brand-primary after:scale-x-0 hover:after:scale-x-100
                           after:transition-transform after:duration-200 after:origin-left after:absolute after:bottom-1 after:left-0"
              >
                {name}
              </Link>

              {/* Dropdown with Framer Motion */}
              <AnimatePresence>
                {subcategories && subcategories.length > 0 && hovered === name && (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={listVariants}
                    className="absolute left-0 top-full bg-white shadow-xl rounded-md mt-3 z-50"
                  >
                    <motion.ul className="py-3 px-4 min-w-[220px]">
                      {subcategories.map((sub) => (
                        <motion.li key={sub} variants={itemVariants}>
                          <Link
                            href={`/categories/${name.toLowerCase().replace(/\s+/g, "-")}/${sub
                              .toLowerCase()
                              .replace(/\s+/g, "-")}`}
                            className="block py-2 px-2 text-lg text-gray-700 rounded hover:bg-gray-100 hover:text-brand-primary transition-colors duration-200"
                          >
                            {sub}
                          </Link>
                        </motion.li>
                      ))}
                    </motion.ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
}

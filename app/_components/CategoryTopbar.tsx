




"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import type { Category } from "@prisma/client";

// Recursive type: Category plus children
export type CategoryTree = Category & { children: CategoryTree[] };

interface CategoryTopbarProps {
  categories: CategoryTree[];
}

export default function CategoryTopbar({ categories }: CategoryTopbarProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  // Framer Motion variants
  const listVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.08 },
    },
    exit: { opacity: 0, y: 10, transition: { duration: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.25, ease: "easeOut" as const },
    },
  };

  return (
    <nav className="bg-accent-navy shadow-md border-t border-gray-200">
      <div className="flex items-center justify-center px-6 py-3">
        {/* Title */}
        <span className="mr-8 text-brand-light sm:text-md md:text-[8px] lg:text[10px] xl:text-[11px] font-bold uppercase tracking-wide">
          Categories
        </span>

        {/* Main categories horizontally */}
        <div className="flex items-center space-x-6 flex-1">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="relative"
              onMouseEnter={() => setHovered(cat.name)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Main category */}
              <Link
                href={`/categories/${cat.slug}`}
                className="text-gray-100 py-2 font-medium hover:text-brand-primary transition-colors duration-200 text-[7px] 
                sm:text-md md:text-[7px] lg:text-[7px] xl:text-[11px] 2xl:text-[11px] rounded-xl 
                relative after:block after:h-0.5 after:bg-brand-primary after:scale-x-0 hover:after:scale-x-100
                after:transition-transform after:duration-200 after:origin-left after:absolute after:bottom-1 after:left-0"
              >
                {cat.name}
              </Link>

              {/* Mega menu dropdown with scroll */}
              <AnimatePresence>
                {cat.children?.length > 0 && hovered === cat.name && (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={listVariants}
                    className="
                      absolute -left-31 top-full bg-white shadow-xl text-xl  rounded-md mt-3 z-50 
                      w-[900px] max-w-[90vw] px-20 pt-2
                      max-h-[70vh] overflow-hidden
                    "
                  >
                    {/* Scrollable content area */}
                    <div className="max-h-[65vh] overflow-y-auto pr-6 scrollbar-accent">
                      <motion.ul className="flex flex-wrap gap-8">
                        {cat.children.map((sub) => (
                          <motion.li
                            key={sub.id}
                            variants={itemVariants}
                            className="w-1/4 min-w-[200px] flex flex-col items-start"
                          >
                            {/* Category image */}
                            {sub.imageUrl && (
                              <img
                                src={sub.imageUrl}
                                alt={sub.name}
                                className="w-20 h-20 object-cover rounded-md mb-3 border border-gray-200"
                              />
                            )}

                            {/* Breadcrumb trail */}
                            <div className="text-brand-dark text-sm mb-1">
                              {cat.name} &gt; {sub.name}
                            </div>

                            {/* Child category name */}
                            <Link
                              href={`/categories/${sub.slug}`}
                              className="block font-semibold text-accent-navy mb-2 hover:text-brand-primary"
                            >
                              {sub.name}
                            </Link>

                            {/* Grandchildren */}
                            {sub.children?.length > 0 && (
                              <ul className="space-y-1">
                                {sub.children.map((child) => (
                                  <li key={child.id}>
                                    <Link
                                      href={`/categories/${child.slug}`}
                                      className="block text-lg text-gray-600 hover:text-brand-primary"
                                    >
                                      {child.name}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </motion.li>
                        ))}
                      </motion.ul>
                    </div>

                    {/* Optional subtle bottom fade to indicate scrollable area */}
                    <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-linear-to-t from-white to-transparent" />
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


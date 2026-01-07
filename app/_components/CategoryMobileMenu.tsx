
// app/components/CategoryMobileMenu.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { categories } from "@/app/_data/CategoriesSidebar";

export default function CategoryMobileMenu() {
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const toggleCategory = (name: string) => {
    setOpenCategory(openCategory === name ? null : name);
  };

  return (
    <nav className="p-4 bg-white shadow-md">
      <ul className="space-y-3">
        {categories.map((cat) => (
          <li key={cat.name}>
            {/* Main category button */}
            <button
              onClick={() => toggleCategory(cat.name)}
              className="w-full flex justify-between items-center text-xl font-semibold text-accent-navy hover:text-brand-primary transition-colors"
            >
              {cat.name}
              <span className="ml-2 text-gray-500">
                {openCategory === cat.name ? "−" : "+"}
              </span>
            </button>

            {/* Subcategories accordion */}
            {cat.subcategories && (
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openCategory === cat.name ? "max-h-40 opacity-100 mt-2" : "max-h-0 opacity-0"
                }`}
              >
                <ul className="ml-4 space-y-1">
                  {cat.subcategories.map((sub) => (
                    <li key={sub}>
                      <Link
                        href={`/categories/${cat.name.toLowerCase().replace(/\s+/g, "-")}/${sub
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                        className="block py-1 text-lg text-gray-600 hover:text-brand-primary"
                      >
                        {sub}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

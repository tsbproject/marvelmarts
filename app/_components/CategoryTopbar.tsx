

// app/components/CategoryTopbar.tsx
"use client";

import Link from "next/link";
import { categories } from "@/app/_data/CategoriesSidebar";

export default function CategoryTopbar() {
  return (
    <nav className="bg-white shadow-md border-t border-gray-200">
      <div className="flex items-center justify-center px-6 py-3">
        {/* Title */}
        <span className="mr-8 text-accent-navy text-xl font-bold uppercase tracking-wide">
          Categories
        </span>

        {/* Main categories horizontally */}
        <div className="flex items-center  space-x-8 flex-1 ">
          {categories.map(({ name, subcategories }) => (
            <div key={name} className="group relative">
              {/* Main category */}
              <Link
                href={`/categories/${name.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-brand-primary py-2 px-1/2 font-semibold hover:text-brand-primary transition-colors duration-200 text-[11px]  rounded-xl 
                           relative after:block after:h-0.5 after:bg-brand-primary after:scale-x-0 hover:after:scale-x-100
                           after:transition-transform after:duration-200 after:origin-left after:absolute after:bottom-1 after:left-0"
              >
                {name}
              </Link>

              {/* Dropdown on hover (desktop) */}
              {subcategories && subcategories.length > 0 && (
                <div
                  className="absolute left-0 top-full hidden group-hover:block bg-white shadow-xl rounded-md mt-3 z-50
                             opacity-0 group-hover:opacity-100 transform translate-y-3 group-hover:translate-y-0
                             transition-all duration-300 ease-out"
                >
                  <ul className="py-3 px-4 min-w-[220px]">
                    {subcategories.map((sub) => (
                      <li key={sub}>
                        <Link
                          href={`/categories/${name.toLowerCase().replace(/\s+/g, "-")}/${sub
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                          className="block py-2 px-2 text-sm text-gray-700 rounded hover:bg-gray-100 hover:text-brand-primary transition-colors duration-200"
                        >
                          {sub}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
}

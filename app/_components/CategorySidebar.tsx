// app/components/CategorySidebar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { categories } from "@/app/_data/CategoriesSidebar";

export default function CategorySidebar() {
  return (
    <div className="w-full md:w-86 z-20">
      {/* Header */}
      <div className="flex items-center justify-between bg-brand-primary text-white px-4 py-3 rounded-t-md shadow-md">
        <span className="font-semibold uppercase text-lg sm:text-xl">
          Browse Categories
        </span>
      </div>

      {/* Category List */}
      <div className="bg-white shadow-lg rounded-b-md overflow-visible">
        <ul className="divide-y divide-gray-200">
          {categories.map(({ name, icon: Icon, highlight, subcategories, banner }) => (
            <li
              key={name}
              className={`group relative px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${
                highlight ? "bg-orange-50 text-orange-600 font-semibold" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Icon className="w-6 h-6 text-gray-500" />
                  <Link
                    href={`/categories/${name.toLowerCase().replace(/\s+/g, "-")}`}
                    className="text-xl font-semibold text-gray-800"
                  >
                    {name}
                  </Link>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>

              {subcategories && subcategories.length > 0 && (
                <div className="absolute left-full top-0 hidden group-hover:flex bg-white shadow-2xl rounded-md ml-2 z-50 transition-all duration-300 ease-out w-[600px] p-6">
                  <div className="grid grid-cols-2 gap-6 flex-1">
                    {subcategories.map((sub) => (
                      <Link
                        key={sub}
                        href={`/categories/${name.toLowerCase().replace(/\s+/g, "-")}/${sub
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                        className="block text-sm text-gray-700 hover:text-brand-primary transition-colors"
                      >
                        {sub}
                      </Link>
                    ))}
                  </div>
                  {banner && (
                    <div className="w-64 h-40 relative overflow-hidden rounded-md">
                      <Image src={banner} alt={`${name} banner`} fill className="object-cover" />
                    </div>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

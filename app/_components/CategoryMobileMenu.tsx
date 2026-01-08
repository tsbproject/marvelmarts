



"use client";

import Link from "next/link";
import { useState } from "react";
import type { Category } from "@prisma/client";

// 🔹 Recursive type: a Category plus its children
export type CategoryTree = Category & { children: CategoryTree[] };

interface CategoryMobileMenuProps {
  categories: CategoryTree[];
}

export default function CategoryMobileMenu({ categories }: CategoryMobileMenuProps) {
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const toggleCategory = (name: string) => {
    setOpenCategory(openCategory === name ? null : name);
  };

  return (
    <nav className="p-4 bg-white shadow-md">
      <ul className="space-y-3">
        {categories.map((cat) => (
          <CategoryItem
            key={cat.id}
            category={cat}
            openCategory={openCategory}
            toggleCategory={toggleCategory}
          />
        ))}
      </ul>
    </nav>
  );
}

// 🔹 Recursive item renderer
function CategoryItem({
  category,
  openCategory,
  toggleCategory,
}: {
  category: CategoryTree;
  openCategory: string | null;
  toggleCategory: (name: string) => void;
}) {
  const isOpen = openCategory === category.name;

  return (
    <li>
      {/* Category button */}
      <button
        onClick={() => toggleCategory(category.name)}
        className="w-full flex justify-between items-center text-xl font-semibold text-accent-navy hover:text-brand-primary transition-colors"
      >
        {category.name}
        {category.children?.length > 0 && (
          <span className="ml-2 text-gray-500">{isOpen ? "−" : "+"}</span>
        )}
      </button>

      {/* Subcategories accordion */}
      {category.children?.length > 0 && (
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? "max-h-40 opacity-100 mt-2" : "max-h-0 opacity-0"
          }`}
        >
          <ul className="ml-4 space-y-1">
            {category.children.map((sub) => (
              <CategoryItem
                key={sub.id}
                category={sub}
                openCategory={openCategory}
                toggleCategory={toggleCategory}
              />
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}

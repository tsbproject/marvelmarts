"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import type { Category } from "@prisma/client";

//Recursive type: a Category plus its children
export type CategoryTree = Category & { children: CategoryTree[] };

interface CategoryMobileMenuProps {
  categories: CategoryTree[];
}

export default function CategoryMobileMenu({ categories }: CategoryMobileMenuProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const toggleCategory = (id: string) => {
    setOpenIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <nav className="p-4 bg-white shadow-md">
      <ul className="space-y-3">
        {categories.map((cat) => (
          <CategoryItem
            key={cat.id}
            category={cat}
            openIds={openIds}
            toggleCategory={toggleCategory}
          />
        ))}
      </ul>
    </nav>
  );
}

//  Recursive item renderer
function CategoryItem({
  category,
  openIds,
  toggleCategory,
}: {
  category: CategoryTree;
  openIds: Set<string>;
  toggleCategory: (id: string) => void;
}) {
  const isOpen = openIds.has(category.id);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, [category.children]);

  return (
    <li>
      {/* Category button */}
      <button
        onClick={() => toggleCategory(category.id)}
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
          ref={contentRef}
          style={{
            maxHeight: isOpen ? `${height}px` : "0px",
          }}
          className={`overflow-hidden transition-all duration-500 ease-in-out`}
        >
          <ul className="ml-4 mt-2 space-y-1">
            {category.children.map((sub) => (
              <CategoryItem
                key={sub.id}
                category={sub}
                openIds={openIds}
                toggleCategory={toggleCategory}
              />
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}

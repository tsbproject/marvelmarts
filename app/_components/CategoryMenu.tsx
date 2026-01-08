"use client";

import { useEffect, useState } from "react";
import CategoryTopbar from "./CategoryTopbar";
import CategoryMobileMenu from "./CategoryMobileMenu";
import type { Category } from "@prisma/client";
import { CategoryTreeArraySchema } from "./CategorySchema";

export type CategoryTree = Category & { children: CategoryTree[] };

export default function CategoryMenu() {
  const [isMobile, setIsMobile] = useState(false);
  const [categories, setCategories] = useState<CategoryTree[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 768);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/categories");
        const json = await res.json();

        // ✅ Validate with Zod
        const data = CategoryTreeArraySchema.parse(json);
        setCategories(data);
        setError(null); // clear any previous error
      } catch (err) {
        if (err instanceof Error) {
          console.error("Category validation failed:", err);
          setError("Failed to load categories. Please try again later.");
        }
      }
    }
    loadCategories();
  }, []);

  if (error) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded-md">
        {error}
      </div>
    );
  }

  return isMobile ? (
    <CategoryMobileMenu categories={categories} />
  ) : (
    <CategoryTopbar categories={categories} />
  );
}

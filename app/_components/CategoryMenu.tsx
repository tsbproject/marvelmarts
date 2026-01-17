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

      
        // Assuming your API returns { success: true, data: [...] } 
        // Or if it returns { success: true, categories: [...] }, use json.categories
        const rawData = json.data || json.categories || json;

        //Validate only the array part with Zod
        const validatedData = CategoryTreeArraySchema.parse(rawData);
        
        setCategories(validatedData);
        setError(null);
      } catch (err) {
        console.error("Category validation failed:", err);
        setError("Failed to load categories. Please try again later.");
      }
    }
    loadCategories();
  }, []);

  if (error) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 mt-4">
        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center">
          {error}
        </div>
      </div>
    );
  }

  return isMobile ? (
    <CategoryMobileMenu categories={categories} />
  ) : (
    <CategoryTopbar categories={categories} />
  );
}
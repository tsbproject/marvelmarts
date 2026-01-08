

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

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 768);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  useEffect(() => {
    async function loadCategories() {
      const res = await fetch("/api/categories");
      const json = await res.json();

      //Validate with Zod
      const data = CategoryTreeArraySchema.parse(json);

      setCategories(data);
    }
    loadCategories();
  }, []);

  return isMobile ? (
    <CategoryMobileMenu categories={categories} />
  ) : (
    <CategoryTopbar categories={categories} />
  );
}

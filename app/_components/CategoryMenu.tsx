// app/components/CategoryMenu.tsx
"use client";

import { useEffect, useState } from "react";
import CategorySidebar from "./CategorySidebar";
import CategoryMobileMenu from "./CategoryMobileMenu";

export default function CategoryMenu() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 768);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  // ✅ No need to fetch categories from API since we’re keeping categories.ts
  return isMobile ? <CategoryMobileMenu /> : <CategorySidebar />;
}

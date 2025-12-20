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

  return isMobile ? <CategoryMobileMenu /> : <CategorySidebar />;
}

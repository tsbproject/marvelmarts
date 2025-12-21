// // app/components/CategoryMenu.tsx
// "use client";

// import { useEffect, useState } from "react";
// import CategorySidebar from "./CategorySidebar";
// import CategoryMobileMenu from "./CategoryMobileMenu";

// export default function CategoryMenu() {
//   const [isMobile, setIsMobile] = useState(false);

//   useEffect(() => {
//     const checkScreen = () => setIsMobile(window.innerWidth < 768);
//     checkScreen();
//     window.addEventListener("resize", checkScreen);
//     return () => window.removeEventListener("resize", checkScreen);
//   }, []);

//   return isMobile ? <CategoryMobileMenu /> : <CategorySidebar />;
// }



// app/components/CategoryMenu.tsx
"use client";

import { useEffect, useState } from "react";
import CategorySidebar from "./CategorySidebar";
import CategoryMobileMenu from "./CategoryMobileMenu";

export default function CategoryMenu() {
  const [isMobile, setIsMobile] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 768);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/admins/categories?all=true");
        const data = await res.json();
        setCategories(data.categories);
      } catch (err) {
        console.error("Failed to load categories", err);
      } finally {
        setLoading(false);
      }
    }
    loadCategories();
  }, []);

  if (loading) return <p>Loading categories...</p>;

  return isMobile ? (
    <CategoryMobileMenu categories={categories} />
  ) : (
    <CategorySidebar categories={categories} />
  );
}


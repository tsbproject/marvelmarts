// // "use client";

// import { useEffect, useState } from "react";
// import CategoryTopbar from "./CategoryTopbar";
// import CategoryMobileMenu from "./CategoryMobileMenu";
// import type { Category } from "@prisma/client";

// /** * 🛡️ RECURSIVE TYPE DEFINITION
//  * Making 'children' optional (?) is the key to passing the build.
//  * This allows the nesting to stop at any level without throwing an error.
//  */
// export type CategoryTree = Category & { 
//   children?: CategoryTree[] 
// };

// interface CategoryMenuProps {
//   initialCategories: CategoryTree[];
// }

// export default function CategoryMenu({ 
//   initialCategories = [] 
// }: CategoryMenuProps) {
//   const [isMobile, setIsMobile] = useState(false);
  
//   // Initialize state with a fallback to an empty array
//   const [categories] = useState<CategoryTree[]>(initialCategories || []);

//   useEffect(() => {
//     // 1024px matches your Tailwind 'lg' breakpoint
//     const checkScreen = () => setIsMobile(window.innerWidth < 1024);
//     checkScreen();
//     window.addEventListener("resize", checkScreen);
//     return () => window.removeEventListener("resize", checkScreen);
//   }, []);

//   // If categories are empty (due to the DB connection error we saw earlier), 
//   // we return null to avoid rendering an empty bar.
//   if (categories.length === 0) {
//     if (process.env.NODE_ENV === 'development') {
//       console.warn("CategoryMenu: No categories received from server.");
//     }
//     return null; 
//   }

//   return isMobile ? (
//     <CategoryMobileMenu categories={categories} />
//   ) : (
//     <CategoryTopbar categories={categories} />
//   );
// }




"use client";

import { useEffect, useState } from "react";
import CategoryTopbar from "./CategoryTopbar";
import CategoryMobileMenu from "./CategoryMobileMenu";
import { CategoryWithChildren as CategoryTree } from "../layout";

export default function CategoryMenu({ initialCategories = [] }: { initialCategories: CategoryTree[] }) {
  // 1. Initialize with a guess, but handle hydration carefully
  const [isMobile, setIsMobile] = useState(false);
  const [categories] = useState<CategoryTree[]>(initialCategories);

  useEffect(() => {
    const checkScreen = () => {
      // Logic matching Tailwind's 'lg' (1024px)
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  // 2.If categories are empty, don't just 'return null'. 
  // Show a "Menu" button or a placeholder so the user isn't stuck.
  if (!categories || categories.length === 0) {
    return (
      <div className="p-4 bg-white text-brand-gray text-[10px] font-bold uppercase tracking-widest">
        Loading Categories...
      </div>
    );
  }

  return isMobile ? (
    <CategoryMobileMenu categories={categories} />
  ) : (
    <CategoryTopbar categories={categories} />
  );
}
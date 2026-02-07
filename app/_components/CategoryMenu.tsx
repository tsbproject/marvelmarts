// "use client";

// import { useEffect, useState } from "react";
// import CategoryTopbar from "./CategoryTopbar";
// import CategoryMobileMenu from "./CategoryMobileMenu";
// import { CategoryWithChildren as CategoryTree } from "../layout";

// export default function CategoryMenu({ initialCategories = [] }: { initialCategories: CategoryTree[] }) {
//   // 1. Initialize with a guess, but handle hydration carefully
//   const [isMobile, setIsMobile] = useState(false);
//   const [categories] = useState<CategoryTree[]>(initialCategories);

//   useEffect(() => {
//     const checkScreen = () => {
//       // Logic matching Tailwind's 'lg' (1024px)
//       setIsMobile(window.innerWidth < 1024);
//     };
    
//     checkScreen();
//     window.addEventListener("resize", checkScreen);
//     return () => window.removeEventListener("resize", checkScreen);
//   }, []);

//   // 2.If categories are empty, don't just 'return null'. 
//   // Show a "Menu" button or a placeholder so the user isn't stuck.
//   if (!categories || categories.length === 0) {
//     return (
//       <div className="p-4 bg-white text-brand-gray text-[10px] font-bold uppercase tracking-widest">
//         Loading Categories...
//       </div>
//     );
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

interface CategoryMenuProps {
  initialCategories: CategoryTree[];
  onClose?: () => void;
}

export default function CategoryMenu({
  initialCategories = [],
  onClose,
}: CategoryMenuProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [categories] = useState<CategoryTree[]>(initialCategories);

  useEffect(() => {
    const checkScreen = () => {
      // Matches Tailwind lg breakpoint (1024px)
      setIsMobile(window.innerWidth < 1024);
    };

    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  if (!categories || categories.length === 0) {
    return (
      <div className="p-4 bg-white text-brand-gray text-[10px] font-bold uppercase tracking-widest">
        Loading Categories...
      </div>
    );
  }

  return isMobile ? (
    <CategoryMobileMenu
      categories={categories}
      onClose={onClose}
    />
  ) : (
    <CategoryTopbar
      categories={categories}
      onClose={onClose}
    />
  );
}

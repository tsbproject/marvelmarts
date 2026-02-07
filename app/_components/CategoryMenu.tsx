// "use client";

// import { useEffect, useState } from "react";
// import CategoryTopbar from "./CategoryTopbar";
// import CategoryMobileMenu from "./CategoryMobileMenu";
// import { CategoryWithChildren as CategoryTree } from "../layout";

// interface CategoryMenuProps {
//   initialCategories: CategoryTree[];
//   onClose?: () => void;
// }

// export default function CategoryMenu({
//   initialCategories = [],
//   onClose,
// }: CategoryMenuProps) {
//   const [isMobile, setIsMobile] = useState(false);
//   const [categories] = useState<CategoryTree[]>(initialCategories);

//   useEffect(() => {
//     const checkScreen = () => {
//       // Matches Tailwind lg breakpoint (1024px)
//       setIsMobile(window.innerWidth < 1024);
//     };

//     checkScreen();
//     window.addEventListener("resize", checkScreen);
//     return () => window.removeEventListener("resize", checkScreen);
//   }, []);

//   if (!categories || categories.length === 0) {
//     return (
//       <div className="p-4 bg-white text-brand-gray text-[10px] font-bold uppercase tracking-widest">
//         Loading Categories...
//       </div>
//     );
//   }

//   return isMobile ? (
//     <CategoryMobileMenu
//       categories={categories}
//       onClose={onClose}
//     />
//   ) : (
//     <CategoryTopbar
//       categories={categories}
//       onClose={onClose}
//     />
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
  onClose 
}: CategoryMenuProps) {
  // 1. Initialize screen state
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

  // 2. Loading state to prevent empty UI
  if (!categories || categories.length === 0) {
    return (
      <div className="p-4 bg-white text-brand-gray text-[10px] font-bold uppercase tracking-widest animate-pulse">
        Loading Categories...
      </div>
    );
  }

  return isMobile ? (
    /* Mobile needs the onClose prop to shut the 
       Hamburger menu when a category is selected. 
    */
    <CategoryMobileMenu categories={categories} onClose={onClose} />
  ) : (
    /* Desktop Topbar (CategoryTopbar) does NOT use onClose 
       because it is a persistent horizontal bar, not a drawer.
       Removing onClose here fixes the build error.
    */
    <CategoryTopbar categories={categories} />
  );
}
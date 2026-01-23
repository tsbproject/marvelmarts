// // "use client";

// // import Link from "next/link";
// // import { useState, useRef, useEffect } from "react";
// // import type { Category } from "@prisma/client";


// // // Recursive type: a Category plus its children
// // export type CategoryTree = Category & { 
// //   children?: CategoryTree[] 
// // };

// // interface CategoryMobileMenuProps {
// //   categories: CategoryTree[];
// // }

// // export default function CategoryMobileMenu({ categories = [] }: CategoryMobileMenuProps) {
// //   const [openIds, setOpenIds] = useState<Set<string>>(new Set());

// //   const toggleCategory = (id: string) => {
// //     setOpenIds((prev) => {
// //       const newSet = new Set(prev);
// //       if (newSet.has(id)) {
// //         newSet.delete(id);
// //       } else {
// //         newSet.add(id);
// //       }
// //       return newSet;
// //     });
// //   };

// //   return (
// //     <nav className="p-4 bg-white shadow-md">
// //       <ul className="space-y-7">
// //         {categories.map((cat) => (
// //           <CategoryItem
// //             key={cat.id}
// //             category={cat}
// //             openIds={openIds}
// //             toggleCategory={toggleCategory}
// //             level={0} //top-level (main category)
// //           />
// //         ))}
// //       </ul>
// //     </nav>
// //   );
// // }

// // // Recursive item renderer
// // function CategoryItem({
// //   category,
// //   openIds,
// //   toggleCategory,
// //   level,
// // }: {
// //   category: CategoryTree;
// //   openIds: Set<string>;
// //   toggleCategory: (id: string) => void;
// //   level: number;
// // }) {
// //   const isOpen = openIds.has(category.id);
// //   const contentRef = useRef<HTMLDivElement>(null);
// //   const [height, setHeight] = useState(0);

// //   useEffect(() => {
// //     if (contentRef.current) {
// //       setHeight(contentRef.current.scrollHeight);
// //     }
// //   }, [category.children]);

// //   // Different classNames per level
// //   const buttonClass =
// //     level === 0
// //       ? "main-category w-full flex justify-between items-center text-xl font-bold text-accent-navy hover:text-brand-primary transition-colors"
// //       : level === 1
// //       ? "sub-category w-full flex justify-between items-center text-md font-semibold text-accent-teal hover:text-brand-primary transition-colors"
// //       : "child-category w-full flex justify-between items-center text-md font-medium text-brand-teal hover:text-brand-primary transition-colors";

// //   return (
// //     <li>
// //       {/* Category button */}
// //       <button onClick={() => toggleCategory(category.id)} className={buttonClass}>
// //         {category.name}
// //         {category.children?.length > 0 && (
// //           <span className="ml-2 text-gray-500">{isOpen ? "−" : "+"}</span>
// //         )}
// //       </button>

// //       {/* Subcategories accordion */}
// //       {category.children?.length > 0 && (
// //         <div
// //           ref={contentRef}
// //           style={{
// //             maxHeight: isOpen ? `${height}px` : "0px",
// //           }}
// //           className="overflow-hidden transition-all duration-500 ease-in-out"
// //         >
// //           <ul className="ml-4 mt-2 space-y-4">
// //             {category.children.map((sub) => (
// //               <CategoryItem
// //                 key={sub.id}
// //                 category={sub}
// //                 openIds={openIds}
// //                 toggleCategory={toggleCategory}
// //                 level={level + 1} //increment level for sub/child
// //               />
// //             ))}
// //           </ul>
// //         </div>
// //       )}
// //     </li>
// //   );
// // }




// "use client";

// import Link from "next/link";
// import { useState, useRef, useEffect } from "react";
// //Import the master type to ensure total synchronization with the server data
// import { CategoryWithChildren as CategoryTree } from "../layout";

// interface CategoryMobileMenuProps {
//   categories: CategoryTree[];
// }

// export default function CategoryMobileMenu({ categories = [] }: CategoryMobileMenuProps) {
//   const [openIds, setOpenIds] = useState<Set<string>>(new Set());

//   const toggleCategory = (id: string) => {
//     setOpenIds((prev) => {
//       const newSet = new Set(prev);
//       if (newSet.has(id)) {
//         newSet.delete(id);
//       } else {
//         newSet.add(id);
//       }
//       return newSet;
//     });
//   };

//   return (
//     <nav className="p-4 bg-white shadow-md">
//       <ul className="space-y-7">
//         {/*Using optional chaining to prevent mapping over undefined */}
//         {(categories ?? []).map((cat) => (
//           <CategoryItem
//             key={cat.id}
//             category={cat}
//             openIds={openIds}
//             toggleCategory={toggleCategory}
//             level={0} // top-level (main category)
//           />
//         ))}
//       </ul>
//     </nav>
//   );
// }

// // Recursive item renderer
// function CategoryItem({
//   category,
//   openIds,
//   toggleCategory,
//   level,
// }: {
//   category: CategoryTree;
//   openIds: Set<string>;
//   toggleCategory: (id: string) => void;
//   level: number;
// }) {
//   const isOpen = openIds.has(category.id);
//   const contentRef = useRef<HTMLDivElement>(null);
//   const [height, setHeight] = useState(0);

//   useEffect(() => {
//     if (contentRef.current) {
//       setHeight(contentRef.current.scrollHeight);
//     }
//   }, [category.children, isOpen]); // Added isOpen to re-calculate if needed

//   // Different classNames per level (Preserved exactly as requested)
//   const buttonClass =
//     level === 0
//       ? "main-category w-full flex justify-between items-center text-xl font-bold text-accent-navy hover:text-brand-primary transition-colors"
//       : level === 1
//       ? "sub-category w-full flex justify-between items-center text-md font-semibold text-accent-teal hover:text-brand-primary transition-colors"
//       : "child-category w-full flex justify-between items-center text-md font-medium text-brand-teal hover:text-brand-primary transition-colors";

//   // Safely check children length
//   const hasChildren = (category.children?.length ?? 0) > 0;

//   return (
//     <li>
//       {/* Category button */}
//       <button onClick={() => toggleCategory(category.id)} className={buttonClass}>
//         {category.name}
//         {hasChildren && (
//           <span className="ml-2 text-gray-500">{isOpen ? "−" : "+"}</span>
//         )}
//       </button>

//       {/* Subcategories accordion */}
//       {hasChildren && (
//         <div
//           ref={contentRef}
//           style={{
//             maxHeight: isOpen ? `${height}px` : "0px",
//           }}
//           className="overflow-hidden transition-all duration-500 ease-in-out"
//         >
//           <ul className="ml-4 mt-2 space-y-4">
//             {/* Safe recursion using optional chaining */}
//            {category.children?.map((sub) => (
//             <CategoryItem
//               key={sub.id}
//               category={sub as CategoryTree} // 👈 Add 'as CategoryTree' here
//               openIds={openIds}
//               toggleCategory={toggleCategory}
//               level={level + 1}
//             />

//             ))}
//           </ul>
//         </div>
//       )}
//     </li>
//   );
// }





"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, LayoutGrid } from "lucide-react";
import { CategoryWithChildren as CategoryTree } from "../layout";

interface CategoryMobileMenuProps {
  categories: CategoryTree[];
}

export default function CategoryMobileMenu({ categories = [] }: CategoryMobileMenuProps) {
  // We keep track of the navigation stack (History)
  const [history, setHistory] = useState<CategoryTree[][]>([categories]);
  const [activeCategoryName, setActiveCategoryName] = useState<string | null>(null);

  const currentLevelItems = history[history.length - 1];

  const handleDrillDown = (category: CategoryTree) => {
    if (category.children && category.children.length > 0) {
      setHistory((prev) => [...prev, category.children as CategoryTree[]]);
      setActiveCategoryName(category.name);
    }
  };

  const handleGoBack = () => {
    if (history.length > 1) {
      setHistory((prev) => prev.slice(0, -1));
      setActiveCategoryName(null); // Simple logic: clear name on back
    }
  };

  return (
    <div className="flex flex-col h-full bg-neutral-ghost overflow-hidden min-h-[400px]">
      {/* Dynamic Header */}
      <div className="flex items-center px-4 py-3 bg-neutral-white border-b border-gray-100 min-h-[56px]">
        {history.length > 1 ? (
          <button 
            onClick={handleGoBack}
            className="flex items-center gap-2 text-accent-navy font-bold"
          >
            <ChevronLeft className="w-5 h-5 text-brand-primary" />
            <span className="text-sm uppercase tracking-tight">Back to {history.length > 2 ? 'Previous' : 'All'}</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 text-accent-navy font-black italic">
            <LayoutGrid className="w-5 h-5 text-brand-primary" />
            <span className="text-sm uppercase">Shop Categories</span>
          </div>
        )}
      </div>

      {/* Slide Animation Container */}
      <div className="relative flex-1 overflow-x-hidden overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          <motion.ul
            key={history.length}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {currentLevelItems.map((cat) => {
              const hasChildren = (cat.children?.length ?? 0) > 0;
              
              return (
                <li key={cat.id}>
                  <button
                    onClick={() => handleDrillDown(cat)}
                    className={`
                      w-full flex items-center justify-between p-4 rounded-xl transition-all
                      bg-neutral-white shadow-sm border border-transparent
                      hover:border-brand-primary/20 hover:bg-brand-light/20
                      active:scale-[0.98]
                    `}
                  >
                    <div className="flex flex-col items-left text-left">
                      <span className={`font-bold text-accent-navy ${history.length === 1 ? 'text-lg' : 'text-md'}`}>
                        {cat.name}
                      </span>
                      {hasChildren && (
                        <span className="text-[10px] text-neutral-gray font-bold uppercase">
                          {cat.children?.length} Sub-Categories
                        </span>
                      )}
                    </div>

                    {hasChildren ? (
                      <div className="p-2 bg-neutral-light rounded-full">
                        <ChevronRight className="w-4 h-4 text-brand-primary" />
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-brand-primary px-2 py-1 bg-brand-light rounded-md uppercase">
                        View
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        </AnimatePresence>
      </div>

      {/* Footer Hint */}
      {history.length === 1 && (
        <div className="p-6 text-center">
          <p className="text-xs text-neutral-gray font-medium">
            Explore our massive collection of premium armory.
          </p>
        </div>
      )}
    </div>
  );
}
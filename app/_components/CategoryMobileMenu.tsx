// "use client";

// import { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { ChevronLeft, ChevronRight, LayoutGrid } from "lucide-react";
// import { CategoryWithChildren as CategoryTree } from "../layout";

// interface CategoryMobileMenuProps {
//   categories: CategoryTree[];
// }

// export default function CategoryMobileMenu({ categories = [] }: CategoryMobileMenuProps) {
//   // We keep track of the navigation stack (History)
//   const [history, setHistory] = useState<CategoryTree[][]>([categories]);
//   const [activeCategoryName, setActiveCategoryName] = useState<string | null>(null);

//   const currentLevelItems = history[history.length - 1];

//   const handleDrillDown = (category: CategoryTree) => {
//     if (category.children && category.children.length > 0) {
//       setHistory((prev) => [...prev, category.children as CategoryTree[]]);
//       setActiveCategoryName(category.name);
//     }
//   };

//   const handleGoBack = () => {
//     if (history.length > 1) {
//       setHistory((prev) => prev.slice(0, -1));
//       setActiveCategoryName(null); 
//     }
//   };

//   return (
//     <div className="flex flex-col h-full bg-neutral-ghost overflow-hidden min-h-[400px]">
//       {/* Dynamic Header */}
//       <div className="flex items-center px-4 py-3 bg-neutral-white border-b border-gray-100 min-h-[56px]">
//         {history.length > 1 ? (
//           <button 
//             onClick={handleGoBack}
//             className="flex items-center gap-2 text-accent-navy font-bold"
//           >
//             <ChevronLeft className="w-5 h-5 text-brand-primary" />
//             <span className="text-sm uppercase tracking-tight">Back to {history.length > 2 ? 'Previous' : 'All'}</span>
//           </button>
//         ) : (
//           <div className="flex items-center gap-2 text-accent-navy font-black italic">
//             <LayoutGrid className="w-5 h-5 text-brand-primary" />
//             <span className="text-sm uppercase">Shop Categories</span>
//           </div>
//         )}
//       </div>

//       {/* Slide Animation Container */}
//       <div className="relative flex-1 overflow-x-hidden overflow-y-auto p-4">
//         <AnimatePresence mode="wait">
//           <motion.ul
//             key={history.length}
//             initial={{ x: 20, opacity: 0 }}
//             animate={{ x: 0, opacity: 1 }}
//             exit={{ x: -20, opacity: 0 }}
//             transition={{ duration: 0.2 }}
//             className="space-y-3"
//           >
//             {currentLevelItems.map((cat) => {
//               const hasChildren = (cat.children?.length ?? 0) > 0;
              
//               return (
//                 <li key={cat.id}>
//                   <button
//                     onClick={() => handleDrillDown(cat)}
//                     className={`
//                       w-full flex items-center justify-between p-4 rounded-xl transition-all
//                       bg-neutral-white shadow-sm border border-transparent
//                       hover:border-brand-primary/20 hover:bg-brand-light/20
//                       active:scale-[0.98]
//                     `}
//                   >
//                     <div className="flex flex-col items-left text-left">
//                       <span className={`font-bold text-accent-navy ${history.length === 1 ? 'text-lg' : 'text-md'}`}>
//                         {cat.name}
//                       </span>
//                       {hasChildren && (
//                         <span className="text-[10px] text-neutral-gray font-bold uppercase">
//                           {cat.children?.length} Sub-Categories
//                         </span>
//                       )}
//                     </div>

//                     {hasChildren ? (
//                       <div className="p-2 bg-neutral-light rounded-full">
//                         <ChevronRight className="w-4 h-4 text-brand-primary" />
//                       </div>
//                     ) : (
//                       <span className="text-xs font-bold text-brand-primary px-2 py-1 bg-brand-light rounded-md uppercase">
//                         View
//                       </span>
//                     )}
//                   </button>
//                 </li>
//               );
//             })}
//           </motion.ul>
//         </AnimatePresence>
//       </div>

//       {/* Footer Hint */}
//       {history.length === 1 && (
//         <div className="p-6 text-center">
//           <p className="text-xs text-neutral-gray font-medium">
//             Explore our massive collection of premium armory.
//           </p>
//         </div>
//       )}
//     </div>
//   );
// }



// "use client";

// import { useState } from "react";
// import Link from "next/link";
// import { motion, AnimatePresence } from "framer-motion";
// import { ChevronLeft, ChevronRight, LayoutGrid } from "lucide-react";
// import { CategoryWithChildren as CategoryTree } from "../layout";

// interface CategoryMobileMenuProps {
//   categories: CategoryTree[];
// }

// export default function CategoryMobileMenu({ categories = [] }: CategoryMobileMenuProps) {
//   const [history, setHistory] = useState<CategoryTree[][]>([categories]);
//   const [activeCategoryName, setActiveCategoryName] = useState<string | null>(null);

//   const currentLevelItems = history[history.length - 1];

//   const handleDrillDown = (category: CategoryTree) => {
//     if (category.children && category.children.length > 0) {
//       setHistory((prev) => [...prev, category.children as CategoryTree[]]);
//       setActiveCategoryName(category.name);
//     }
//   };

//   const handleGoBack = () => {
//     if (history.length > 1) {
//       setHistory((prev) => prev.slice(0, -1));
//       setActiveCategoryName(null);
//     }
//   };

//   return (
//     <div className="flex flex-col h-full bg-neutral-ghost overflow-hidden min-h-[400px]">
//       {/* Dynamic Header */}
//       <div className="flex items-center px-4 py-3 bg-neutral-white border-b border-gray-100 min-h-[56px]">
//         {history.length > 1 ? (
//           <button
//             onClick={handleGoBack}
//             className="flex items-center gap-2 text-accent-navy font-bold"
//           >
//             <ChevronLeft className="w-5 h-5 text-brand-primary" />
//             <span className="text-sm uppercase tracking-tight">
//               Back to {history.length > 2 ? "Previous" : "All"}
//             </span>
//           </button>
//         ) : (
//           <div className="flex items-center gap-2 text-accent-navy font-black italic">
//             <LayoutGrid className="w-5 h-5 text-brand-primary" />
//             <span className="text-sm uppercase">Shop Categories</span>
//           </div>
//         )}
//       </div>

//       {/* Slide Animation Container */}
//       <div className="relative flex-1 overflow-x-hidden overflow-y-auto p-4">
//         <AnimatePresence mode="wait">
//           <motion.ul
//             key={history.length}
//             initial={{ x: 20, opacity: 0 }}
//             animate={{ x: 0, opacity: 1 }}
//             exit={{ x: -20, opacity: 0 }}
//             transition={{ duration: 0.2 }}
//             className="space-y-3"
//           >
//             {currentLevelItems.map((cat) => {
//               const hasChildren = (cat.children?.length ?? 0) > 0;

//               return (
//                 <li key={cat.id}>
//                   {hasChildren ? (
//                     <button
//                       onClick={() => handleDrillDown(cat)}
//                       className={`
//                         w-full flex items-center justify-between p-4 rounded-xl transition-all
//                         bg-neutral-white shadow-sm border border-transparent
//                         hover:border-brand-primary/20 hover:bg-brand-light/20
//                         active:scale-[0.98]
//                       `}
//                     >
//                       <div className="flex flex-col items-left text-left">
//                         <span
//                           className={`font-bold text-accent-navy ${
//                             history.length === 1 ? "text-lg" : "text-md"
//                           }`}
//                         >
//                           {cat.name}
//                         </span>
//                         <span className="text-[10px] text-neutral-gray font-bold uppercase">
//                           {cat.children?.length} Sub-Categories
//                         </span>
//                       </div>
//                       <div className="p-2 bg-neutral-light rounded-full">
//                         <ChevronRight className="w-4 h-4 text-brand-primary" />
//                       </div>
//                     </button>
//                   ) : (
//                     <Link
//                       href={`/categories/${cat.slug}`}
//                       className={`
//                         w-full flex items-center justify-between p-4 rounded-xl transition-all
//                         bg-neutral-white shadow-sm border border-transparent
//                         hover:border-brand-primary/20 hover:bg-brand-light/20
//                         active:scale-[0.98]
//                       `}
//                     >
//                       <div className="flex flex-col items-left text-left">
//                         <span
//                           className={`font-bold text-accent-navy ${
//                             history.length === 1 ? "text-lg" : "text-md"
//                           }`}
//                         >
//                           {cat.name}
//                         </span>
//                       </div>
//                       <span className="text-xs font-bold text-brand-primary px-2 py-1 bg-brand-light rounded-md uppercase">
//                         View
//                       </span>
//                     </Link>
//                   )}
//                 </li>
//               );
//             })}
//           </motion.ul>
//         </AnimatePresence>
//       </div>

//       {/* Footer Hint */}
//       {history.length === 1 && (
//         <div className="p-6 text-center">
//           <p className="text-xs text-neutral-gray font-medium">
//             Explore our massive collection of premium armory.
//           </p>
//         </div>
//       )}
//     </div>
//   );
// }





"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, LayoutGrid, ArrowRight } from "lucide-react";
import { CategoryWithChildren as CategoryTree } from "../layout";
import Link from "next/link";

interface CategoryMobileMenuProps {
  categories: CategoryTree[];
  onClose?: () => void; // This is the crucial prop from HamburgerMenu
}

export default function CategoryMobileMenu({ 
  categories = [], 
  onClose 
}: CategoryMobileMenuProps) {
  const [history, setHistory] = useState<CategoryTree[][]>([categories]);
  const [activeCategoryName, setActiveCategoryName] = useState<string | null>(null);

  const currentLevelItems = history[history.length - 1];

  const handleDrillDown = (category: CategoryTree) => {
    if (category.children && category.children.length > 0) {
      setHistory((prev) => [...prev, category.children as CategoryTree[]]);
      setActiveCategoryName(category.name);
    } else {
      // If it has no children, it should behave like a link and close the menu
      // but usually, we render a Link component for these (see below)
    }
  };

  const handleGoBack = () => {
    if (history.length > 1) {
      setHistory((prev) => prev.slice(0, -1));
      setActiveCategoryName(null); 
    }
  };

  return (
    <div className="flex flex-col h-full bg-neutral-ghost overflow-hidden min-h-[400px]">
      {/* Header */}
      <div className="flex items-center px-4 py-3 bg-neutral-white border-b border-gray-100 min-h-[56px]">
        {history.length > 1 ? (
          <button 
            onClick={handleGoBack}
            className="flex items-center gap-2 text-accent-navy font-bold"
          >
            <ChevronLeft className="w-5 h-5 text-brand-primary" />
            <span className="text-sm uppercase tracking-tight">Back</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 text-accent-navy font-black italic">
            <LayoutGrid className="w-5 h-5 text-brand-primary" />
            <span className="text-sm uppercase">Shop Categories</span>
          </div>
        )}
      </div>

      <div className="relative flex-1 overflow-x-hidden overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          <motion.ul
            key={history.length}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            className="space-y-3"
          >
            {/* 1. VIEW ALL LINK (Closing Logic Included) */}
            {activeCategoryName && (
               <li key="view-all">
                  <Link
                    href={`/shop?category=${activeCategoryName.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={onClose} // THIS CLOSES THE HAMBURGER
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-accent-navy text-white shadow-lg transition-all"
                  >
                    <span className="font-bold text-sm uppercase">View All {activeCategoryName}</span>
                    <ArrowRight className="w-4 h-4 text-brand-primary" />
                  </Link>
               </li>
            )}

            {currentLevelItems.map((cat) => {
              const hasChildren = (cat.children?.length ?? 0) > 0;
              const categoryPath = `/shop?category=${cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-')}`;
              
              return (
                <li key={cat.id}>
                  {hasChildren ? (
                    /* DRILL DOWN BUTTON (Does NOT close menu, just goes deeper) */
                    <button
                      onClick={() => handleDrillDown(cat)}
                      className="w-full flex items-center justify-between p-4 rounded-xl bg-neutral-white shadow-sm border border-transparent hover:border-brand-primary/20"
                    >
                      <div className="flex flex-col text-left">
                        <span className="font-bold text-accent-navy">{cat.name}</span>
                        <span className="text-[10px] text-neutral-gray uppercase">{cat.children?.length} Sub-Categories</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-brand-primary" />
                    </button>
                  ) : (
                    /* 2. FINAL CATEGORY LINK (Closing Logic Included) */
                    <Link
                      href={categoryPath}
                      onClick={onClose} // THIS CLOSES THE HAMBURGER
                      className="w-full flex items-center justify-between p-4 rounded-xl bg-neutral-white shadow-sm border border-transparent hover:border-brand-primary/20"
                    >
                      <span className="font-bold text-accent-navy">{cat.name}</span>
                      <span className="text-xs font-bold text-brand-primary px-2 py-1 bg-brand-light rounded-md uppercase">View</span>
                    </Link>
                  )}
                </li>
              );
            })}
          </motion.ul>
        </AnimatePresence>
      </div>
    </div>
  );
}

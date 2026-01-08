// "use client";

// import Link from "next/link";
// import { motion, AnimatePresence } from "framer-motion";
// import { useState, useEffect } from "react";
// import type { Category } from "@prisma/client";

// // Recursive type: Category plus children
// export type CategoryTree = Category & { children: CategoryTree[] };

// export default function CategoryTopbar() {
//   const [hovered, setHovered] = useState<string | null>(null);
//   const [categories, setCategories] = useState<CategoryTree[]>([]);

//   useEffect(() => {
//     async function loadCategories() {
//       const res = await fetch("/api/categories");
//       const data: CategoryTree[] = await res.json();
//       // Only keep top-level categories
//       const topLevel = data.filter((cat) => cat.parentId === null);
//       setCategories(topLevel);
//     }
//     loadCategories();
//   }, []);

//   // Framer Motion variants
//   const listVariants = {
//     hidden: { opacity: 0, y: 10 },
//     visible: {
//       opacity: 1,
//       y: 0,
//       transition: { staggerChildren: 0.08 },
//     },
//     exit: { opacity: 0, y: 10, transition: { duration: 0.2 } },
//   };

//   const itemVariants = {
//     hidden: { opacity: 0, y: 8 },
//     visible: {
//       opacity: 1,
//       y: 0,
//       transition: { duration: 0.25, ease: "easeOut" as const },
//     },
//   };

//   return (
//     <nav className="bg-accent-navy shadow-md border-t border-gray-200">
//       <div className="flex items-center justify-center px-6 py-3">
//         {/* Title */}
//         <span className="mr-8 text-gray-50 text-xl font-bold uppercase tracking-wide">
//           Categories
//         </span>

//         {/* Main categories horizontally */}
//         <div className="flex items-center space-x-6 flex-1">
//           {categories.map((cat) => (
//             <div
//               key={cat.id}
//               className="relative"
//               onMouseEnter={() => setHovered(cat.name)}
//               onMouseLeave={() => setHovered(null)}
//             >
//               {/* Main category */}
//               <Link
//                 href={`/categories/${cat.slug}`}
//                 className="text-brand-primary py-2 font-medium hover:text-brand-primary transition-colors duration-200 text-lg rounded-xl 
//                            relative after:block after:h-0.5 after:bg-brand-primary after:scale-x-0 hover:after:scale-x-100
//                            after:transition-transform after:duration-200 after:origin-left after:absolute after:bottom-1 after:left-0"
//               >
//                 {cat.name}
//               </Link>

//               {/* Mega menu dropdown */}
//               <AnimatePresence>
//                 {cat.children?.length > 0 && hovered === cat.name && (
//                   <motion.div
//                     initial="hidden"
//                     animate="visible"
//                     exit="exit"
//                     variants={listVariants}
//                     className="absolute left-0 top-full bg-white shadow-xl rounded-md mt-3 z-50 w-[900px] p-6"
//                   >
//                     {/* Flex row instead of vertical list */}
//                     <motion.ul className="flex flex-wrap gap-8">
//                       {cat.children.map((sub) => (
//                         <motion.li
//                           key={sub.id}
//                           variants={itemVariants}
//                           className="w-1/4 flex flex-col items-start"
//                         >
//                           {/* Category image */}
//                           {sub.imageUrl && (
//                             <img
//                               src={sub.imageUrl}
//                               alt={sub.name}
//                               className="w-20 h-20 object-cover rounded-md mb-3 border border-gray-200"
//                             />
//                           )}

//                           {/* Child category name */}
//                           <Link
//                             href={`/categories/${sub.slug}`}
//                             className="block font-semibold text-gray-800 mb-2 hover:text-brand-primary"
//                           >
//                             {sub.name}
//                           </Link>

//                           {/* Grandchildren */}
//                           {sub.children?.length > 0 && (
//                             <ul className="space-y-1">
//                               {sub.children.map((child) => (
//                                 <li key={child.id}>
//                                   <Link
//                                     href={`/categories/${child.slug}`}
//                                     className="block text-sm text-gray-600 hover:text-brand-primary"
//                                   >
//                                     {child.name}
//                                   </Link>
//                                 </li>
//                               ))}
//                             </ul>
//                           )}
//                         </motion.li>
//                       ))}
//                     </motion.ul>
//                   </motion.div>
//                 )}
//               </AnimatePresence>
//             </div>
//           ))}
//         </div>
//       </div>
//     </nav>
//   );
// }



"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import type { Category } from "@prisma/client";

// 🔹 Recursive type: Category plus children
export type CategoryTree = Category & { children: CategoryTree[] };

export default function CategoryTopbar() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryTree[]>([]);

  useEffect(() => {
    async function loadCategories() {
      const res = await fetch("/api/categories");
      const data: CategoryTree[] = await res.json();
      // Only keep top-level categories
      const topLevel = data.filter((cat) => cat.parentId === null);
      setCategories(topLevel);
    }
    loadCategories();
  }, []);

  // Framer Motion variants
  const listVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.08 },
    },
    exit: { opacity: 0, y: 10, transition: { duration: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.25, ease: "easeOut" as const },
    },
  };

  return (
    <nav className="bg-accent-navy shadow-md border-t border-gray-200">
      <div className="flex items-center justify-center px-6 py-3">
        {/* Title */}
        <span className="mr-8 text-gray-50 text-xl font-bold uppercase tracking-wide">
          Categories
        </span>

        {/* Main categories horizontally */}
        <div className="flex items-center space-x-6 flex-1">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="relative"
              onMouseEnter={() => setHovered(cat.name)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Main category */}
              <Link
                href={`/categories/${cat.slug}`}
                className="text-brand-primary py-2 font-medium hover:text-brand-primary transition-colors duration-200 text-lg rounded-xl 
                           relative after:block after:h-0.5 after:bg-brand-primary after:scale-x-0 hover:after:scale-x-100
                           after:transition-transform after:duration-200 after:origin-left after:absolute after:bottom-1 after:left-0"
              >
                {cat.name}
              </Link>

              {/* Mega menu dropdown */}
              <AnimatePresence>
                {cat.children?.length > 0 && hovered === cat.name && (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={listVariants}
                    className="absolute left-0 top-full bg-white shadow-xl rounded-md mt-3 z-50 w-[900px] p-6"
                  >
                    {/* Flex row instead of vertical list */}
                    <motion.ul className="flex flex-wrap gap-8">
                      {cat.children.map((sub) => (
                        <motion.li
                          key={sub.id}
                          variants={itemVariants}
                          className="w-1/4 flex flex-col items-start"
                        >
                          {/* Category image */}
                          {sub.imageUrl && (
                            <img
                              src={sub.imageUrl}
                              alt={sub.name}
                              className="w-20 h-20 object-cover rounded-md mb-3 border border-gray-200"
                            />
                          )}

                          {/* Breadcrumb trail */}
                          <div className="text-xs text-gray-500 mb-1">
                            {cat.name} &gt; {sub.name}
                          </div>

                          {/* Child category name */}
                          <Link
                            href={`/categories/${sub.slug}`}
                            className="block font-semibold text-gray-800 mb-2 hover:text-brand-primary"
                          >
                            {sub.name}
                          </Link>

                          {/* Grandchildren */}
                          {sub.children?.length > 0 && (
                            <ul className="space-y-1">
                              {sub.children.map((child) => (
                                <li key={child.id}>
                                  <Link
                                    href={`/categories/${child.slug}`}
                                    className="block text-sm text-gray-600 hover:text-brand-primary"
                                  >
                                    {child.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </motion.li>
                      ))}
                    </motion.ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
}

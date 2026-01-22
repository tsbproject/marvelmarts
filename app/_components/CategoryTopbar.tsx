// "use client";

// import Link from "next/link";
// import { motion, AnimatePresence, Variants } from "framer-motion";
// import { useState } from "react";
// import type { Category } from "@prisma/client";
// import { ChevronDown, LayoutGrid, ArrowRight, Sparkles } from "lucide-react";

// export type CategoryTree = Category & { children: CategoryTree[] };

// interface CategoryTopbarProps {
//   categories: CategoryTree[];
// }

// export default function CategoryTopbar({ categories }: CategoryTopbarProps) {
//   const [hovered, setHovered] = useState<string | null>(null);

//   const megaMenuVariants: Variants = {
//     hidden: { opacity: 0, y: 0, scale: 0.98, filter: "blur(4px)" },
//     visible: { 
//       opacity: 1, 
//       y: 0, 
//       scale: 1, 
//       filter: "blur(0px)",
//       transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } 
//     },
//     exit: { opacity: 0, y: -10, scale: 0.99, transition: { duration: 0.2 } },
//   };

//   const getMenuTheme = (slug: string) => {
//     const themes: Record<string, string> = {
//       // increased widths and column counts to prevent squishing
//       electronics: "w-[900px] grid-cols-3 border-t-4 border-blue-500",
//       fashion: "w-[95vw] max-w-[1200px] grid-cols-4 border-t-4 border-pink-500",
//     };
//     return themes[slug] || "w-[700px] grid-cols-2 border-t-4 border-brand-primary";
//   };

//   return (
//     <nav className="relative bg-brand-primary border-b border-white/5 shadow-2xl h-14 overflow-x-auto no-scrollbar z-999">
//       <div className="max-w-[1400px] mx-auto w-full h-full flex items-center px-4">
        
//         {/* Explore Button */}
//         <button className="inline-flex items-center gap-2 px-4 py-2 mr-4 bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/10 shrink-0">
//           <LayoutGrid size={14} className="text-blue-400" />
//           <span className="text-[10px] font-black uppercase tracking-widest text-white">Explore Categories</span>
//         </button>

//         {/* Categories Container */}
//         <div className="flex items-center flex-1 justify-center">
//           <div className="flex flex-nowrap items-center gap-1">
//             {categories.map((cat) => (
//               <div
//                 key={cat.id}
//                 className="group"
//                 onMouseEnter={() => setHovered(cat.name)}
//                 onMouseLeave={() => setHovered(null)}
//               >
//                 <Link
//                   href={`/categories/${cat.slug}`}
//                   className={`
//                     inline-flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 
//                     text-[10px] xl:text-[11px] font-bold uppercase tracking-widest whitespace-nowrap
//                     ${hovered === cat.name ? "text-white bg-white/10" : "text-white/50 hover:text-white"}
//                   `}
//                 >
//                   {cat.name}
//                   {cat.children?.length > 0 && (
//                     <ChevronDown size={11} className={`transition-transform duration-300 ${hovered === cat.name ? "rotate-180 text-blue-400" : "opacity-30"}`} />
//                   )}
//                 </Link>

//                 <AnimatePresence>
//                   {cat.children?.length > 0 && hovered === cat.name && (
//                     <motion.div
//                       initial="hidden"
//                       animate="visible"
//                       exit="exit"
//                       variants={megaMenuVariants}
//                       className={`
//                         fixed top-45 left-1/2 -translate-x-1/2 
//                         bg-white shadow-[0_40px_80px_-15px_rgba(0,0,0,0.5)] 
//                         rounded-b-[30px] z-9999 flex flex-col
//                         max-h-[85vh] 
//                         ${getMenuTheme(cat.slug)}
//                       `}
//                     >
//                       {/* Scrollable Content Wrapper */}
//                       <div className="overflow-y-auto p-10 grid gap-12 custom-scrollbar grid-cols-inherit">
//                         {cat.children.map((sub) => (
//                           <div key={sub.id} className="space-y-4">
//                             <Link
//                               href={`/categories/${sub.slug}`}
//                               className="inline-flex items-center gap-2 text-[12px] font-black text-gray-900 uppercase tracking-tight hover:text-blue-600"
//                             >
//                               <Sparkles size={14} className="text-blue-500" />
//                               {sub.name}
//                             </Link>
                            
//                             <ul className="space-y-2.5 border-l border-gray-100 pl-4">
//                               {sub.children?.map((child) => (
//                                 <li key={child.id}>
//                                   <Link
//                                     href={`/categories/${child.slug}`}
//                                     className="text-[13px] text-gray-500 hover:text-blue-600 transition-colors block"
//                                   >
//                                     {child.name}
//                                   </Link>
//                                 </li>
//                               ))}
//                             </ul>
//                           </div>
//                         ))}
//                       </div>

//                       {/* Sticky Footer (stays visible at the bottom of the menu) */}
//                       <div className="mt-auto px-10 py-6 border-t border-gray-50 flex justify-between items-center bg-gray-50/50 rounded-b-[30px]">
//                         <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Premium Collection</span>
//                         <Link href={`/categories/${cat.slug}`} className="inline-flex items-center gap-2 text-blue-600 text-[10px] font-black uppercase hover:underline">
//                           Browse All {cat.name} <ArrowRight size={12} />
//                         </Link>
//                       </div>
//                     </motion.div>
//                   )}
//                 </AnimatePresence>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Right Section */}
//         <div className="shrink-0 ml-4 hidden md:block">
//            <div className="bg-blue-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
//               {new Date().getFullYear()} Trends
//             </div>
//         </div>
//       </div>
//     </nav>
//   );
// }




"use client";

import Link from "next/link";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useState } from "react";
import type { Category } from "@prisma/client";
import { ChevronDown, LayoutGrid, ArrowRight, Sparkles } from "lucide-react";

// Recursive type to match your server-side data structure
export type CategoryTree = Category & { children: CategoryTree[] };

interface CategoryTopbarProps {
  categories?: CategoryTree[]; // Made optional for extra safety
}

export default function CategoryTopbar({ categories = [] }: CategoryTopbarProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  const megaMenuVariants: Variants = {
    hidden: { opacity: 0, y: 0, scale: 0.98, filter: "blur(4px)" },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1, 
      filter: "blur(0px)",
      transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } 
    },
    exit: { opacity: 0, y: -10, scale: 0.99, transition: { duration: 0.2 } },
  };

  const getMenuTheme = (slug: string) => {
    const themes: Record<string, string> = {
      electronics: "w-[900px] grid-cols-3 border-t-4 border-blue-500",
      fashion: "w-[95vw] max-w-[1200px] grid-cols-4 border-t-4 border-pink-500",
    };
    return themes[slug] || "w-[700px] grid-cols-2 border-t-4 border-brand-primary";
  };

  return (
    <nav className="relative bg-brand-primary border-b border-white/5 shadow-2xl h-14 overflow-x-auto no-scrollbar z-999">
      <div className="max-w-[1400px] mx-auto w-full h-full flex items-center px-4">
        
        {/* Explore Button */}
        <button className="inline-flex items-center gap-2 px-4 py-2 mr-4 bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/10 shrink-0">
          <LayoutGrid size={14} className="text-blue-400" />
          <span className="text-[10px] font-black uppercase tracking-widest text-white">Explore Categories</span>
        </button>

        {/* Categories Container */}
        <div className="flex items-center flex-1 justify-center">
          <div className="flex flex-nowrap items-center gap-1">
            {/* 🛡️ Null-safe check using optional chaining and fallback */}
            {(categories ?? []).map((cat) => (
              <div
                key={cat.id}
                className="group"
                onMouseEnter={() => setHovered(cat.name)}
                onMouseLeave={() => setHovered(null)}
              >
                <Link
                  href={`/categories/${cat.slug}`}
                  className={`
                    inline-flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 
                    text-[10px] xl:text-[11px] font-bold uppercase tracking-widest whitespace-nowrap
                    ${hovered === cat.name ? "text-white bg-white/10" : "text-white/50 hover:text-white"}
                  `}
                >
                  {cat.name}
                  {(cat.children?.length ?? 0) > 0 && (
                    <ChevronDown size={11} className={`transition-transform duration-300 ${hovered === cat.name ? "rotate-180 text-blue-400" : "opacity-30"}`} />
                  )}
                </Link>

                <AnimatePresence>
                  {(cat.children?.length ?? 0) > 0 && hovered === cat.name && (
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={megaMenuVariants}
                      className={`
                        fixed top-45 left-1/2 -translate-x-1/2 
                        bg-white shadow-[0_40px_80px_-15px_rgba(0,0,0,0.5)] 
                        rounded-b-[30px] z-9999 flex flex-col
                        max-h-[85vh] 
                        ${getMenuTheme(cat.slug)}
                      `}
                    >
                      {/* Scrollable Content Wrapper */}
                      <div className="overflow-y-auto p-10 grid gap-12 custom-scrollbar grid-cols-inherit">
                        {cat.children?.map((sub) => (
                          <div key={sub.id} className="space-y-4">
                            <Link
                              href={`/categories/${sub.slug}`}
                              className="inline-flex items-center gap-2 text-[12px] font-black text-gray-900 uppercase tracking-tight hover:text-blue-600"
                            >
                              <Sparkles size={14} className="text-blue-500" />
                              {sub.name}
                            </Link>
                            
                            <ul className="space-y-2.5 border-l border-gray-100 pl-4">
                              {sub.children?.map((child) => (
                                <li key={child.id}>
                                  <Link
                                    href={`/categories/${child.slug}`}
                                    className="text-[13px] text-gray-500 hover:text-blue-600 transition-colors block"
                                  >
                                    {child.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>

                      {/* Sticky Footer */}
                      <div className="mt-auto px-10 py-6 border-t border-gray-50 flex justify-between items-center bg-gray-50/50 rounded-b-[30px]">
                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Premium Collection</span>
                        <Link href={`/categories/${cat.slug}`} className="inline-flex items-center gap-2 text-blue-600 text-[10px] font-black uppercase hover:underline">
                          Browse All {cat.name} <ArrowRight size={12} />
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* Right Section */}
        <div className="shrink-0 ml-4 hidden md:block">
            <div className="bg-blue-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
              {new Date().getFullYear()} Trends
            </div>
        </div>
      </div>
    </nav>
  );
}
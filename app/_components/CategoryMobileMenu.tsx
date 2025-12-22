


// // app/components/CategorySidebar.tsx
// "use client";

// import Link from "next/link";
// import Image from "next/image";
// import { ChevronRight } from "lucide-react";
// import { categories } from "@/app/_data/CategoriesSidebar";

// export default function CategorySidebar() {
//   return (
//     <div className="w-full md:w-86 z-20">
//       {/* Header */}
//       <div className="flex items-center justify-between bg-brand-primary text-white px-4 py-3 rounded-t-md shadow-md">
//         <div className="flex items-center space-x-7">
//           <span className="font-semibold uppercase text-lg sm:text-xl">
//             Browse Categories
//           </span>
//         </div>
//       </div>

//       {/* Category List */}
//       <div className="bg-white shadow-lg rounded-b-md overflow-visible">
//         <ul className="divide-y divide-gray-200">
//           {categories.map(({ name, icon: Icon, highlight, subcategories, banner }) => (
//             <li
//               key={name}
//               className={`group relative px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${
//                 highlight ? "bg-orange-50 text-orange-600 font-semibold" : ""
//               }`}
//             >
//               {/* Top-level category */}
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center space-x-3">
//                   <Icon className="w-6 h-6 text-gray-500" />
//                   <Link
//                     href={`/categories/${name.toLowerCase().replace(/\s+/g, "-")}`}
//                     className="text-xl font-semibold text-gray-800"
//                   >
//                     {name}
//                   </Link>
//                 </div>
//                 <ChevronRight className="w-5 h-5 text-gray-400" />
//               </div>

//               {/* Mega menu dropdown */}
//               {subcategories && subcategories.length > 0 && (
//                 <div
//                   className="absolute left-full top-0 hidden group-hover:flex bg-white shadow-2xl rounded-md ml-2 z-50
//                              opacity-0 group-hover:opacity-100 transform -translate-x-4 group-hover:translate-x-0
//                              transition-all duration-300 ease-out 
//                              w-[600px] p-6
//                              md:flex md:w-[600px] md:p-6
//                              sm:static sm:block sm:w-full sm:p-4"
//                 >
//                   {/* Subcategories grid (desktop) */}
//                   <div className="hidden md:grid md:grid-cols-2 md:gap-6 flex-1">
//                     {subcategories.map((sub) => (
//                       <Link
//                         key={sub}
//                         href={`/categories/${name.toLowerCase().replace(/\s+/g, "-")}/${sub
//                           .toLowerCase()
//                           .replace(/\s+/g, "-")}`}
//                         className="block text-sm text-gray-700 hover:text-brand-primary transition-colors"
//                       >
//                         {sub}
//                       </Link>
//                     ))}
//                   </div>

//                   {/* Subcategories list (mobile) */}
//                   <ul className="sm:block md:hidden space-y-2">
//                     {subcategories.map((sub) => (
//                       <li key={sub}>
//                         <Link
//                           href={`/categories/${name.toLowerCase().replace(/\s+/g, "-")}/${sub
//                             .toLowerCase()
//                             .replace(/\s+/g, "-")}`}
//                           className="block py-2 text-sm text-gray-700 hover:text-brand-primary transition-colors"
//                         >
//                           {sub}
//                         </Link>
//                       </li>
//                     ))}
//                   </ul>

//                   {/* Banner image (desktop only) */}
//                   {banner && (
//                     <div className="hidden md:block w-64 h-40 relative overflow-hidden rounded-md">
//                       <Image
//                         src={banner}
//                         alt={`${name} banner`}
//                         fill
//                         className="object-cover"
//                       />
//                     </div>
//                   )}
//                 </div>
//               )}
//             </li>
//           ))}
//         </ul>
//       </div>
//     </div>
//   );
// }





// app/components/CategoryMobileMenu.tsx
// app/components/CategoryMobileMenu.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { categories } from "@/app/_data/CategoriesSidebar";

export default function CategoryMobileMenu() {
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const toggleCategory = (name: string) => {
    setOpenCategory(openCategory === name ? null : name);
  };

  return (
    <nav className="p-4 bg-white shadow-md">
      <ul className="space-y-3">
        {categories.map((cat) => (
          <li key={cat.name}>
            {/* Main category button */}
            <button
              onClick={() => toggleCategory(cat.name)}
              className="w-full flex justify-between items-center text-lg font-semibold text-gray-800 hover:text-brand-primary transition-colors"
            >
              {cat.name}
              <span className="ml-2 text-gray-500">
                {openCategory === cat.name ? "−" : "+"}
              </span>
            </button>

            {/* Subcategories accordion */}
            {cat.subcategories && (
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openCategory === cat.name ? "max-h-40 opacity-100 mt-2" : "max-h-0 opacity-0"
                }`}
              >
                <ul className="ml-4 space-y-1">
                  {cat.subcategories.map((sub) => (
                    <li key={sub}>
                      <Link
                        href={`/categories/${cat.name.toLowerCase().replace(/\s+/g, "-")}/${sub
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                        className="block py-1 text-sm text-gray-600 hover:text-brand-primary"
                      >
                        {sub}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

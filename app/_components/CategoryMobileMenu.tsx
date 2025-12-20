"use client";

import {
  Grid,
  Laptop,
  Smartphone,
  Tv,
  Shirt,
  Home,
  Baby,
  Car,
  HeartPulse,
  Palette,
  ChevronRight,
} from "lucide-react";

export default function CategoryMenu() {
  const categories = [
    { name: "Computers and Accessories", icon: Laptop },
    { name: "Phones and Tablets", icon: Smartphone },
    { name: "Electronics", icon: Tv, highlight: true },
    { name: "MarvelMarts Fashion", icon: Shirt },
    { name: "Home and Kitchens", icon: Home },
    { name: "Baby, Kids and Toys", icon: Baby },
    { name: "Automobile", icon: Car, highlight: true },
    { name: "Health and Beauty", icon: HeartPulse },
    { name: "African Arts & Crafts", icon: Palette },
    { name: "Other Categories", icon: Grid },
  ];

  return (
    <div className="w-full md:w-80 z-20">
      {/* Header */}
      <div className="flex items-center justify-between bg-brand-primary text-white px-4 py-3 rounded-t-md shadow-md">
        <div className="flex items-center space-x-2">
          <Grid className="w-6 h-6" />
          <span className="font-semibold uppercase text-xl sm:text-2xl">
            Browse Categories
          </span>
        </div>
      </div>

      {/* Category List */}
      <div className="bg-white shadow-lg rounded-b-md overflow-hidden">
        <ul className="divide-y divide-gray-100">
          {categories.map(({ name, icon: Icon, highlight }) => (
            <li
              key={name}
              className={`flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${
                highlight ? "bg-orange-50 text-orange-600 font-semibold" : ""
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-6 h-6 text-gray-500" />
                <span className="text-lg font-semibold text-gray-800">{name}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}




// import { categories } from "@/app/_data/CategoriesSidebar";

// export default function CategoryMobileMenu() {
//   return (
//     <div>
//       {categories.map(({ name, subcategories, banner }) => (
//         <div key={name}>
//           <h3>{name}</h3>
//           {subcategories?.map((sub) => (
//             <p key={sub}>{sub}</p>
//           ))}
//           {banner && <img src={banner} alt={`${name} banner`} />}
//         </div>
//       ))}
//     </div>
//   );
// }


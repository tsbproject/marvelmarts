// // app/shop/_components/ShopSidebar.tsx
// "use client";

// import { useRouter, useSearchParams, usePathname } from "next/navigation";
// import { useCallback } from "react";
// import { ChevronRight } from "lucide-react";

// const BRANDS = ["5.11 Tactical", "Garmin", "Oakley", "Blackhawk", "Condor"];
// const PRICE_RANGES = [
//   { label: "Under ₦50k", min: "0", max: "50000" },
//   { label: "₦50k - ₦150k", min: "50000", max: "150000" },
//   { label: "₦150k - ₦500k", min: "150000", max: "500000" },
//   { label: "Over ₦500k", min: "500000", max: "9999999" },
// ];

// export default function ShopSidebar({ categories }: { categories: any[] }) {
//   const router = useRouter();
//   const pathname = usePathname();
//   const searchParams = useSearchParams();

//   const handleFilter = useCallback((name: string, value: string, secondName?: string, secondValue?: string) => {
//     const params = new URLSearchParams(searchParams.toString());
    
//     if (params.get(name) === value) {
//       params.delete(name);
//       if (secondName) params.delete(secondName);
//     } else {
//       params.set(name, value);
//       if (secondName && secondValue) params.set(secondName, secondValue);
//     }
//     router.push(`${pathname}?${params.toString()}`, { scroll: false });
//   }, [searchParams, pathname, router]);

//   return (
//     <aside className="w-full lg:w-64 space-y-10">
//       {/* 1. REAL DB CATEGORIES */}
//       <div>
//         <h3 className="font-black uppercase italic text-accent-navy mb-6 tracking-tight border-l-4 border-brand-primary pl-3">Departments</h3>
//         <div className="space-y-4">
//           {categories.map((cat) => (
//             <div key={cat.id}>
//               <button 
//                 onClick={() => handleFilter("category", cat.slug)}
//                 className={`flex items-center justify-between w-full text-left text-xs font-black uppercase tracking-widest transition-colors ${searchParams.get("category") === cat.slug ? 'text-brand-primary' : 'text-accent-navy hover:text-brand-primary'}`}
//               >
//                 {cat.name}
//                 <ChevronRight size={14} className={searchParams.get("category") === cat.slug ? "rotate-90 transition-all" : ""} />
//               </button>
//               {cat.children?.length > 0 && (
//                 <div className="mt-2 ml-4 space-y-2 border-l border-neutral-light pl-4">
//                   {cat.children.map((child: any) => (
//                     <button 
//                       key={child.id}
//                       onClick={() => handleFilter("subcategory", child.slug)}
//                       className={`block text-[10px] font-bold uppercase transition-colors ${searchParams.get("subcategory") === child.slug ? 'text-brand-primary' : 'text-neutral-gray hover:text-accent-navy'}`}
//                     >
//                       {child.name}
//                     </button>
//                   ))}
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* 2. BRANDS */}
//       <div>
//         <h3 className="font-black uppercase italic text-accent-navy mb-6 tracking-tight border-l-4 border-brand-primary pl-3">Elite Brands</h3>
//         <div className="space-y-3">
//           {BRANDS.map((brand) => (
//             <label key={brand} className="flex items-center gap-3 cursor-pointer group">
//               <input 
//                 type="checkbox" 
//                 checked={searchParams.get("brand") === brand}
//                 onChange={() => handleFilter("brand", brand)}
//                 className="w-4 h-4 rounded border-neutral-light text-brand-primary focus:ring-brand-primary" 
//               />
//               <span className={`text-sm font-bold uppercase ${searchParams.get("brand") === brand ? 'text-brand-primary' : 'text-neutral-gray group-hover:text-accent-navy'}`}>{brand}</span>
//             </label>
//           ))}
//         </div>
//       </div>

//       {/* 3. PRICE RANGE */}
//       <div>
//         <h3 className="font-black uppercase italic text-accent-navy mb-6 tracking-tight border-l-4 border-brand-primary pl-3">Budget</h3>
//         <div className="space-y-3">
//           {PRICE_RANGES.map((range) => (
//             <label key={range.label} className="flex items-center gap-3 cursor-pointer group">
//               <input 
//                 type="radio" 
//                 name="price"
//                 checked={searchParams.get("minPrice") === range.min}
//                 onChange={() => handleFilter("minPrice", range.min, "maxPrice", range.max)}
//                 className="w-4 h-4 border-neutral-light text-brand-primary focus:ring-brand-primary" 
//               />
//               <span className={`text-sm font-bold uppercase ${searchParams.get("minPrice") === range.min ? 'text-brand-primary' : 'text-neutral-gray group-hover:text-accent-navy'}`}>{range.label}</span>
//             </label>
//           ))}
//         </div>
//       </div>

//       {/* 4. RESET */}
//       {searchParams.toString() !== "" && (
//         <button 
//           onClick={() => router.push(pathname)}
//           className="w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] bg-neutral-light text-accent-navy rounded-2xl hover:bg-brand-primary hover:text-white transition-all"
//         >
//           Clear All Intel
//         </button>
//       )}
//     </aside>
//   );
// }



// app/_components/ShopSidebar.tsx
"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { ChevronRight } from "lucide-react";

const BRANDS = ["5.11 Tactical", "Garmin", "Oakley", "Blackhawk", "Condor"];
const PRICE_RANGES = [
  { label: "Under ₦50k", min: "0", max: "50000" },
  { label: "₦50k - ₦150k", min: "50000", max: "150000" },
  { label: "₦150k - ₦500k", min: "150000", max: "500000" },
  { label: "Over ₦500k", min: "500000", max: "9999999" },
];

export default function ShopSidebar({ categories }: { categories: any[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleFilter = useCallback((name: string, value: string, secondName?: string, secondValue?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get(name) === value) {
      params.delete(name);
      if (secondName) params.delete(secondName);
    } else {
      params.set(name, value);
      if (secondName && secondValue) params.set(secondName, secondValue);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, pathname, router]);

  return (
    <aside className="w-full lg:w-64 space-y-10 shrink-0">
      <div>
        <h3 className="font-black uppercase italic text-accent-navy mb-6 tracking-tight border-l-4 border-brand-primary pl-3">Departments</h3>
        <div className="space-y-4">
          {categories.map((cat) => (
            <div key={cat.id}>
              <button 
                onClick={() => handleFilter("category", cat.slug)}
                className={`flex items-center justify-between w-full text-left text-xs font-black uppercase tracking-widest transition-colors ${searchParams.get("category") === cat.slug ? 'text-brand-primary' : 'text-accent-navy hover:text-brand-primary'}`}
              >
                {cat.name}
                <ChevronRight size={14} className={searchParams.get("category") === cat.slug ? "rotate-90 transition-all" : ""} />
              </button>
              {cat.children?.length > 0 && (
                <div className="mt-2 ml-4 space-y-2 border-l border-neutral-light pl-4">
                  {cat.children.map((child: any) => (
                    <button 
                      key={child.id}
                      onClick={() => handleFilter("subcategory", child.slug)}
                      className={`block text-[10px] font-bold uppercase transition-colors ${searchParams.get("subcategory") === child.slug ? 'text-brand-primary' : 'text-neutral-gray hover:text-accent-navy'}`}
                    >
                      {child.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-black uppercase italic text-accent-navy mb-6 tracking-tight border-l-4 border-brand-primary pl-3">Elite Brands</h3>
        <div className="space-y-3">
          {BRANDS.map((brand) => (
            <label key={brand} className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={searchParams.get("brand") === brand}
                onChange={() => handleFilter("brand", brand)}
                className="w-4 h-4 rounded border-neutral-light text-brand-primary" 
              />
              <span className={`text-sm font-bold uppercase ${searchParams.get("brand") === brand ? 'text-brand-primary' : 'text-neutral-gray group-hover:text-accent-navy'}`}>{brand}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-black uppercase italic text-accent-navy mb-6 tracking-tight border-l-4 border-brand-primary pl-3">Budget</h3>
        <div className="space-y-3">
          {PRICE_RANGES.map((range) => (
            <label key={range.label} className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="radio" 
                name="price"
                checked={searchParams.get("minPrice") === range.min}
                onChange={() => handleFilter("minPrice", range.min, "maxPrice", range.max)}
                className="w-4 h-4 border-neutral-light text-brand-primary" 
              />
              <span className={`text-sm font-bold uppercase ${searchParams.get("minPrice") === range.min ? 'text-brand-primary' : 'text-neutral-gray group-hover:text-accent-navy'}`}>{range.label}</span>
            </label>
          ))}
        </div>
      </div>

      {searchParams.toString() !== "" && (
        <button 
          onClick={() => router.push(pathname)}
          className="w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] bg-neutral-light text-accent-navy rounded-2xl hover:bg-brand-primary hover:text-white transition-all"
        >
          Reset All
        </button>
      )}
    </aside>
  );
}
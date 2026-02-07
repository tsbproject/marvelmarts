// // app/_components/ShopSidebar.tsx
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
//     <aside className="w-full lg:w-64 space-y-10 shrink-0">
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

//       <div>
//         <h3 className="font-black uppercase italic text-accent-navy mb-6 tracking-tight border-l-4 border-brand-primary pl-3">Elite Brands</h3>
//         <div className="space-y-3">
//           {BRANDS.map((brand) => (
//             <label key={brand} className="flex items-center gap-3 cursor-pointer group">
//               <input 
//                 type="checkbox" 
//                 checked={searchParams.get("brand") === brand}
//                 onChange={() => handleFilter("brand", brand)}
//                 className="w-4 h-4 rounded border-neutral-light text-brand-primary" 
//               />
//               <span className={`text-sm font-bold uppercase ${searchParams.get("brand") === brand ? 'text-brand-primary' : 'text-neutral-gray group-hover:text-accent-navy'}`}>{brand}</span>
//             </label>
//           ))}
//         </div>
//       </div>

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
//                 className="w-4 h-4 border-neutral-light text-brand-primary" 
//               />
//               <span className={`text-sm font-bold uppercase ${searchParams.get("minPrice") === range.min ? 'text-brand-primary' : 'text-neutral-gray group-hover:text-accent-navy'}`}>{range.label}</span>
//             </label>
//           ))}
//         </div>
//       </div>

//       {searchParams.toString() !== "" && (
//         <button 
//           onClick={() => router.push(pathname)}
//           className="w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] bg-neutral-light text-accent-navy rounded-2xl hover:bg-brand-primary hover:text-white transition-all"
//         >
//           Reset All
//         </button>
//       )}
//     </aside>
//   );
// }






// app/_components/ShopSidebar.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronDown, Filter, ShieldCheck, Tag, Circle, 
  Trademark, RotateCcw, Truck, Box, Cpu, HardDrive, 
  Monitor, Tablet, Wifi, Palette 
} from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

interface SidebarProps {
  categories: any[];
}

export default function ShopSidebar({ categories }: SidebarProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // State for Accordion - All closed by default except Categories to keep it neat
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    categories: true,
    specs: false,
    logistics: false,
    price: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const hasFilters = searchParams.toString().length > 0;

  // Filter Data Arrays
  const colors = ["#000000", "#1B2430", "#3E4149", "#FFFFFF", "#B22222"];
  const ramSizes = ["8GB", "16GB", "32GB", "64GB"];
  const osTypes = ["Windows 11", "Linux", "macOS"];
  const hdTypes = ["SSD (NVMe)", "SSD (SATA)", "HDD"];
  const connectivity = ["Wi-Fi 6E", "5G LTE", "Bluetooth 5.3", "Ethernet"];

  return (
    <aside className="w-full lg:w-80 flex flex-col gap-4">
      {/* Tactical Header */}
      <div className="flex items-center justify-between pb-4 border-b-2 border-accent-navy">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-brand-primary" />
          <h2 className="font-black italic uppercase text-accent-navy tracking-tighter">Filter Station</h2>
        </div>
        {hasFilters && (
          <button onClick={() => router.push("/shop")} className="text-[10px] font-bold text-red-500 flex items-center gap-1 uppercase">
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        )}
      </div>

      {/* 1. PRIMARY CATEGORIES */}
      <SidebarAccordion 
        title="Classification" 
        icon={<ShieldCheck className="w-4 h-4" />} 
        isOpen={openSections.categories} 
        onToggle={() => toggleSection("categories")}
      >
        <ul className="space-y-1 py-2">
          {categories.map((cat) => (
            <li key={cat.id}>
              <Link href={`/shop?category=${cat.slug}`} className="flex items-center gap-2 p-2 text-xs font-bold text-neutral-gray hover:text-brand-primary transition-all">
                <Circle className="w-1.5 h-1.5 fill-brand-primary" /> {cat.name.toUpperCase()}
              </Link>
            </li>
          ))}
        </ul>
      </SidebarAccordion>

      {/* 2. LOGISTICS (Shipping & Availability) */}
      <SidebarAccordion 
        title="Logistics" 
        icon={<Truck className="w-4 h-4" />} 
        isOpen={openSections.logistics} 
        onToggle={() => toggleSection("logistics")}
      >
        <div className="space-y-3 py-3">
          <FilterGroup title="Availability">
            {["In Stock", "Pre-Order"].map(opt => (
              <label key={opt} className="flex items-center gap-2 text-[11px] font-bold text-accent-navy cursor-pointer">
                <input type="checkbox" className="w-3 h-3 accent-brand-primary" /> {opt}
              </label>
            ))}
          </FilterGroup>
          <FilterGroup title="Shipping Method">
            {["Express", "Standard", "Vendor Drop"].map(opt => (
              <label key={opt} className="flex items-center gap-2 text-[11px] font-bold text-neutral-gray cursor-pointer">
                <input type="radio" name="shipping" className="w-3 h-3 accent-brand-primary" /> {opt}
              </label>
            ))}
          </FilterGroup>
        </div>
      </SidebarAccordion>

      {/* 3. TECHNICAL SPECS (PC Info & Connectivity) */}
      <SidebarAccordion 
        title="System Specs" 
        icon={<Cpu className="w-4 h-4" />} 
        isOpen={openSections.specs} 
        onToggle={() => toggleSection("specs")}
      >
        <div className="space-y-4 py-3 border-t border-gray-50">
          {/* Colors */}
          <FilterGroup title="Tactical Finish">
            <div className="flex gap-2 flex-wrap">
              {colors.map(c => (
                <button key={c} style={{ backgroundColor: c }} className="w-6 h-6 rounded-full border border-gray-200 ring-offset-2 hover:ring-2 ring-brand-primary transition-all" />
              ))}
            </div>
          </FilterGroup>

          {/* PC Hardware Suite */}
          <div className="grid grid-cols-2 gap-2">
            <SelectFilter label="RAM" options={ramSizes} icon={<Tablet className="w-3 h-3"/>} />
            <SelectFilter label="OS" options={osTypes} icon={<Monitor className="w-3 h-3"/>} />
          </div>
          <SelectFilter label="Storage" options={hdTypes} icon={<HardDrive className="w-3 h-3"/>} />
          <SelectFilter label="Connectivity" options={connectivity} icon={<Wifi className="w-3 h-3"/>} />
          
          <FilterGroup title="Screen Size">
             <input type="range" className="w-full accent-brand-primary" min="11" max="32" />
             <div className="flex justify-between text-[10px] font-black"><span>11"</span><span>32"</span></div>
          </FilterGroup>
        </div>
      </SidebarAccordion>

      {/* 4. BUDGET */}
      <SidebarAccordion 
        title="Budget" 
        icon={<Tag className="w-4 h-4" />} 
        isOpen={openSections.price} 
        onToggle={() => toggleSection("price")}
      >
        <div className="flex gap-2 py-3">
          <input type="number" placeholder="MIN" className="w-1/2 p-2 bg-neutral-light rounded text-[10px] font-black" />
          <input type="number" placeholder="MAX" className="w-1/2 p-2 bg-neutral-light rounded text-[10px] font-black" />
        </div>
      </SidebarAccordion>
    </aside>
  );
}

// --- HELPER SUB-COMPONENTS ---

function SidebarAccordion({ title, icon, children, isOpen, onToggle }: any) {
  return (
    <div className="border border-gray-100 rounded-xl bg-white shadow-sm">
      <button onClick={onToggle} className="w-full flex items-center justify-between p-3 hover:bg-neutral-ghost/20 transition-all">
        <div className="flex items-center gap-2 text-accent-navy font-black text-[11px] uppercase tracking-wider">
          <span className="text-brand-primary">{icon}</span> {title}
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-3 overflow-hidden">
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterGroup({ title, children }: any) {
  return (
    <div className="space-y-2">
      <p className="text-[9px] font-black text-neutral-gray uppercase tracking-widest">{title}</p>
      {children}
    </div>
  );
}

function SelectFilter({ label, options, icon }: any) {
  return (
    <div className="space-y-1">
      <p className="text-[9px] font-black text-neutral-gray uppercase flex items-center gap-1">{icon} {label}</p>
      <select className="w-full p-1.5 bg-neutral-light rounded text-[10px] font-bold border-none">
        {options.map((o: string) => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}
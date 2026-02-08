"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronDown, Filter, ShieldCheck, Tag, Circle, 
  Factory, RotateCcw, Truck, Cpu, HardDrive, 
  Monitor, Tablet, Wifi, Palette 
} from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

interface SidebarProps {
  categories: { id: string; name: string; slug: string }[];
}

export default function ShopSidebar({ categories }: SidebarProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  
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

  const colors = ["#000000", "#1B2430", "#3E4149", "#FFFFFF", "#B22222"];
  const ramSizes = ["8GB", "16GB", "32GB", "64GB"];
  const osTypes = ["Windows 11", "Linux", "macOS"];
  const hdTypes = ["SSD (NVMe)", "SSD (SATA)", "HDD"];
  const connectivity = ["Wi-Fi 6E", "5G LTE", "Bluetooth 5.3", "Ethernet"];

  return (
    <aside className="w-full lg:w-100 flex flex-col gap-4">
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
        title="Categories Classification" 
        icon={<ShieldCheck className="w-6 h-6" />} 
        isOpen={openSections.categories} 
        onToggle={() => toggleSection("categories")}
      >
        <ul className="space-y-1 py-2">
          {categories.map((cat) => (
            <li key={cat.id}>
              <Link href={`/shop?category=${cat.slug}`} className="flex items-center gap-2 p-2 text-lg font-bold text-neutral-gray hover:text-brand-primary transition-all">
                <Circle className="w-1.5 h-1.5 fill-brand-primary" /> {cat.name.toUpperCase()}
              </Link>
            </li>
          ))}
        </ul>
      </SidebarAccordion>

      {/* 2. LOGISTICS */}
      <SidebarAccordion 
        title="Logistics" 
        icon={<Truck className="w-6 h-6 text-xl" />} 
        isOpen={openSections.logistics} 
        onToggle={() => toggleSection("logistics")}
      
      >
        <div className="space-y-3 py-3">
          <FilterGroup title="Availability">
            {["In Stock", "Pre-Order"].map(opt => (
              <label key={opt} className="flex items-center gap-2 text-[13px] font-bold text-accent-navy cursor-pointer">
                <input type="checkbox" className="w-6 h-6 accent-brand-primary" /> {opt}
              </label>
            ))}
          </FilterGroup>
          <FilterGroup title="Shipping Method">
            {["Express", "Standard", "Vendor Drop"].map(opt => (
              <label key={opt} className="flex items-center gap-2 text-[13px] font-bold text-neutral-gray cursor-pointer">
                <input type="radio" name="shipping" className="w-6 h-6 accent-brand-primary" /> {opt}
              </label>
            ))}
          </FilterGroup>
        </div>
      </SidebarAccordion>

      {/* 3. TECHNICAL SPECS */}
      <SidebarAccordion 
        title="Technical Specs" 
        icon={<Cpu className="w-6 h-6 " />} 
        isOpen={openSections.specs} 
        onToggle={() => toggleSection("specs")}
      >
        <div className="space-y-4 py-3 border-t border-gray-50">
          <FilterGroup title="Color Specs">
            <div className="flex gap-2 flex-wrap">
              {colors.map(c => (
                <button key={c} style={{ backgroundColor: c }} className="w-6 h-6  rounded-full border border-gray-200 ring-offset-2 hover:ring-2 ring-brand-primary transition-all" />
              ))}
            </div>
          </FilterGroup>

          <div className="grid grid-cols-2 gap-2 text-2xl">
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
          <input type="number" placeholder="MIN" className="w-1/2 p-2 bg-neutral-light rounded text-[10px] font-black outline-none focus:ring-1 ring-brand-primary" />
          <input type="number" placeholder="MAX" className="w-1/2 p-2 bg-neutral-light rounded text-[10px] font-black outline-none focus:ring-1 ring-brand-primary" />
        </div>
      </SidebarAccordion>
    </aside>
  );
}

// --- TYPE-SAFE HELPER COMPONENTS ---

function SidebarAccordion({ title, icon, children, isOpen, onToggle }: { 
  title: string; 
  icon: React.ReactNode; 
  children: React.ReactNode; 
  isOpen: boolean; 
  onToggle: () => void 
}) {
  return (
    <div className="border border-gray-100 rounded-xl bg-white shadow-sm overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between p-3 hover:bg-neutral-ghost/20 transition-all">
        <div className="flex items-center gap-2 text-accent-navy font-black text-[11px] uppercase tracking-wider">
          <span className="text-brand-primary">{icon}</span> {title}
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: "auto", opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }} 
            className="px-3 overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-[9px] font-black text-neutral-gray uppercase tracking-widest">{title}</p>
      {children}
    </div>
  );
}

function SelectFilter({ label, options, icon }: { label: string; options: string[]; icon: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-[9px] font-black text-neutral-gray uppercase flex items-center gap-1">{icon} {label}</p>
      <select className="w-full p-1.5 bg-neutral-light rounded text-[10px] font-bold border-none outline-none focus:ring-1 ring-brand-primary">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
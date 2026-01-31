


"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { 
  HelpCircle, 
  Package, 
  MessageCircle, 
  FileText, 
  LifeBuoy, 
  RefreshCcw,
  ChevronRight,
  Search as SearchIcon,
  Loader2
} from "lucide-react";
import Link from "next/link";

// Fallback items shown when search is empty (Quick Links)
const defaultItems = [
  { label: "Track My Order", description: "Real-time delivery updates", href: "/orders/track", icon: Package, color: "text-blue-500" },
  { label: "Help Center", description: "Browse guides & tutorials", href: "/support", icon: LifeBuoy, color: "text-purple-500" },
  { label: "Contact Us", description: "24/7 Customer support", href: "/support/contact", icon: MessageCircle, color: "text-green-500" },
  { label: "FAQs", description: "Quick answers to common questions", href: "/support/faqs", icon: FileText, color: "text-orange-500" },
  { label: "Return Policy", description: "30-day money back guarantee", href: "/support/returns", icon: RefreshCcw, color: "text-red-500" },
];

const listVariants: Variants = {
  hidden: { opacity: 0, y: 15, scale: 0.95, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.05 },
  },
  exit: { opacity: 0, y: 10, scale: 0.98, transition: { duration: 0.2 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
};

export default function HelpMenu() {
  const [helpOpen, setHelpOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // API Search Logic with Debouncing
  useEffect(() => {
    const fetchHelpResults = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const res = await fetch(`/api/support/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setSearchResults(data);
      } catch (err) {
        console.error("Support search error:", err);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(fetchHelpResults, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Determine items to display based on search input
  const displayItems = searchQuery.length >= 2 ? searchResults : defaultItems;

  return (
    <div
      className="relative flex items-center group z-1001"
      onMouseEnter={() => setHelpOpen(true)}
      onMouseLeave={() => {
        setHelpOpen(false);
        setSearchQuery("");
      }}
    >
      {/* Trigger Icon */}
      <div className="relative p-2 cursor-pointer transition-transform duration-300 group-hover:scale-110 ">
        <HelpCircle className="w-7 h-7 md:w-8 md:h-8 text-brand-primary group-hover:text-blue-600 transition-colors" />
          <span className=" absolute text-xl font-medium top-3 -right-12 text-gray-50 hidden lg:block ">Help</span>
        <span className="absolute -top-1 -right-1 flex h-3 w-3"> 
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
        </span>
       
      </div>

      <AnimatePresence>
        {helpOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={listVariants}
            className="absolute right-0 md:-right-10 top-full pt-4 z-10000 w-[300px] md:w-[380px]"
          >
            <div className="bg-white rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.2)] border border-gray-100 overflow-hidden">
              
              {/* Search Header Section */}
              <div className="p-5 bg-gray-50/80 border-b border-gray-100 space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Support Center</h3>
                
                <div className="relative">
                  {isSearching ? (
                    <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 animate-spin" size={14} />
                  ) : (
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  )}
                  <input 
                    type="text"
                    placeholder="Search for help..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl py-2 pl-9 pr-4 text-xs outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all text-gray-900"
                  />
                </div>
              </div>

              {/* Menu List */}
              <div className="p-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                {displayItems.length > 0 ? (
                  displayItems.map((item) => {
                    // Logic to handle both Static Links and API Article results
                    const isApiResult = !!item.slug;
                    const itemHref = isApiResult ? `/support/articles/${item.slug}` : item.href;
                    const itemLabel = item.label || item.title;
                    const itemDesc = item.description || item.excerpt || "Click to read more";
                    const Icon = item.icon || FileText;

                    return (
                      <motion.div key={itemLabel || item.id} variants={itemVariants}>
                        <Link
                          href={itemHref}
                          className="group/item flex items-center gap-4 p-3 rounded-[18px] hover:bg-blue-50/50 transition-all duration-200"
                        >
                          <div className={`p-2.5 rounded-xl bg-white shadow-sm border border-gray-50 ${item.color || 'text-blue-500'} group-hover/item:scale-110 transition-transform `}>
                            <Icon size={18} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-bold text-gray-900 group-hover/item:text-blue-600 transition-colors">
                              {itemLabel}
                            </p>
                            <p className="text-[10px] text-gray-400 truncate font-medium">
                              {itemDesc}
                            </p>
                          </div>
                          <ChevronRight size={14} className="text-gray-300 group-hover/item:text-blue-400 group-hover/item:translate-x-1 transition-all" />
                        </Link>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="py-12 text-center">
                    <p className="text-xs text-gray-400">No matching resources found.</p>
                  </div>
                )}
              </div>

              {/* Advanced Footer Link */}
              <Link 
                href="/support/live-chat"
                className="flex items-center justify-center gap-2 py-4 bg-accent-navy hover:bg-blue-700 text-white transition-colors group/chat"
              >
                <span className="text-[10px] font-black uppercase tracking-widest">Start Live Chat</span>
                <MessageCircle size={14} className="group-hover/chat:animate-bounce" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
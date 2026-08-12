"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Search, 
  Package, 
  ShieldCheck, 
  CreditCard, 
  User, 
  LifeBuoy,
  ArrowUpRight,
  RotateCcw,
  Store,
  Banknote,
  ShoppingBag,
  Zap,
  Lock
} from "lucide-react";
import SupportDrawer from "@/app/_components/SupportDrawer";
import { useLoadingOverlay } from "@/app/_context/LoadingOverlayContext";
import { CategoryService } from "../lib/services/category.service";


const categoryIcons: Record<string, any> = {
  "Order": ShoppingBag, 
  "Shipping": Package,
  "Payments": CreditCard,
  "Account": User,
  "Returns": RotateCcw,
  "Vendor": Store,
  "Refund": Banknote,
  "Security": ShieldCheck,
  "Default": LifeBuoy
};

export default function SupportLandingPage() {
  const [isOpen, setIsOpen] = useState(false);
  const { setLoading } = useLoadingOverlay();
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/support/landing-data');
        if (!response.ok) throw new Error(`Status ${response.status}`);
        const data = await response.json();
        setCategoryData(data.categoryData || []);
        setFeaturedArticles(data.featuredArticles || []);
      } catch (error) {
        console.error("Fetch failed:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [setLoading]);

  return (
    <div className="min-h-screen bg-[#FBFBFB]">
      {/* The Drawer component sitting at the top level */}
      <SupportDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
      
      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-24 bg-[#002B5B] overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 pointer-events-none"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#F7931E]/20 rounded-full blur-[120px]"></div>
        
        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 backdrop-blur-md mb-8">
            <Zap size={14} className="text-[#F7931E]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">MarvelMarts Help Center</span>
          </div>
          
          <h1 className="text-sm md:text-4xl font-black mb-8 tracking-tighter text-white">
            Meticulous  <span className="text-[#F7931E]">Support.</span>
          </h1>
          
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/40" size={22} />
            <input 
              type="text"
              placeholder="Search for relevant support article ..."
              className="w-full h-20 pl-16 pr-8 rounded-[2rem] bg-white/10 border border-white/20 text-white text-lg backdrop-blur-xl shadow-2xl focus:ring-4 focus:ring-[#F7931E]/30 outline-none transition-all placeholder:text-white/30"
            />
          </div>
        </div>
      </section>

      {/* --- CATEGORIES GRID --- */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-4 mb-12">
          <div className="h-px flex-1 bg-neutral-100"></div>
          <h2 className="text-[14px] font-black text-neutral-400 uppercase tracking-[0.4em]">Browse Knowledge Base</h2>
          <div className="h-px flex-1 bg-neutral-100"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {categoryData.map((cat) => {
            const Icon = categoryIcons[cat.category] || categoryIcons.Default;
            return (
              <Link 
                key={cat.category}
                href={`/support/category/${encodeURIComponent(cat.category)}`}
                className="group p-10 rounded-[40px] border border-transparent bg-white hover:border-neutral-200 hover:shadow-2xl transition-all duration-500"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#002B5B]/5 flex items-center justify-center text-[#002B5B] mb-8 group-hover:bg-[#F7931E] group-hover:text-white transition-all duration-500">
                  <Icon size={32} />
                </div>
                <h3 className="text-xl font-black text-[#002B5B] mb-2">{cat.category}</h3>
                <p className="text-sm text-neutral-400 font-bold uppercase tracking-widest">
                  {cat._count?._all || 0} Modules
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* --- FEATURED INTEL --- */}
      <section className="py-24 bg-[#002B5B]/[0.02] border-y border-neutral-100">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-black text-[#002B5B] uppercase tracking-tight mb-12">Top Help Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredArticles.map((article) => (
              <Link 
                key={article.id}
                href={`/support/articles/${article.slug}`}
                className="flex items-center justify-between p-8 bg-white rounded-3xl border border-transparent hover:border-[#002B5B]/10 group transition-all duration-300 shadow-sm hover:shadow-xl"
              >
                <div className="flex-1 pr-8">
                  <h4 className="text-lg font-black text-[#002B5B] group-hover:text-[#F7931E] transition-colors">{article.title}</h4>
                  <p className="text-sm text-neutral-400 mt-2 line-clamp-1 font-medium">{article.excerpt}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-300 group-hover:bg-[#F7931E]/10 group-hover:text-[#F7931E] transition-all">
                  <ArrowUpRight size={20} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* --- PROTOCOL FOOTER --- */}
      <section className="py-32 text-center relative overflow-hidden">
        <div className="max-w-2xl mx-auto px-6 relative z-10">
          <div className="inline-flex p-6 rounded-[2.5rem] bg-[#002B5B] text-white shadow-2xl mb-8">
            <Lock size={40} />
          </div>
          <h2 className="text-4xl font-black text-[#002B5B] mb-6">End-to-End Encryption</h2>
          <p className="text-neutral-500 mb-12 font-medium leading-relaxed">
            Every interaction on MarvelMarts is protected by industrial-grade security protocols.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact-us" className="px-12 py-5 bg-[#002B5B] text-white rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl">
              Ticket Submission
            </Link>
            <button 
              onClick={() => setIsOpen(true)}
              className="px-12 py-5 border-2 border-[#002B5B] text-[#002B5B] rounded-2xl font-black uppercase tracking-widest hover:bg-[#002B5B] hover:text-white transition-all shadow-xl"
            >
              Open Live Chat
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
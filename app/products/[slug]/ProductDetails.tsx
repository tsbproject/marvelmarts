"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ChevronRight, Truck, RotateCcw, ShieldCheck, 
  Star, Heart, Minus, Plus, ShoppingCart 
} from "lucide-react";
import { formatNaira } from "@/app/lib/FormatNaira";
import { ProductWithRelations } from "./page";

interface SimilarItem {
  id: string;
  title: string;
  slug: string;
  price: number;
  discountPrice: number | null;
  imageUrl: string;
}

interface ProductDetailsProps {
  product: ProductWithRelations;
  similarItems: SimilarItem[];
}

export default function ProductDetails({ product, similarItems }: ProductDetailsProps) {
  const [selectedImg, setSelectedImg] = useState<string>(product.images[0]?.url || "/placeholder.png");
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [showStickyBar, setShowStickyBar] = useState(false);

  const currentPrice = Number(product.discountPrice || product.price);
  const hasDiscount = !!product.discountPrice;

  // Scroll logic to show/hide the floating bar
  useEffect(() => {
    const handleScroll = () => {
      // Show the bar after scrolling 400px down
      if (window.scrollY > 400) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="bg-[#F2F2F2] min-h-screen pb-20 lg:pb-12">
      {/* 1. Breadcrumbs */}
      <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-2 text-[11px] text-gray-500 uppercase tracking-wider">
        <Link href="/" className="hover:text-pink-600 transition-colors">Home</Link>
        <ChevronRight size={10} />
        <Link href={`/category/${product.category?.slug}`} className="hover:text-pink-600 transition-colors">
          {product.category?.name}
        </Link>
        <ChevronRight size={10} />
        <span className="text-gray-900 font-bold truncate">{product.title}</span>
      </nav>

      <main className="max-w-8xl md:w-9xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT: Image Gallery */}
        <div className="lg:col-span-8 bg-white rounded-sm p-6 shadow-sm flex flex-col md:flex-row gap-6">
          <div className="flex md:flex-col gap-3 order-2 md:order-1 overflow-x-auto md:overflow-visible">
            {product.images.map((img) => (
              <button 
                key={img.id}
                onMouseEnter={() => setSelectedImg(img.url)}
                className={`w-16 h-16 shrink-0 border-2 rounded-md overflow-hidden transition-all ${
                  selectedImg === img.url ? 'border-orange-500 shadow-md' : 'border-gray-100'
                }`}
              >
                <img src={img.url} alt="thumbnail" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          <div className="flex-1 order-1 md:order-2 flex items-center justify-center bg-white min-h-[400px]">
            <img src={selectedImg} alt={product.title} className="max-w-full max-h-[500px] object-contain" />
          </div>
        </div>

        {/* RIGHT: Price & Actions */}
        <div className="lg:col-span-4 space-y-4">
          <section className="bg-white rounded-sm p-5 shadow-sm">
            <h1 className="text-xl font-bold text-gray-800 leading-tight">{product.title}</h1>
            <div className="flex items-center gap-4 mt-2 text-[11px] text-gray-400">
              <span>PRODUCT CODE: {product.id.slice(-6).toUpperCase()}</span>
              <div className="flex items-center text-orange-400">
                <Star size={12} fill="currentColor" /> <Star size={12} fill="currentColor" /> <Star size={12} fill="currentColor" />
                <span className="ml-1 text-blue-500 hover:underline cursor-pointer">(12 Reviews)</span>
              </div>
            </div>

            <hr className="my-4 opacity-50" />

            <div className="py-2">
              <p className="text-3xl font-black text-gray-900">{formatNaira(currentPrice)}</p>
              {hasDiscount && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-gray-400 line-through text-sm">{formatNaira(Number(product.price))}</span>
                  <span className="text-green-600 text-xs font-bold">-{Math.round(((Number(product.price) - currentPrice) / Number(product.price)) * 100)}%</span>
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="mt-6 flex items-center gap-4 border-t pt-4">
              <span className="text-xs font-bold text-gray-500 uppercase">Quantity:</span>
              <div className="flex items-center border rounded">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:bg-gray-100"><Minus size={14}/></button>
                <span className="px-4 text-sm font-bold w-10 text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-2 hover:bg-gray-100"><Plus size={14}/></button>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button className="w-full bg-[#00b57a] hover:bg-[#009665] text-white py-4 rounded-md font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98]">
                <ShoppingCart size={18} /> Add To Cart
              </button>
            </div>
          </section>

          {/* Delivery Info */}
          <aside className="bg-white rounded-sm p-5 shadow-sm space-y-5">
            <h3 className="text-xs font-bold text-gray-800 uppercase border-b pb-2 tracking-tighter">Delivery & Returns</h3>
            <div className="flex gap-4">
              <Truck size={20} className="text-pink-600 shrink-0" />
              <p className="text-[10px] text-gray-500 leading-tight">Standard delivery within 1-5 business days.</p>
            </div>
          </aside>
        </div>
      </main>

      {/* TABS SECTION */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-sm shadow-sm overflow-hidden">
          <div className="flex border-b text-[11px] font-bold text-gray-500 uppercase tracking-widest">
            {['overview', 'description', 'reviews'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-4 ${activeTab === tab ? 'border-b-4 border-pink-600 text-pink-600 bg-gray-50' : 'hover:text-gray-800'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="p-8">
             {activeTab === 'overview' && <div className="prose prose-sm max-w-none text-gray-600" dangerouslySetInnerHTML={{ __html: product.description }} />}
             {activeTab !== 'overview' && <p className="text-sm text-gray-400">Section details coming soon.</p>}
          </div>
        </div>
      </div>

      {/* SIMILAR ITEMS */}
      <div className="max-w-7xl mx-auto px-4 mt-10">
        <div className="bg-white rounded-sm shadow-sm p-6">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-tighter mb-6 border-b pb-2">Similar Items</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {similarItems.map((item) => (
              <Link href={`/products/${item.slug}`} key={item.id} className="group">
                <div className="aspect-square bg-gray-50 rounded-md overflow-hidden mb-2 border border-gray-100">
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-[11px] text-gray-600 line-clamp-2 h-8">{item.title}</h3>
                <p className="mt-1 text-sm font-bold">{formatNaira(item.price)}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* --- FLOATING MOBILE BUY BAR --- */}
      <div 
        className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 z-50 transition-transform duration-300 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] lg:hidden ${
          showStickyBar ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-900 truncate">{product.title}</p>
            <p className="text-sm font-black text-pink-600">{formatNaira(currentPrice)}</p>
          </div>
          <button className="bg-[#00b57a] text-white px-6 py-3 rounded-md font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg active:scale-95 transition-all">
            <ShoppingCart size={16} /> Add
          </button>
        </div>
      </div>
    </div>
  );
}
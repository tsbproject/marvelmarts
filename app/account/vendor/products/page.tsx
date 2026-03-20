"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  PlusIcon, 
  PencilSquareIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  ArchiveBoxIcon,
  EyeIcon,
  RocketLaunchIcon,
  XMarkIcon 
} from "@heroicons/react/24/outline";
import { Zap } from "lucide-react";
import DashboardHeader from "@/app/_components/DashboardHeader";
import { formatNaira } from "@/app/lib/FormatNaira";
import { useNotification } from "@/app/_context/NotificationContext"; 
import { RootState } from "@/store";
import { useSelector } from "react-redux";
import { updateCredits } from "@/store/vendorSlice";
import { useDispatch } from "react-redux";
import { boostProduct } from "@/app/_actions/boostActions";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice: number | null;
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED'; 
  isBoosted?: boolean; // Track boost status
  stock: number;
  imageUrl: string;
  category: {
    name: string;
  };
}

export default function VendorInventoryPage() {
  const { notifySuccess, notifyError, notifyInfo } = useNotification();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchMyProducts = async () => {
      try {
        const res = await fetch("/api/vendors/products");
        const data = await res.json();
        if (data.success) {
          setProducts(data.items);
        } else {
          notifyError(data.message || "Could not load inventory");
        }
      } catch (err) {
        notifyError("Failed to connect to server");
      } finally {
        setLoading(false);
      }
    };
    fetchMyProducts();
  }, [notifyError]);

 const [selectedProductForBoost, setSelectedProductForBoost] = useState<Product | null>(null);
// Get credits from Redux (same as your Boost Center page)
const vendorProfile = useSelector((state: RootState) => state.vendor.profile);
const currentCredits = vendorProfile?.boost?.credits || 0;

// Update handleBoost
const handleBoost = (productId: string) => {
  const product = products.find((p) => p.id === productId);
  if (product) setSelectedProductForBoost(product);
};



type BoostProductResult =
  | { error: string }
  | { success: true; newBalance: number; expiry: Date };

const confirmBoost = async (days: number) => {
  if (!selectedProductForBoost) return;

  try {
    const result = await boostProduct(selectedProductForBoost.id, days);

    if ("error" in result) {
      notifyError(result.error);
      return;
    }

    dispatch(updateCredits(result.newBalance));
    notifySuccess(`Rocketing ${selectedProductForBoost.name} to the top!`);
    setSelectedProductForBoost(null);
  } catch {
    notifyError("A connection error occurred. Please try again.");
  }
};



const handleDelete = async (productId: string, name: string) => {
    if (!confirm(`Permanently delete ${name}?`)) return;

    try {
      const res = await fetch(`/api/vendors/products?id=${productId}`, { 
        method: "DELETE" 
      });
      const data = await res.json();

      if (data.success) {
        setProducts(prev => prev.filter(p => p.id !== productId));
        notifySuccess(`${name} removed from inventory`);
      } else {
        notifyError(data.message || "Delete failed");
      }
    } catch (err) {
      notifyError("An error occurred during deletion");
    }
  };

  const filteredProducts = products.filter((p) =>
    (p.name || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen font-black uppercase tracking-tighter text-indigo-600 animate-pulse bg-neutral-light">
        Loading MarvelMarts Inventory...
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-neutral-light">
      <DashboardHeader title="Inventory" showLogout={true} />

      <div className="p-4 xxs:p-6 lg:p-10 flex-1 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/*  TOP ACTION BAR */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
                <h2 className="text-xl xxs:text-2xl font-black text-accent-navy uppercase italic tracking-tighter">Your Warehouse</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Manage stock & performance</p>
            </div>
            <Link 
                href="/account/vendor/products/new"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-brand-primary text-accent-navy rounded-2xl font-black text-[10px] xxs:text-xs uppercase tracking-wider shadow-md hover:scale-[1.02] transition-all active:scale-95"
            >
                <PlusIcon className="h-5 w-5" />
                Add New Product
            </Link>
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-3 gap-3 xxs:gap-6 mb-8">
          <StatCard label="Total" value={products.length} />
          <StatCard label="Active" value={products.filter(p => p.status === 'ACTIVE').length} color="text-green-600" />
          <StatCard label="Low Stock" value={products.filter(p => p.stock < 5).length} color="text-red-500" />
        </div>

        <div className="bg-white rounded-[2rem] xxs:rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 xxs:p-6 border-b border-gray-50 bg-gray-50/30">
             <div className="relative w-full max-w-md">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Filter inventory..."
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 ring-indigo-500/20 text-xs xxs:text-sm font-bold transition-all"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
             </div>
          </div>

         {/*CREDIT BOOST MODAL */}
        {selectedProductForBoost && (
          <BoostModal 
            product={selectedProductForBoost} 
            currentCredits={currentCredits}
            onClose={() => setSelectedProductForBoost(null)}
            onConfirm={confirmBoost}
          />
        )}

          <div className="overflow-x-auto">
            {/* Desktop Table */}
            <table className="w-full text-left border-collapse hidden md:table">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Product</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Growth</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Stock</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredProducts.map((product) => (
                  <TableRow key={product.id} product={product} handleDelete={handleDelete} handleBoost={handleBoost} />
                ))}
              </tbody>
            </table>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-50">
                {filteredProducts.length === 0 ? (
                    <EmptyState />
                ) : (
                    filteredProducts.map(product => (
                        <ProductCard key={product.id} product={product} handleDelete={handleDelete} handleBoost={handleBoost} />
                    ))
                )}
            </div>
            {filteredProducts.length === 0 && <div className="hidden md:block"><EmptyState /></div>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* --- SUB-COMPONENTS --- */

function TableRow({ product, handleDelete, handleBoost }: { product: Product, handleDelete: any, handleBoost: any }) {
    return (
        <tr className="hover:bg-gray-50/30 transition-colors group">
            <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                    <img src={product.imageUrl || "/placeholder-product.png"} className="w-12 h-12 rounded-2xl object-cover border border-gray-100" alt={product.name}/>
                    <div className="min-w-0">
                        <Link href={`/products/${product.slug}`} target="_blank" className="font-bold text-slate-900 text-sm hover:text-indigo-600 transition-colors line-clamp-1">{product.name}</Link>
                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-tighter">{product.category?.name || "Uncategorized"}</p>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4"><StatusBadge status={product.status} /></td>
            <td className="px-6 py-4">
                <button 
                  onClick={() => handleBoost(product.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-accent-navy text-brand-primary rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-primary hover:text-accent-navy transition-all shadow-sm group/boost"
                >
                    <RocketLaunchIcon className="h-4 w-4 group-hover/boost:-translate-y-1 transition-transform" />
                    <span>Boost</span>
                </button>
            </td>
            <td className="px-6 py-4"><StockIndicator stock={product.stock} /></td>
            <td className="px-6 py-4 text-right"><ActionButtons product={product} handleDelete={handleDelete} /></td>
        </tr>
    );
}

function ProductCard({ product, handleDelete, handleBoost }: { product: Product, handleDelete: any, handleBoost: any }) {
    return (
        <div className="p-4 xxs:p-5 flex flex-col gap-4">
            <div className="flex items-center gap-4">
                <img src={product.imageUrl || "/placeholder-product.png"} className="w-14 h-14 xxs:w-16 xxs:h-16 rounded-2xl object-cover border border-gray-100 shadow-sm" alt={product.name}/>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                        <Link href={`/products/${product.slug}`} className="font-bold text-slate-900 text-sm truncate uppercase italic">{product.name}</Link>
                        <StatusBadge status={product.status} />
                    </div>
                    <p className="font-black text-indigo-600 text-sm mt-1">{formatNaira(product.price)}</p>
                </div>
            </div>
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-2xl border border-gray-100 gap-2">
                <StockIndicator stock={product.stock} />
                
                <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleBoost(product.id, product.name)}
                      className="p-2 bg-accent-navy text-brand-primary rounded-xl shadow-lg active:scale-90 transition-transform"
                    >
                        <RocketLaunchIcon className="h-5 w-5" />
                    </button>
                    <div className="h-6 w-[1px] bg-gray-200 mx-1" />
                    <ActionButtons product={product} handleDelete={handleDelete} />
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, color = "text-slate-900" }: { label: string; value: number; color?: string }) {
  return (
    <div className="bg-white p-4 xxs:p-6 rounded-[1.5rem] xxs:rounded-[2rem] border border-gray-100 shadow-sm">
      <p className="text-[8px] xxs:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-xl xxs:text-2xl font-black ${color}`}>{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
    return (
        <span className={`px-2 py-0.5 rounded-full text-[8px] xxs:text-[10px] font-black uppercase tracking-widest ${
            status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
        }`}>
            {status}
        </span>
    );
}

function StockIndicator({ stock }: { stock: number }) {
    return (
        <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${stock < 5 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
            <span className={`text-xs font-bold ${stock < 5 ? 'text-red-500' : 'text-slate-700'}`}>
                {stock} <span className="hidden xxs:inline text-[9px] uppercase opacity-50">Stock</span>
            </span>
        </div>
    );
}

function ActionButtons({ product, handleDelete }: { product: any, handleDelete: any }) {
    return (
        <div className="flex items-center gap-1.5">
            <Link href={`/account/vendor/products/edit/${product.id}`} className="p-2 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-indigo-600 transition-all">
                <PencilSquareIcon className="h-4 w-4 xxs:h-5 xxs:w-5" />
            </Link>
            <button onClick={() => handleDelete(product.id, product.name)} className="p-2 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-red-500 transition-all">
                <TrashIcon className="h-4 w-4 xxs:h-5 xxs:w-5" />
            </button>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="py-20 text-center px-6">
            <ArchiveBoxIcon className="h-12 w-12 mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400 font-bold uppercase text-xs tracking-widest italic px-4">Vault Empty: No Products Found</p>
        </div>
    );
}




function BoostModal({ product, currentCredits, onClose, onConfirm }: { 
  product: any; 
  currentCredits: number; 
  onClose: () => void; 
  onConfirm: (days: number) => void; 
}) {
  // Set default plan to 3 days
  const [days, setDays] = useState(3);

  // Tiered pricing logic: 30 days is the best value
  const getCost = (d: number) => {
    if (d === 3) return 15;   // 5 per day
    if (d === 7) return 30;   // ~4.2 per day
    if (d === 30) return 100; // ~3.3 per day
    return d * 5;
  };

  const totalCost = getCost(days);
  const hasEnough = currentCredits >= totalCost;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-accent-navy/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-6 xxs:p-8 shadow-2xl border border-gray-100 overflow-hidden relative">
        
        {/* Decorative Zap Background */}
        <Zap 
          className="absolute -right-4 -top-4 text-brand-primary/10 w-32 h-32 rotate-12 pointer-events-none" 
          strokeWidth={1}
        />

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div className="min-w-0 pr-4">
              <h3 className="text-2xl font-black text-accent-navy uppercase italic tracking-tighter leading-none">
                Boost Product
              </h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 truncate">
                {product.name}
              </p>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-gray-50 rounded-xl transition-colors group"
            >
              <XMarkIcon className="h-6 w-6 text-gray-300 group-hover:text-red-500 transition-colors" />
            </button>
          </div>

          {/* Credit Balance Badge */}
          <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100 mb-6 flex justify-between items-center">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Available Credits
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-brand-primary italic">
                {currentCredits}
              </span>
              <Zap size={18} fill="#F7931E" className="text-brand-primary animate-pulse" />
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-black text-accent-navy uppercase tracking-[0.2em] opacity-50">
              Select Growth Plan
            </p>
            
            <div className="grid grid-cols-3 gap-2 xxs:gap-3">
              {[3, 7, 30].map((d) => {
                const isSelected = days === d;
                return (
                  <button
                    key={d}
                    onClick={() => setDays(d)}
                    className={`py-4 rounded-2xl font-black transition-all border flex flex-col items-center justify-center gap-1 ${
                      isSelected 
                        ? 'bg-accent-navy text-brand-primary border-accent-navy shadow-lg scale-[1.02]' 
                        : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <span className="text-xs xxs:text-sm uppercase italic">
                      {d} Days
                    </span>
                    <span className={`text-[9px] font-bold opacity-70 ${isSelected ? 'text-brand-primary' : 'text-gray-400'}`}>
                      {getCost(d)} CR
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <div className="flex justify-between items-center px-2">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Plan Total:
              </span>
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-black italic tracking-tighter ${hasEnough ? 'text-accent-navy' : 'text-red-500'}`}>
                  {totalCost}
                </span>
                <span className="text-[10px] font-black text-gray-400 uppercase">Credits</span>
              </div>
            </div>

            {hasEnough ? (
              <button 
                onClick={() => onConfirm(days)}
                className="w-full bg-accent-navy text-brand-primary py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-opacity-90 transition-all shadow-xl flex items-center justify-center gap-3 group active:scale-[0.98]"
              >
                <RocketLaunchIcon className="h-5 w-5 group-hover:-translate-y-1 transition-transform" />
                Launch Boost
              </button>
            ) : (
              <div className="space-y-3">
                <div className="w-full bg-red-50 text-red-600 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] border border-red-100 text-center px-4">
                  Insufficient Balance
                </div>
                <Link 
                  href="/account/vendor/credit-boost"
                  className="w-full bg-brand-primary text-accent-navy py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] text-center block shadow-md active:scale-95 transition-all"
                >
                  Buy Credits Now
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Info Text */}
        <p className="mt-6 text-[8px] text-center text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
          Boosted products appear at the top of search results<br/>
          and receive 5x more customer traffic.
        </p>
      </div>
    </div>
  );
}


function dispatch(arg0: { payload: number; type: "vendor/updateCredits"; }) {
  throw new Error("Function not implemented.");
}
// function boostProduct(arg0: string, days: number) {
//   throw new Error("Function not implemented.");
// }


// function dispatch(arg0: any) {
//   throw new Error("Function not implemented.");
// }


// function updateCredits(newBalance: any): any {
//   throw new Error("Function not implemented.");
// }

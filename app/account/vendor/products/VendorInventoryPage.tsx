"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  PlusIcon, 
  PencilSquareIcon, 
  TrashIcon, 
  MagnifyingGlassIcon 
} from "@heroicons/react/24/outline";
import DashboardHeader from "@/app/_components/DashboardHeader";
import { formatNaira } from "@/app/lib/FormatNaira";

interface Product {
  id: string;
  title: string;
  slug: string;
  price: number;
  discountPrice: number | null;
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED'; 
  stock: number;
  imageUrl: string;
  category: {
    name: string;
  };
}

export default function VendorInventoryPage() {
  // 2.Use the interface in useState to stop the "never[]" error
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchMyProducts = async () => {
      try {
        const res = await fetch("/api/products?own=true");
        const data = await res.json();
        if (data.success) setProducts(data.items);
      } catch (err) {
        console.error("Failed to load inventory");
      } finally {
        setLoading(false);
      }
    };
    fetchMyProducts();
  }, []);

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-10 text-center font-bold">Loading Inventory...</div>;

  return (
    <div className="flex flex-col min-h-screen bg-neutral-light">
      <DashboardHeader 
        title="Inventory" 
        showAddButton={true}
        addButtonLabel="Add Product"
        addButtonLink="/account/vendor/products/new"
        addButtonIcon={<PlusIcon className="h-5 w-5" />}
        showLogout={true}
      />

      <div className="p-6 lg:p-10 flex-1">
        {/* STATS OVERVIEW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard label="Total Products" value={products.length} />
          <StatCard label="Active" value={products.filter(p => p.status === 'ACTIVE').length} />
          <StatCard label="Low Stock" value={products.filter(p => p.stock < 5).length} color="text-red-500" />
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center gap-4">
             <div className="relative flex-1 max-w-md">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search inventory..."
                  className="w-full pl-12 pr-4 py-3 bg-neutral-light rounded-xl outline-none focus:ring-2 ring-brand-primary/20 text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
             </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-light/50">
                  <th className="px-6 py-4 text-[10px] font-black text-neutral-gray uppercase tracking-widest">Product</th>
                  <th className="px-6 py-4 text-[10px] font-black text-neutral-gray uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-neutral-gray uppercase tracking-widest">Price</th>
                  <th className="px-6 py-4 text-[10px] font-black text-neutral-gray uppercase tracking-widest">Stock</th>
                  <th className="px-6 py-4 text-[10px] font-black text-neutral-gray uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-neutral-light/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img 
                          src={product.imageUrl} 
                          className="w-12 h-12 rounded-xl object-cover border border-gray-100" 
                          alt=""
                        />
                        <div>
                          <p className="font-bold text-accent-navy text-sm">{product.title}</p>
                          <p className="text-[10px] text-neutral-gray uppercase font-bold tracking-tighter">
                            {product.category?.name || "Uncategorized"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        product.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-accent-navy text-sm">
                      {formatNaira(product.price)}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-accent-navy">
                      {product.stock}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/account/vendor/products/edit/${product.slug}`}
                          className="p-2 hover:bg-brand-primary/10 rounded-lg text-neutral-gray hover:text-brand-primary transition-all"
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </Link>
                        <button className="p-2 hover:bg-red-50 rounded-lg text-neutral-gray hover:text-red-500 transition-all">
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}


interface StatCardProps {
  label: string;
  value: number;
  color?: string;
}

function StatCard({ label, value, color = "text-accent-navy" }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-4xl border border-gray-100 shadow-sm">
      <p className="text-[10px] font-black text-neutral-gray uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-3xl font-black ${color}`}>{value}</p>
    </div>
  );
}
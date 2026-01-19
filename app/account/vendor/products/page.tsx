// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/lib/auth";
// import DashboardHeader from "@/app/_components/DashboardHeader";
// import { Plus, Package, Edit, Trash2, ExternalLink, MoreVertical } from "lucide-react";
// import Link from "next/link";

// export default async function VendorProductsPage() {
//   const session = await getServerSession(authOptions);

//   // Mock data - This will later come from your database via Prisma/API
//   const vendorProducts = [
//     { id: "1", name: "Marvel Wireless Headphones", price: 99.99, stock: 45, status: "Published" },
//     { id: "2", name: "Classic Leather Wallet", price: 45.00, stock: 12, status: "Draft" },
//   ];

//   return (
//     <div className="flex flex-col min-h-screen">
//       {/*Using your uniform header with the Add Button enabled */}
//       <DashboardHeader 
//         title="My Products" 
//         showAddButton={true}
//         addButtonLabel="Add New Product"
//         addButtonLink="/account/vendor/products/new"
//         addButtonIcon={<Plus size={18} />}
//         showLogout={true}
//       />

//       <div className="p-4 md:p-8 animate-in fade-in duration-700">
//         <div className="bg-neutral-white rounded-4xl border border-gray-100 shadow-sm overflow-hidden">
          
//           {/* Table Header */}
//           <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-neutral-light/30">
//             <h3 className="text-sm font-black text-accent-navy uppercase tracking-widest flex items-center gap-2">
//               <Package size={18} className="text-brand-primary" /> 
//               Inventory List ({vendorProducts.length})
//             </h3>
//           </div>

//           {/* Product Table */}
//           <div className="overflow-x-auto">
//             <table className="w-full text-left border-collapse">
//               <thead>
//                 <tr className="border-b border-gray-50">
//                   <th className="px-6 py-4 text-[10px] font-black uppercase text-neutral-gray tracking-widest">Product Info</th>
//                   <th className="px-6 py-4 text-[10px] font-black uppercase text-neutral-gray tracking-widest">Status</th>
//                   <th className="px-6 py-4 text-[10px] font-black uppercase text-neutral-gray tracking-widest">Price</th>
//                   <th className="px-6 py-4 text-[10px] font-black uppercase text-neutral-gray tracking-widest">Stock</th>
//                   <th className="px-6 py-4 text-[10px] font-black uppercase text-neutral-gray tracking-widest text-right">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-50">
//                 {vendorProducts.map((product) => (
//                   <tr key={product.id} className="hover:bg-neutral-light/50 transition-colors group">
//                     <td className="px-6 py-4">
//                       <div className="flex items-center gap-3">
//                         <div className="w-12 h-12 bg-neutral-light rounded-xl flex items-center justify-center text-neutral-gray">
//                            <Package size={20} />
//                         </div>
//                         <span className="font-bold text-accent-navy text-sm">{product.name}</span>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
//                         product.status === "Published" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
//                       }`}>
//                         {product.status}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 font-bold text-accent-navy text-sm">${product.price.toFixed(2)}</td>
//                     <td className="px-6 py-4">
//                       <span className={`font-bold text-sm ${product.stock < 15 ? "text-red-500" : "text-accent-navy"}`}>
//                         {product.stock} Units
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 text-right">
//                       <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
//                         <button className="p-2 text-neutral-gray hover:text-brand-primary hover:bg-brand-light rounded-lg transition-all">
//                           <Edit size={16} />
//                         </button>
//                         <button className="p-2 text-neutral-gray hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
//                           <Trash2 size={16} />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }




"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Plus, 
  Package, 
  Edit, 
  Trash2, 
  Search, 
  AlertCircle,
  Loader2
} from "lucide-react";
import DashboardHeader from "@/app/_components/DashboardHeader";
import { formatNaira } from "@/app/lib/FormatNaira";

//Type Definition to prevent "Type Mismatch" errors
interface Product {
  id: string;
  title: string;
  price: number;
  stock: number;
  status: "ACTIVE" | "DRAFT" | "ARCHIVED";
  category?: { name: string };
  images?: { url: string }[];
}

export default function VendorProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await fetch("/api/products?own=true");
        const data = await res.json();
        if (data.success) {
          setProducts(data.items);
        }
      } catch (err) {
        console.error("Fetch inventory failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  // 2. 🔹 Handle Deletion
  const handleDelete = async (productId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/products?id=${productId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        // Remove from UI instantly
        setProducts((prev) => prev.filter((p) => p.id !== productId));
      } else {
        alert(data.message || "Delete failed");
      }
    } catch (err) {
      alert("An error occurred during deletion.");
    }
  };

  // Live Filter Logic
  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-neutral-light">
      <DashboardHeader 
        title="My Inventory" 
        showAddButton={true}
        addButtonLabel="Add New Product"
        addButtonLink="/account/vendor/products/new"
        addButtonIcon={<Plus size={18} />}
        showLogout={true}
      />

      <div className="p-4 md:p-8 animate-in fade-in duration-700">
        
        {/* STATS OVERVIEW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard label="Total Items" value={products.length} />
          <StatCard label="Live on Store" value={products.filter(p => p.status === 'ACTIVE').length} color="text-green-600" />
          <StatCard label="Low Stock" value={products.filter(p => p.stock < 5).length} color="text-red-500" />
        </div>

        <div className="bg-neutral-white rounded-4xl border border-gray-100 shadow-sm overflow-hidden bg-white">
          
          {/* SEARCH BAR SECTION */}
          <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-neutral-light/10">
            <h3 className="text-sm font-black text-accent-navy uppercase tracking-widest flex items-center gap-2">
              <Package size={18} className="text-brand-primary" /> 
              Products List
            </h3>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-gray" size={16} />
              <input 
                type="text"
                placeholder="Search by title..."
                className="w-full pl-10 pr-4 py-2 bg-neutral-light rounded-xl text-sm outline-none focus:ring-2 ring-brand-primary/20 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center p-20 gap-3 text-neutral-gray font-bold">
                <Loader2 className="animate-spin" /> Loading Inventory...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-20 text-center">
                <AlertCircle className="mx-auto text-neutral-gray mb-4" size={48} />
                <p className="text-neutral-gray font-bold">No products found matching your search.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-50 bg-neutral-light/30">
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-neutral-gray tracking-widest">Product Info</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-neutral-gray tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-neutral-gray tracking-widest">Price</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-neutral-gray tracking-widest">Stock</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-neutral-gray tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-neutral-light/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-neutral-light rounded-xl overflow-hidden flex items-center justify-center text-neutral-gray border border-gray-100">
                             {product.images?.[0] ? (
                               <img src={product.images[0].url} alt="" className="w-full h-full object-cover" />
                             ) : (
                               <Package size={20} />
                             )}
                          </div>
                          <div>
                            <span className="font-bold text-accent-navy text-sm block leading-tight">{product.title}</span>
                            <span className="text-[10px] text-neutral-gray font-black uppercase tracking-tighter">
                              {product.category?.name || "Uncategorized"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                          product.status === "ACTIVE" ? "bg-green-100 text-green-700" : 
                          product.status === "DRAFT" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500"
                        }`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-accent-navy text-sm">
                        {formatNaira(product.price)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${product.stock < 5 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                          <span className={`font-bold text-sm ${product.stock < 5 ? "text-red-500" : "text-accent-navy"}`}>
                            {product.stock} Units
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link 
                            href={`/account/vendor/products/edit/${product.id}`}
                            className="p-2 text-neutral-gray hover:text-brand-primary hover:bg-brand-light rounded-lg transition-all"
                          >
                            <Edit size={16} />
                          </Link>
                          <button 
                            onClick={() => handleDelete(product.id, product.title)}
                            className="p-2 text-neutral-gray hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Small Helper Component for Stats
function StatCard({ label, value, color = "text-accent-navy" }: { label: string, value: number, color?: string }) {
  return (
    <div className="bg-white p-6 rounded-4xl border border-gray-100 shadow-sm transition-transform hover:scale-[1.02]">
      <p className="text-[10px] font-black text-neutral-gray uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-3xl font-black ${color}`}>{value}</p>
    </div>
  );
}
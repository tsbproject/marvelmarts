


// "use client";

// import React, { useEffect, useState } from "react";
// import Link from "next/link";
// import { 
//   PlusIcon, 
//   PencilSquareIcon, 
//   TrashIcon, 
//   MagnifyingGlassIcon,
//   ArchiveBoxIcon
// } from "@heroicons/react/24/outline";
// import DashboardHeader from "@/app/_components/DashboardHeader";
// import { formatNaira } from "@/app/lib/FormatNaira";
// import { useNotification } from "@/app/_context/NotificationContext"; 

// interface Product {
//   id: string;
//   name: string;
//   slug: string;
//   price: number;
//   discountPrice: number | null;
//   status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED'; 
//   stock: number;
//   imageUrl: string;
//   category: {
//     name: string;
//   };
// }

// export default function VendorInventoryPage() {
//   // Using your specific context hook
//   const { notifySuccess, notifyError } = useNotification();
  
//   const [products, setProducts] = useState<Product[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");

//   useEffect(() => {
//     const fetchMyProducts = async () => {
//       try {
//         const res = await fetch("/api/vendors/products");
//         const data = await res.json();
//         if (data.success) {
//           setProducts(data.items);
//         } else {
//           notifyError(data.message || "Could not load inventory");
//         }
//       } catch (err) {
//         notifyError("Failed to connect to server");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchMyProducts();
//   }, []); // Removed notifyError from deps to prevent unnecessary re-runs

//   const handleDelete = async (productId: string, name: string) => {
//     if (!confirm(`Permanently delete ${name}?`)) return;

//     try {
//       // Points to the vendor-specific delete logic
//       const res = await fetch(`/api/vendors/products?id=${productId}`, { 
//         method: "DELETE" 
//       });
//       const data = await res.json();

//       if (data.success) {
//         setProducts(prev => prev.filter(p => p.id !== productId));
//         notifySuccess(`${name} removed from inventory`);
//       } else {
//         notifyError(data.message || "Delete failed");
//       }
//     } catch (err) {
//       notifyError("An error occurred during deletion");
//     }
//   };

//  const filteredProducts = products.filter((p) =>
//   (p.name || "").toLowerCase().includes(search.toLowerCase())
// );

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen font-black uppercase tracking-tighter text-indigo-600 animate-pulse">
//         Loading MarvelMarts Inventory...
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col min-h-screen bg-neutral-light">
//       <DashboardHeader 
//         title="Inventory" 
//         showAddButton={true}
//         addButtonLabel="Add Product"
//         addButtonLink="/account/vendors/products/new"
//         addButtonIcon={<PlusIcon className="h-5 w-5" />}
//         showLogout={true}
//       />

//       <div className="p-6 lg:p-10 flex-1 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
//         {/* STATS OVERVIEW */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//           <StatCard label="Total Products" value={products.length} />
//           <StatCard label="Active" value={products.filter(p => p.status === 'ACTIVE').length} color="text-green-600" />
//           <StatCard label="Low Stock" value={products.filter(p => p.stock < 5).length} color="text-red-500" />
//         </div>

//         {/* TABLE CONTAINER */}
//         <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
//           <div className="p-6 border-b border-gray-50 flex items-center gap-4 bg-gray-50/30">
//              <div className="relative flex-1 max-w-md">
//                 <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
//                 <input 
//                   type="text" 
//                   placeholder="Search your store..."
//                   className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 ring-indigo-500/20 text-sm transition-all"
//                   value={search}
//                   onChange={(e) => setSearch(e.target.value)}
//                 />
//              </div>
//           </div>

//           <div className="overflow-x-auto">
//             <table className="w-full text-left border-collapse">
//               <thead>
//                 <tr className="bg-gray-50/50">
//                   <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Product</th>
//                   <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
//                   <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Price</th>
//                   <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Stock</th>
//                   <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-50">
//                 {filteredProducts.length === 0 ? (
//                   <tr>
//                     <td colSpan={5} className="py-20 text-center">
//                       <ArchiveBoxIcon className="h-12 w-12 mx-auto text-gray-200 mb-4" />
//                       <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">No products found</p>
//                     </td>
//                   </tr>
//                 ) : (
//                   filteredProducts.map((product) => (
//                     <tr key={product.id} className="hover:bg-gray-50/30 transition-colors group">
//                       <td className="px-6 py-4">
//                         <div className="flex items-center gap-4">
//                           <img 
//                             src={product.imageUrl || "/placeholder-product.png"} 
//                             className="w-12 h-12 rounded-2xl object-cover border border-gray-100 shadow-sm" 
//                             alt={product.name}
//                           />
//                           <div>
//                             <p className="font-bold text-slate-900 text-sm">{product.name}</p>
//                             <p className="text-[10px] text-gray-400 uppercase font-black tracking-tighter">
//                               {product.category?.name || "Uncategorized"}
//                             </p>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
//                           product.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
//                         }`}>
//                           {product.status}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 font-bold text-slate-900 text-sm">
//                         {formatNaira(product.price)}
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="flex items-center gap-2">
//                           <div className={`w-1.5 h-1.5 rounded-full ${product.stock < 5 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
//                           <span className={`text-sm font-bold ${product.stock < 5 ? 'text-red-500' : 'text-slate-700'}`}>
//                             {product.stock}
//                           </span>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 text-right">
//                         <div className="flex items-center justify-end gap-2 md:opacity-0 group-hover:opacity-100 transition-all duration-300">
//                           <Link 
//                             href={`/account/vendor/products/edit/${product.id}`}
//                             className="p-2 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-indigo-600 hover:border-indigo-100 hover:shadow-sm transition-all"
//                           >
//                             <PencilSquareIcon className="h-5 w-5" />
//                           </Link>
//                           <button 
//                             onClick={() => handleDelete(product.id, product.name)}
//                             className="p-2 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-red-500 hover:border-red-100 hover:shadow-sm transition-all"
//                           >
//                             <TrashIcon className="h-5 w-5" />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function StatCard({ label, value, color = "text-slate-900" }: { label: string; value: number; color?: string }) {
//   return (
//     <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
//       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
//       <p className={`text-3xl font-black ${color}`}>{value}</p>
//     </div>
//   );
// }



"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  PlusIcon, 
  PencilSquareIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  ArchiveBoxIcon,
  EyeIcon
} from "@heroicons/react/24/outline";
import DashboardHeader from "@/app/_components/DashboardHeader";
import { formatNaira } from "@/app/lib/FormatNaira";
import { useNotification } from "@/app/_context/NotificationContext"; 

interface Product {
  id: string;
  name: string;
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
  const { notifySuccess, notifyError } = useNotification();
  
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
      <div className="flex items-center justify-center min-h-screen font-black uppercase tracking-tighter text-indigo-600 animate-pulse">
        Loading MarvelMarts Inventory...
      </div>
    );
  }

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

      <div className="p-6 lg:p-10 flex-1 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* STATS OVERVIEW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard label="Total Products" value={products.length} />
          <StatCard label="Active" value={products.filter(p => p.status === 'ACTIVE').length} color="text-green-600" />
          <StatCard label="Low Stock" value={products.filter(p => p.stock < 5).length} color="text-red-500" />
        </div>

        {/* TABLE CONTAINER */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center gap-4 bg-gray-50/30">
             <div className="relative flex-1 max-w-md">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search your store..."
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 ring-indigo-500/20 text-sm transition-all"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
             </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Product</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Price</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Stock</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <ArchiveBoxIcon className="h-12 w-12 mx-auto text-gray-200 mb-4" />
                      <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">No products found</p>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <img 
                            src={product.imageUrl || "/placeholder-product.png"} 
                            className="w-12 h-12 rounded-2xl object-cover border border-gray-100 shadow-sm" 
                            alt={product.name}
                          />
                          <div>
                            <Link 
                              href={`/products/${product.slug}`}
                              target="_blank"
                              className="font-bold text-slate-900 text-sm hover:text-indigo-600 transition-colors"
                            >
                              {product.name}
                            </Link>
                            <p className="text-[10px] text-gray-400 uppercase font-black tracking-tighter">
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
                      <td className="px-6 py-4 font-bold text-slate-900 text-sm">
                        {formatNaira(product.price)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${product.stock < 5 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                          <span className={`text-sm font-bold ${product.stock < 5 ? 'text-red-500' : 'text-slate-700'}`}>
                            {product.stock}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 md:opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <Link 
                            href={`/products/${product.slug}`}
                            target="_blank"
                            className="p-2 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-green-600 hover:border-green-100 hover:shadow-sm transition-all"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </Link>
                          <Link 
                            href={`/account/vendor/products/edit/${product.id}`}
                            className="p-2 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-indigo-600 hover:border-indigo-100 hover:shadow-sm transition-all"
                          >
                            <PencilSquareIcon className="h-5 w-5" />
                          </Link>
                          <button 
                            onClick={() => handleDelete(product.id, product.name)}
                            className="p-2 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-red-500 hover:border-red-100 hover:shadow-sm transition-all"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color = "text-slate-900" }: { label: string; value: number; color?: string }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-3xl font-black ${color}`}>{value}</p>
    </div>
  );
}
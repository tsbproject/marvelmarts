


// "use client";

// import { useEffect, useMemo, useState } from "react";
// import Link from "next/link";
// import { useSearchParams, useRouter } from "next/navigation";
// import DashboardHeader from "@/app/_components/DashboardHeader";
// import { useNotification } from "@/app/_context/NotificationContext";
// import { 
//   Edit, 
//   Trash2, 
//   Eye, 
//   Search, 
//   ChevronLeft, 
//   ChevronRight, 
//   Package, 
//   AlertCircle 
// } from "lucide-react";

// interface Product {
//   id: string;
//   slug: string;
//   title: string;
//   price: number;
//   status: "ACTIVE" | "DRAFT" | "ARCHIVED";
//   stock: number;
//   lowStockThreshold: number;
//   category?: { name: string };
//   images: { url: string }[];
// }

// interface ProductResponse {
//   success?: boolean;
//   message?: string;
//   items?: Product[];
//   total?: number;
// }

// export default function ProductsPage() {
//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const { notifySuccess, notifyError, notifyInfo } = useNotification();

//   // URL State
//   const page = Number(searchParams.get("page")) || 1;
//   const pageSize = Number(searchParams.get("pageSize")) || 10;
//   const search = (searchParams.get("search") || "").trim();

//   // Data State
//   const [products, setProducts] = useState<Product[]>([]);
//   const [total, setTotal] = useState(0);
//   const [loading, setLoading] = useState(false);

//   // Selection & UI State
//   const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
//   const [deleting, setDeleting] = useState(false);

//   const queryString = useMemo(() => {
//     const q = new URLSearchParams({
//       page: String(page),
//       pageSize: String(pageSize),
//       search,
//     });
//     return q.toString();
//   }, [page, pageSize, search]);

//   useEffect(() => {
//     let cancelled = false;
//     async function load() {
//       setLoading(true);
//       try {
//         const res = await fetch(`/api/products?${queryString}`);
//         const data: ProductResponse = await res.json();
//         if (!res.ok || data.success === false) throw new Error(data.message);
        
//         if (!cancelled) {
//           setProducts(data.items || []);
//           setTotal(data.total || 0);
//         }
//       } catch (err) {
//         if (!cancelled) notifyError(err instanceof Error ? err.message : "Fetch failed");
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     }
//     load();
//     return () => { cancelled = true; };
//   }, [queryString, notifyError]);

//   const formatPrice = (n: number) => 
//     new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(n);

//   const toggleSelect = (id: string) => {
//     setSelectedIds((prev) => {
//       const next = new Set(prev);
//       next.has(id) ? next.delete(id) : next.add(id);
//       return next;
//     });
//   };

//   const toggleSelectAll = (ids: string[]) => {
//     setSelectedIds((prev) => 
//       ids.every(id => prev.has(id)) ? new Set() : new Set(ids)
//     );
//   };


//   const handleBulkDelete = async () => {
//   // selectedIds would be your state array: ['id1', 'id2', ...]
//   if (selectedIds.size === 0) return;

//   const idsQuery = Array.from(selectedIds).join(",");
  
//   const res = await fetch(`/api/products?ids=${idsQuery}`, {
//     method: "DELETE",
//   });

//   if (res.ok) {
//     // Refresh your list or clear selection state
//     console.log("Bulk delete successful");
//   }
// };

//   async function deleteProducts(ids: string[]) {
//     if (!confirm(`Permanently delete ${ids.length} item(s)?`)) return;
//     setDeleting(true);
//     try {
//       const res = await fetch("/api/products", {
//         method: "DELETE",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ ids }),
//       });
//       const data = await res.json();
//       if (!res.ok || data.success === false) throw new Error(data.message);

//       setProducts(prev => prev.filter(p => !ids.includes(p.id)));
//       setSelectedIds(new Set());
//       setTotal(t => t - ids.length);
//       notifySuccess("Deleted successfully");
//     } catch (err) {
//       notifyError(err instanceof Error ? err.message : "Delete failed");
//     } finally {
//       setDeleting(false);
//     }
//   }

//   const totalPages = Math.max(1, Math.ceil(total / pageSize));

//   return (
//     <div className="w-full max-w-screen-xl mx-auto px-4 py-8">
//       <DashboardHeader
//         title="Inventory"
//         showLogout={false}
//         showAddButton
//         addButtonLabel="New Product"
//         addButtonLink="/dashboard/admins/products/new"
//       />

//       {/* Toolbar: Search + Bulk Actions */}
//       <div className="mt-6 flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border shadow-sm">
//         <form onSubmit={(e) => {
//           e.preventDefault();
//           const val = new FormData(e.currentTarget).get("search");
//           router.push(`/dashboard/admins/products?page=1&search=${val}`);
//         }} className="relative w-full md:w-96">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
//           <input
//             name="search"
//             defaultValue={search}
//             placeholder="Search by name or SKU..."
//             className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
//           />
//         </form>

//         {selectedIds.size > 0 && (
//           <button
//             onClick={() => deleteProducts(Array.from(selectedIds))}
//             disabled={deleting}
//             className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
//           >
//             <Trash2 size={18} />
//             Delete Selected ({selectedIds.size})
//           </button>
//         )}
//       </div>

//       {/* Table Section */}
//       <div className="mt-6 bg-white border rounded-xl overflow-hidden shadow-sm">
//         {loading ? (
//           <div className="h-64 flex items-center justify-center">
//             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//           </div>
//         ) : products.length > 0 ? (
//           <div className="overflow-x-auto">
//             <table className="w-full text-left border-collapse">
//               <thead>
//                 <tr className="bg-gray-50 border-b text-gray-600 text-sm uppercase tracking-wider">
//                   <th className="px-6 py-4">
//                     <input
//                       type="checkbox"
//                       className="rounded border-gray-300"
//                       onChange={() => toggleSelectAll(products.map(p => p.id))}
//                       checked={products.length > 0 && products.every(p => selectedIds.has(p.id))}
//                     />
//                   </th>
//                   <th className="px-6 py-4 font-semibold">Product</th>
//                   <th className="px-6 py-4 font-semibold text-center">Stock</th>
//                   <th className="px-6 py-4 font-semibold">Price</th>
//                   <th className="px-6 py-4 font-semibold">Status</th>
//                   <th className="px-6 py-4 font-semibold text-right">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y">
//                 {products.map((p) => (
//                   <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
//                     <td className="px-6 py-4">
//                       <input
//                         type="checkbox"
//                         checked={selectedIds.has(p.id)}
//                         onChange={() => toggleSelect(p.id)}
//                         className="rounded border-gray-300"
//                       />
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="flex items-center gap-4">
//                         <div className="h-12 w-12 rounded-lg bg-gray-100 border overflow-hidden shrink-0">
//                           {p.images?.[0] ? (
//                             <img src={p.images[0].url} className="w-full h-full object-cover" alt="" />
//                           ) : (
//                             <Package className="w-full h-full p-3 text-gray-400" />
//                           )}
//                         </div>
//                         <div>
//                           <div className="font-medium text-gray-900 line-clamp-1">{p.title}</div>
//                           <div className="text-xs text-gray-500 uppercase">{p.category?.name || "No Category"}</div>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 text-center">
//                       <div className="flex flex-col items-center">

                        
//                         <span className={`font-semibold ${p.stock <= (p.lowStockThreshold || 5) ? 'text-red-600' : 'text-gray-700'}`}>
//                           {p.stock}
//                         </span>
//                         {p.stock <= (p.lowStockThreshold || 5) && (
//                           <span className="text-[10px] text-red-500 flex items-center gap-1 font-bold">
//                             <AlertCircle size={10} /> LOW
//                           </span>
//                         )}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 font-medium text-gray-700">{formatPrice(p.price)}</td>
//                     <td className="px-6 py-4">
//                       <span className={`px-2.5 py-1 rounded-full text-xs font-bold ring-1 ring-inset ${
//                         p.status === 'ACTIVE' ? 'bg-green-50 text-green-700 ring-green-600/20' : 
//                         p.status === 'DRAFT' ? 'bg-gray-50 text-gray-600 ring-gray-500/10' : 
//                         'bg-red-50 text-red-700 ring-red-600/20'
//                       }`}>
//                         {p.status}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 text-right">
//                       <div className="flex justify-end gap-2">

//                         {/* VIEW / PREVIEW */}
//                           <Link 
//                             href={`/dashboard/admins/products/${p.slug}`} 
//                             className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
//                             title="View Details"
//                           >
//                             <Eye size={18} />
//                           </Link>
//                         <Link href={`/dashboard/admins/products/${p.slug}/edit`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
//                           <Edit size={18} />
//                         </Link>
//                         <button onClick={() => deleteProducts([p.id])} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
//                           <Trash2 size={18} />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         ) : (
//           <div className="h-64 flex flex-col items-center justify-center text-gray-500">
//             <Package size={48} className="mb-2 opacity-20" />
//             <p>No products found matching your search.</p>
//           </div>
//         )}

//         {/* Improved Pagination Bar */}
//         <div className="bg-gray-50 px-6 py-4 border-t flex items-center justify-between">
//           <p className="text-sm text-gray-600">
//             Showing <span className="font-medium">{products.length}</span> of <span className="font-medium">{total}</span> products
//           </p>
//           <div className="flex gap-2">
//             <button
//               disabled={page <= 1}
//               onClick={() => router.push(`/dashboard/admins/products?page=${page - 1}&search=${search}`)}
//               className="p-2 border rounded bg-white hover:bg-gray-50 disabled:opacity-50 transition-all"
//             >
//               <ChevronLeft size={20} />
//             </button>
//             <div className="flex items-center px-4 text-sm font-medium text-gray-700">
//               Page {page} of {totalPages}
//             </div>
//             <button
//               disabled={page >= totalPages}
//               onClick={() => router.push(`/dashboard/admins/products?page=${page + 1}&search=${search}`)}
//               className="p-2 border rounded bg-white hover:bg-gray-50 disabled:opacity-50 transition-all"
//             >
//               <ChevronRight size={20} />
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import DashboardHeader from "@/app/_components/DashboardHeader";
import { useNotification } from "@/app/_context/NotificationContext";
import { 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Package, 
  AlertCircle 
} from "lucide-react";

interface Product {
  id: string;
  slug: string;
  title: string;
  price: number;
  status: "ACTIVE" | "DRAFT" | "ARCHIVED";
  stock: number;
  lowStockThreshold: number;
  category?: { name: string };
  images: { url: string }[];
  createdAt: string; // Added for the New badge logic
}

interface ProductResponse {
  success?: boolean;
  message?: string;
  items?: Product[];
  total?: number;
}

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { notifySuccess, notifyError } = useNotification();

  // URL State
  const page = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("pageSize")) || 10;
  const search = (searchParams.get("search") || "").trim();

  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Selection & UI State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  const queryString = useMemo(() => {
    const q = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      search,
    });
    return q.toString();
  }, [page, pageSize, search]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/products?${queryString}`);
        const data: ProductResponse = await res.json();
        if (!res.ok || data.success === false) throw new Error(data.message);
        
        if (!cancelled) {
          setProducts(data.items || []);
          setTotal(data.total || 0);
        }
      } catch (err) {
        if (!cancelled) notifyError(err instanceof Error ? err.message : "Fetch failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [queryString, notifyError]);

  const formatPrice = (n: number) => 
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(n);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = (ids: string[]) => {
    setSelectedIds((prev) => 
      ids.every(id => prev.has(id)) ? new Set() : new Set(ids)
    );
  };

  async function deleteProducts(ids: string[]) {
    if (!confirm(`Permanently delete ${ids.length} item(s)?`)) return;
    setDeleting(true);
    try {
      const idsQuery = ids.join(",");
      const res = await fetch(`/api/products?ids=${idsQuery}`, {
        method: "DELETE",
      });
      
      const data = await res.json();
      if (!res.ok || data.success === false) throw new Error(data.message);

      setProducts(prev => prev.filter(p => !ids.includes(p.id)));
      setSelectedIds(new Set());
      setTotal(t => t - ids.length);
      notifySuccess(`Successfully deleted ${ids.length} product(s)`);
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="w-full max-w-screen-xl mx-auto px-4 py-8">
      <DashboardHeader
        title="Inventory"
        showLogout={false}
        showAddButton
        addButtonLabel="New Product"
        addButtonLink="/dashboard/admins/products/new"
      />

      {/* Toolbar: Search + Bulk Actions */}
      <div className="mt-6 flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border shadow-sm">
        <form onSubmit={(e) => {
          e.preventDefault();
          const val = new FormData(e.currentTarget).get("search");
          router.push(`/dashboard/admins/products?page=1&search=${val}`);
        }} className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            name="search"
            defaultValue={search}
            placeholder="Search by name or SKU..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </form>

        {selectedIds.size > 0 && (
          <button
            onClick={() => deleteProducts(Array.from(selectedIds))}
            disabled={deleting}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            <Trash2 size={18} />
            Delete Selected ({selectedIds.size})
          </button>
        )}
      </div>

      {/* Table Section */}
      <div className="mt-6 bg-white border rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b text-gray-600 text-sm uppercase tracking-wider">
                  <th className="px-6 py-4">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 cursor-pointer"
                      onChange={() => toggleSelectAll(products.map(p => p.id))}
                      checked={products.length > 0 && products.every(p => selectedIds.has(p.id))}
                    />
                  </th>
                  <th className="px-6 py-4 font-semibold">Product</th>
                  <th className="px-6 py-4 font-semibold text-center">Stock</th>
                  <th className="px-6 py-4 font-semibold">Price</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((p) => {
                  const isNew = new Date(p.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000);
                  
                  return (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(p.id)}
                          onChange={() => toggleSelect(p.id)}
                          className="rounded border-gray-300 cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-lg bg-gray-100 border overflow-hidden shrink-0">
                            {p.images?.[0] ? (
                              <img src={p.images[0].url} className="w-full h-full object-cover" alt="" />
                            ) : (
                              <Package className="w-full h-full p-3 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="font-medium text-gray-900 line-clamp-1">{p.title}</div>
                              {isNew && (
                                <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider animate-pulse">
                                  New
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 uppercase">{p.category?.name || "No Category"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className={`font-semibold ${p.stock <= (p.lowStockThreshold || 5) ? 'text-red-600' : 'text-gray-700'}`}>
                            {p.stock}
                          </span>
                          {p.stock <= (p.lowStockThreshold || 5) && (
                            <span className="text-[10px] text-red-500 flex items-center gap-1 font-bold">
                              <AlertCircle size={10} /> LOW
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-700">{formatPrice(p.price)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ring-1 ring-inset ${
                          p.status === 'ACTIVE' ? 'bg-green-50 text-green-700 ring-green-600/20' : 
                          p.status === 'DRAFT' ? 'bg-gray-50 text-gray-600 ring-gray-500/10' : 
                          'bg-red-50 text-red-700 ring-red-600/20'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link 
                            href={`/dashboard/admins/products/${p.slug}`} 
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </Link>
                          <Link href={`/dashboard/admins/products/${p.slug}/edit`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Edit size={18} />
                          </Link>
                          <button 
                            disabled={deleting}
                            onClick={() => deleteProducts([p.id])} 
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-gray-500">
            <Package size={48} className="mb-2 opacity-20" />
            <p>No products found matching your search.</p>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="bg-gray-50 px-6 py-4 border-t flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing <span className="font-medium">{products.length}</span> of <span className="font-medium">{total}</span> products
          </p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => router.push(`/dashboard/admins/products?page=${page - 1}&search=${search}`)}
              className="p-2 border rounded bg-white hover:bg-gray-50 disabled:opacity-50 transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center px-4 text-sm font-medium text-gray-700">
              Page {page} of {totalPages}
            </div>
            <button
              disabled={page >= totalPages}
              onClick={() => router.push(`/dashboard/admins/products?page=${page + 1}&search=${search}`)}
              className="p-2 border rounded bg-white hover:bg-gray-50 disabled:opacity-50 transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

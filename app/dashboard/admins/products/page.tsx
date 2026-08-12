"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, useRouter } from "next/navigation";
import DashboardHeader from "@/app/_components/DashboardHeader";
import { useNotification } from "@/app/_context/NotificationContext";
import { RootState, AppDispatch } from "@/store";
import { setProducts, setLoading, bulkUpdateProductGroup } from "@/store/productSlice";
import { 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Package, 
  Filter,
  User,
  Globe
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
  vendor?: { name: string }; 
  images: { url: string }[];
  createdAt: string;
  isFeatured?: boolean;
  isFlashSale?: boolean;
  isNewArrival?: boolean;
}

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { notifySuccess, notifyError } = useNotification();
  const dispatch = useDispatch<AppDispatch>();

  // REDUX STATE
  const { items: products, total, loading } = useSelector((state: RootState) => state.products);

  // SEARCH & FILTER PARAMS
  const page = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("pageSize")) || 10;
  const search = (searchParams.get("search") || "").trim();
  const searchType = searchParams.get("searchType") || "all"; 
  const filter = searchParams.get("filter") || "all"; 

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isAllSelectedGlobal, setIsAllSelectedGlobal] = useState(false);
  const [processing, setProcessing] = useState(false);

  const queryString = useMemo(() => {
    const q = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      search,
      searchType,
      filter
    });
    return q.toString();
  }, [page, pageSize, search, searchType, filter]);

  // Reset local selection when filters change
  useEffect(() => {
    setSelectedIds(new Set());
    setIsAllSelectedGlobal(false);
  }, [search, searchType, filter]);

  // LOAD DATA INTO REDUX
  useEffect(() => {
    let cancelled = false;
    async function load() {
      dispatch(setLoading(true));
      try {
        const res = await fetch(`/api/products?${queryString}`);
        const data = await res.json();
        
        if (!res.ok || data.success === false) throw new Error(data.message);
        
        if (!cancelled) {
          dispatch(setProducts({
            items: data.items || [],
            total: data.total || 0
          }));
        }
      } catch (err) {
        if (!cancelled) notifyError(err instanceof Error ? err.message : "Fetch failed");
      } finally {
        if (!cancelled) dispatch(setLoading(false));
      }
    }
    load();
    return () => { cancelled = true; };
  }, [queryString, dispatch, notifyError]);

  const updateFilters = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    Object.entries(updates).forEach(([key, val]) => {
      if (val) params.set(key, val);
      else params.delete(key);
    });
    router.push(`/dashboard/admins/products?${params.toString()}`);
  };

  // REDUX BULK TOGGLE UPDATE
  const handleBulkUpdate = async (type: string) => {
    if (!type) return;
    setProcessing(true);
    try {
      const resultAction = await dispatch(bulkUpdateProductGroup({ 
        ids: Array.from(selectedIds), 
        updateType: type,
        applyToAll: isAllSelectedGlobal,
        filters: { search, searchType, filter }
      }));

      if (bulkUpdateProductGroup.fulfilled.match(resultAction)) {
        notifySuccess(`Successfully updated ${isAllSelectedGlobal ? total : selectedIds.size} products`);
        setSelectedIds(new Set());
        setIsAllSelectedGlobal(false);
      } else {
        throw new Error("Bulk update failed");
      }
    } catch (err) {
      notifyError("Update failed");
    } finally {
      setProcessing(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    setIsAllSelectedGlobal(false);
  };

  const toggleSelectAllPage = (ids: string[]) => {
    if (ids.every(id => selectedIds.has(id))) {
      setSelectedIds(new Set());
      setIsAllSelectedGlobal(false);
    } else {
      setSelectedIds(new Set(ids));
    }
  };

  async function deleteProducts(ids: string[]) {
    if (!confirm(`Permanently delete ${ids.length} item(s)?`)) return;
    setProcessing(true);
    try {
      const idsQuery = ids.join(",");
      const res = await fetch(`/api/products?ids=${idsQuery}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      
      router.refresh(); 
      setSelectedIds(new Set());
      setIsAllSelectedGlobal(false);
      notifySuccess(`Deleted ${ids.length} product(s)`);
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setProcessing(false);
    }
  }

  const formatPrice = (n: number) => 
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(n);
  
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const isPageSelected = products.length > 0 && products.every(p => selectedIds.has(p.id));

  return (
    <div className="w-full max-w-screen-xl mx-auto px-4 py-8">
      <DashboardHeader
        title="Inventory"
        showLogout={false}
        showAddButton
        addButtonLabel="New Product"
        addButtonLink="/dashboard/admins/products/new"
      />

      {/* Professional Toolbar */}
      <div className="mt-6 flex flex-col gap-4 bg-white p-5 rounded-xl border shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              updateFilters({
                search: formData.get("search") as string,
                searchType: formData.get("searchType") as string
              });
            }} 
            className="flex w-full md:w-auto items-center gap-2"
          >
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                name="search"
                defaultValue={search}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
            <select 
              name="searchType"
              defaultValue={searchType}
              className="px-3 py-2.5 border rounded-lg bg-gray-50 text-xs font-bold uppercase outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Fields</option>
              <option value="title">Product Name</option>
              <option value="category">Category</option>
              <option value="vendor">Vendor</option>
            </select>
          </form>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-gray-50">
              <Filter size={16} className="text-gray-500" />
              <select 
                value={filter}
                onChange={(e) => updateFilters({ filter: e.target.value })}
                className="bg-transparent text-xs font-black uppercase tracking-widest outline-none cursor-pointer"
              >
                <option value="all">All Inventory</option>
                <option value="featured">Featured Products</option>
                <option value="new">New Arrivals</option>
                <option value="flash">Flash Sales</option>
              </select>
            </div>

            {(selectedIds.size > 0 || isAllSelectedGlobal) && (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                <div className="h-8 w-[1px] bg-gray-200 mx-1 hidden md:block" />
                <select 
                  disabled={processing}
                  value=""
                  onChange={(e) => handleBulkUpdate(e.target.value)}
                  className="px-3 py-2 bg-accent-navy text-white rounded-lg text-xs font-black uppercase tracking-widest outline-none cursor-pointer disabled:opacity-50"
                >
                  <option value="" disabled>Manage Grouping...</option>
                  <option value="isFeatured">Toggle Featured</option>
                  <option value="isNewArrival">Toggle New Arrival</option>
                  <option value="isFlashSale">Toggle Flash Sale</option>
                </select>

                {!isAllSelectedGlobal && (
                  <button
                    onClick={() => deleteProducts(Array.from(selectedIds))}
                    disabled={processing}
                    className="p-2.5 bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                    title="Delete Selected"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Global Selection Banner */}
      {isPageSelected && total > products.length && (
        <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-center justify-center gap-2 animate-in slide-in-from-top-2">
          <Globe size={14} className="text-blue-600" />
          <span className="text-xs font-bold text-blue-800">
            {isAllSelectedGlobal 
              ? `All ${total} products in this view are selected.` 
              : `All ${products.length} products on this page are selected.`}
          </span>
          <button 
            onClick={() => setIsAllSelectedGlobal(!isAllSelectedGlobal)}
            className="text-xs font-black uppercase tracking-tighter text-blue-600 hover:underline"
          >
            {isAllSelectedGlobal ? "Clear Selection" : `Select all ${total} products`}
          </button>
        </div>
      )}

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
                <tr className="bg-gray-50 border-b text-gray-600 text-[10px] font-black uppercase tracking-widest">
                  <th className="px-6 py-4 w-10">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 cursor-pointer"
                      onChange={() => toggleSelectAllPage(products.map(p => p.id))}
                      checked={isPageSelected || isAllSelectedGlobal}
                    />
                  </th>
                  <th className="px-6 py-4">Product Info</th>
                  <th className="px-6 py-4">Vendor</th>
                  <th className="px-6 py-4 text-center">Stock</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((p) => {
                  const isRecent = new Date(p.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000; 
                  const isSelected = selectedIds.has(p.id) || isAllSelectedGlobal;
                  
                  return (
                    <tr key={p.id} className={`transition-colors ${isSelected ? 'bg-blue-50/30' : 'hover:bg-gray-50/50'}`}>
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(p.id)}
                          className="rounded border-gray-300 cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-lg bg-gray-50 border overflow-hidden shrink-0 relative">
                            {p.images?.[0] ? (
                              <img src={p.images[0].url} className="w-full h-full object-contain p-1" alt="" />
                            ) : (
                              <Package className="w-full h-full p-3 text-gray-300" />
                            )}
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-accent-navy text-sm">{p.title}</span>
                              {p.isFeatured && (
                                <span className="bg-yellow-100 text-yellow-700 text-[9px] font-black px-1.5 py-0.5 rounded uppercase">Featured</span>
                              )}
                              {p.isFlashSale && (
                                <span className="bg-orange-100 text-orange-700 text-[9px] font-black px-1.5 py-0.5 rounded uppercase">Flash</span>
                              )}
                              {(p.isNewArrival || isRecent) && (
                                <span className="bg-blue-100 text-blue-700 text-[9px] font-black px-1.5 py-0.5 rounded uppercase">New Arrival</span>
                              )}
                            </div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase">{p.category?.name || "Uncategorized"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-gray-600">
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-gray-400" />
                          {p.vendor?.name || "Admin"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`font-black text-sm ${p.stock <= (p.lowStockThreshold || 5) ? 'text-red-600' : 'text-accent-navy'}`}>
                          {p.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-black text-sm text-accent-navy italic">{formatPrice(p.price)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ring-1 ring-inset ${
                          p.status === 'ACTIVE' ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-gray-50 text-gray-600 ring-gray-500/10'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <Link href={`/dashboard/admins/products/${p.slug}`} className="p-2 text-gray-400 hover:text-accent-navy transition-all"><Eye size={18} /></Link>
                          <Link href={`/dashboard/admins/products/${p.slug}/edit`} className="p-2 text-blue-500 hover:bg-blue-50 transition-all"><Edit size={18} /></Link>
                          <button onClick={() => deleteProducts([p.id])} className="p-2 text-red-400 hover:text-red-600 transition-all"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-gray-400 font-bold uppercase text-xs tracking-widest">
              Zero Products Found
          </div>
        )}

        {/* Pagination Bar */}
        <div className="bg-gray-50 px-6 py-4 border-t flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
            Total Inventory: <span className="text-accent-navy">{total}</span>
          </p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => updateFilters({ page: String(page - 1) })}
              className="p-2 border rounded-lg bg-white disabled:opacity-50"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center px-4 text-[10px] font-black text-accent-navy">{page} / {totalPages}</div>
            <button
              disabled={page >= totalPages}
              onClick={() => updateFilters({ page: String(page + 1) })}
              className="p-2 border rounded-lg bg-white disabled:opacity-50"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
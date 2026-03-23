"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useLoadingOverlay } from "@/app/_context/LoadingOverlayContext";
import { Prisma } from "@prisma/client";
import { 
  Edit3, 
  Trash2, 
  ChevronRight, 
  ChevronLeft, 
  Layers, 
  Calendar, 
  Link as LinkIcon, 
  Plus,
  Star 
} from "lucide-react";
import FeaturedToggle from "./FeaturedToggle"; 

/* ---------------- Types ---------------- */
export type CategoryChild = {
  id: string;
  name: string;
  slug: string;
  children?: CategoryChild[];
};

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  position: number;
  isFeatured: boolean; 
  parentName: string | null;
  children: CategoryChild[];
  createdAt: string;
};

type CategoriesTableProps = {
  categories: CategoryRow[];
  canManageCategories: boolean;
  total: number;
  page: number;
  pageSize: number;
  search: string;
  sortBy: keyof Prisma.CategoryOrderByWithRelationInput;
  sortOrder: "asc" | "desc";
};

/* ---------------- Pagination Helper ---------------- */
function getSummarizedPages(current: number, total: number) {
  const delta = 1;
  const range = [];
  const rangeWithDots: (number | string)[] = [];
  let l: number | undefined;

  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i);
    }
  }

  for (const i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (i - l !== 1) {
        rangeWithDots.push("...");
      }
    }
    rangeWithDots.push(i);
    l = i;
  }

  return rangeWithDots;
}

/* ---------------- Main Component ---------------- */
export default function CategoriesTable({
  categories,
  canManageCategories,
  total,
  page,
  pageSize,
}: CategoriesTableProps) {
  const totalPages = Math.ceil(total / pageSize);
  const { setLoading } = useLoadingOverlay();
  const router = useRouter();
  const params = useSearchParams();

  const goToPage = (p: number) => {
    setLoading(true);
    const newParams = new URLSearchParams(params.toString());
    newParams.set("page", p.toString());
    router.push(`/dashboard/admins/categories?${newParams.toString()}`);
  };

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const pages = getSummarizedPages(page, totalPages);


  return (
  <div className="w-full bg-white rounded-[2rem] border border-gray-100 shadow-2xl shadow-gray-200/40 overflow-hidden">
    
    {/* Table Top Header */}
    <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 bg-gray-50/30">
      <div>
        <h2 className="text-lg font-black text-accent-navy tracking-tight italic uppercase leading-none mb-1">
          Category Management
        </h2>
        <p className="text-[11px] text-neutral-gray font-bold uppercase tracking-widest">
          Showing <span className="text-brand-primary">{start}–{end}</span> of {total} Categories
        </p>
      </div>
      
      {canManageCategories && (
        <button 
          onClick={() => { setLoading(true); router.push('/dashboard/admins/categories/create'); }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand-primary hover:bg-accent-navy text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-brand-primary/20 active:scale-95"
        >
          <Plus className="w-4 h-4" strokeWidth={3} /> Add Category
        </button>
      )}
    </div>

    {/* Table Body */}
    <div className="overflow-x-auto scrollbar-hide">
      <table className="w-full text-left border-separate border-spacing-0">
        <thead>
          <tr className="bg-white">
            <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-neutral-gray/60 border-b border-gray-100">Category</th>
            <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-neutral-gray/60 border-b border-gray-100 hidden lg:table-cell">Path (Slug)</th>
            <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-neutral-gray/60 border-b border-gray-100 hidden md:table-cell">Structure</th>
            <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-neutral-gray/60 border-b border-gray-100 text-center">Featured</th>
            <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-neutral-gray/60 border-b border-gray-100 hidden sm:table-cell text-center">Timeline</th>
            {canManageCategories && (
              <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-neutral-gray/60 border-b border-gray-100 text-right">Control</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {categories.length > 0 ? (
            categories.map((cat) => (
              <tr key={cat.id} className="group hover:bg-brand-light/20 transition-all duration-300">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-accent-navy group-hover:bg-brand-primary group-hover:text-white transition-all duration-500 shadow-sm">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="font-black text-accent-navy text-xs uppercase tracking-tight truncate group-hover:italic">
                        {cat.name}
                      </div>
                      {cat.parentName && (
                        <div className="text-[9px] text-neutral-gray flex items-center gap-1 font-bold uppercase tracking-wider">
                          <ChevronRight className="w-2.5 h-2.5 text-brand-primary" /> {cat.parentName}
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 hidden lg:table-cell">
                  <div className="flex items-center gap-1.5 text-neutral-gray font-mono text-[10px] bg-gray-50 border border-gray-100 px-2 py-1 rounded-lg w-fit group-hover:border-brand-primary/20 transition-colors">
                    <LinkIcon className="w-3 h-3" /> /{cat.slug}
                  </div>
                </td>

                <td className="px-6 py-4 hidden md:table-cell">
                  {cat.children.length > 0 ? (
                    <span className="bg-brand-primary/10 text-brand-primary text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border border-brand-primary/10">
                      {cat.children.length} Nested Items
                    </span>
                  ) : (
                    <span className="text-neutral-gray/40 text-[9px] font-bold italic uppercase tracking-widest">Leaf Node</span>
                  )}
                </td>

                <td className="px-6 py-4">
                  <div className="flex justify-center scale-90 sm:scale-100">
                    <FeaturedToggle 
                      categoryId={cat.id} 
                      initialStatus={cat.isFeatured} 
                    />
                  </div>
                </td>

                <td className="px-6 py-4 hidden sm:table-cell">
                  <div className="text-[10px] text-accent-navy flex flex-col items-center font-black uppercase">
                    <span className="text-neutral-gray/30 mb-0.5"><Calendar className="w-3.5 h-3.5" /></span>
                    {new Date(cat.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                  </div>
                </td>

                {canManageCategories && (
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => { setLoading(true); router.push(`/dashboard/admins/categories/${cat.id}/edit`); }}
                        className="p-2 text-accent-navy hover:bg-brand-primary hover:text-white rounded-xl transition-all active:scale-90"
                      >
                        <Edit3 className="w-4.5 h-4.5" />
                      </button>
                      <button
                        onClick={() => { setLoading(true); router.push(`/dashboard/admins/categories/${cat.id}/delete`); }}
                        className="p-2 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all active:scale-90"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="py-20 text-center">
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                    <Layers className="w-8 h-8 text-neutral-gray/20" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-gray/40">Database Empty</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

    {/* Pagination Footer */}
    <div className="px-6 py-5 bg-white border-t border-gray-50 flex flex-col lg:flex-row justify-between items-center gap-6">
      <div className="order-2 lg:order-1 flex items-center gap-3">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <p className="text-[9px] text-neutral-gray font-black uppercase tracking-[0.2em] italic">
          System Node Active: Category Control Protocol
        </p>
      </div>

      <div className="order-1 lg:order-2 flex items-center gap-2">
        <button
          disabled={page === 1}
          onClick={() => goToPage(page - 1)}
          className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-100 bg-white text-accent-navy hover:bg-brand-primary hover:text-white disabled:opacity-20 transition-all shadow-sm active:scale-95"
        >
          <ChevronLeft className="w-4 h-4" strokeWidth={3} />
        </button>
        
        <div className="flex items-center gap-1.5 px-2">
          {pages.map((p, i) => {
            if (p === "...") {
              return <span key={`dots-${i}`} className="px-2 text-neutral-gray/30 font-black">...</span>;
            }
            const isCurrent = page === p;
            return (
              <button
                key={i}
                onClick={() => goToPage(Number(p))}
                className={`w-10 h-10 rounded-xl text-[10px] font-black uppercase transition-all duration-300 ${
                  isCurrent 
                  ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20 scale-110" 
                  : "bg-white border border-gray-100 text-neutral-gray hover:border-brand-primary hover:text-brand-primary"
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        <button
          disabled={page === totalPages}
          onClick={() => goToPage(page + 1)}
          className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-100 bg-white text-accent-navy hover:bg-brand-primary hover:text-white disabled:opacity-20 transition-all shadow-sm active:scale-95"
        >
          <ChevronRight className="w-4 h-4" strokeWidth={3} />
        </button>
      </div>
    </div>
  </div>
);

}


// "use client";

// import { useRouter, useSearchParams } from "next/navigation";
// import { useLoadingOverlay } from "@/app/_context/LoadingOverlayContext";
// import { Prisma } from "@prisma/client";
// import { 
//   Edit3, 
//   Trash2, 
//   ChevronRight, 
//   ChevronLeft, 
//   Layers, 
//   Calendar, 
//   Link as LinkIcon, 
//   MoreHorizontal,
//   Plus
// } from "lucide-react";
// import { format } from "date-fns"; // Recommended for professional date formatting

// /* ---------------- Types ---------------- */
// export type CategoryChild = {
//   id: string;
//   name: string;
//   slug: string;
//   children?: CategoryChild[];
// };

// export type CategoryRow = {
//   id: string;
//   name: string;
//   slug: string;
//   position: number;
//   parentName: string | null;
//   children: CategoryChild[];
//   createdAt: string;
// };

// type CategoriesTableProps = {
//   categories: CategoryRow[];
//   canManageCategories: boolean;
//   total: number;
//   page: number;
//   pageSize: number;
//   search: string;
//   sortBy: keyof Prisma.CategoryOrderByWithRelationInput;
//   sortOrder: "asc" | "desc";
// };

// /* ---------------- Main Component ---------------- */
// export default function CategoriesTable({
//   categories,
//   canManageCategories,
//   total,
//   page,
//   pageSize,
//   search,
// }: CategoriesTableProps) {
//   const totalPages = Math.ceil(total / pageSize);
//   const { setLoading } = useLoadingOverlay();
//   const router = useRouter();
//   const params = useSearchParams();

//   const goToPage = (p: number) => {
//     setLoading(true);
//     const newParams = new URLSearchParams(params.toString());
//     newParams.set("page", p.toString());
//     router.push(`/dashboard/admins/categories?${newParams.toString()}`);
//   };

//   const start = (page - 1) * pageSize + 1;
//   const end = Math.min(page * pageSize, total);

//   return (
//     <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
      
//       {/* Header Info */}
//       <div className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-50 bg-gray-50/50">
//         <div>
//           <h2 className="text-lg font-bold text-gray-800">Category Management</h2>
//           <p className="text-sm text-gray-500">
//             Showing <span className="font-semibold text-blue-600">{start}–{end}</span> of {total} total categories
//           </p>
//         </div>
//         {canManageCategories && (
//             <button 
//                onClick={() => { setLoading(true); router.push('/dashboard/admins/categories/new'); }}
//                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-200 active:scale-95"
//             >
//                 <Plus size={18} /> Add Category
//             </button>
//         )}
//       </div>

//       {/* Table Wrapper */}
//       <div className="overflow-x-auto">
//         <table className="w-full text-left border-separate border-spacing-0">
//           <thead>
//             <tr className="bg-white">
//               <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100">Category</th>
//               <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 hidden lg:table-cell">Path (Slug)</th>
//               <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 hidden md:table-cell">Sub-Count</th>
//               <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 hidden sm:table-cell text-center">Date Created</th>
//               {canManageCategories && (
//                 <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 text-center">Actions</th>
//               )}
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-50">
//             {categories.length > 0 ? (
//               categories.map((cat) => (
//                 <tr key={cat.id} className="group hover:bg-blue-50/30 transition-colors">
//                   {/* Category Name & Parent */}
//                   <td className="px-6 py-4">
//                     <div className="flex items-center gap-3">
//                       <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
//                         <Layers size={20} />
//                       </div>
//                       <div>
//                         <div className="font-bold text-gray-900">{cat.name}</div>
//                         {cat.parentName && (
//                           <div className="text-[10px] text-gray-400 flex items-center gap-1">
//                             <ChevronRight size={10} /> Parent: {cat.parentName}
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </td>

//                   {/* Slug */}
//                   <td className="px-6 py-4 hidden lg:table-cell">
//                     <div className="flex items-center gap-1.5 text-gray-500 font-mono text-xs bg-gray-100 px-2 py-1 rounded-md w-fit">
//                       <LinkIcon size={12} /> {cat.slug}
//                     </div>
//                   </td>

//                   {/* Subcategories (Advanced Badge View) */}
//                   <td className="px-6 py-4 hidden md:table-cell">
//                     <div className="flex flex-wrap gap-1">
//                       {cat.children.length > 0 ? (
//                         <span className="bg-green-100 text-green-700 text-[11px] font-bold px-2 py-0.5 rounded-full">
//                           {cat.children.length} Sub-categories
//                         </span>
//                       ) : (
//                         <span className="text-gray-300 text-xs italic">No children</span>
//                       )}
//                     </div>
//                   </td>

//                   {/* Date */}
//                   <td className="px-6 py-4 hidden sm:table-cell text-center">
//                     <div className="text-xs text-gray-600 flex flex-col items-center">
//                       <Calendar size={14} className="text-gray-400 mb-1" />
//                       {new Date(cat.createdAt).toLocaleDateString()}
//                     </div>
//                   </td>

//                   {/* Actions */}
//                   {canManageCategories && (
//                     <td className="px-6 py-4">
//                       <div className="flex items-center justify-center gap-2">
//                         <button
//                           onClick={() => { setLoading(true); router.push(`/dashboard/admins/categories/${cat.id}/edit`); }}
//                           className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
//                           title="Edit"
//                         >
//                           <Edit3 size={18} />
//                         </button>
//                         <button
//                           onClick={() => { setLoading(true); router.push(`/dashboard/admins/categories/${cat.id}/delete`); }}
//                           className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
//                           title="Delete"
//                         >
//                           <Trash2 size={18} />
//                         </button>
//                       </div>
//                     </td>
//                   )}
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan={5} className="py-20 text-center">
//                   <div className="flex flex-col items-center text-gray-400">
//                     <Layers size={48} className="mb-4 opacity-20" />
//                     <p>No categories found in the database.</p>
//                   </div>
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Pagination Container */}
//       <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
//         <p className="text-xs text-gray-500 font-medium italic">
//           Tip: Hierarchical categories improve your SEO ranking.
//         </p>

//         <div className="flex items-center gap-1">
//           <button
//             disabled={page === 1}
//             onClick={() => goToPage(page - 1)}
//             className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition-all"
//           >
//             <ChevronLeft size={18} />
//           </button>
          
//           <div className="flex gap-1 px-2">
//             {[...Array(totalPages)].map((_, i) => (
//               <button
//                 key={i + 1}
//                 onClick={() => goToPage(i + 1)}
//                 className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
//                   page === i + 1 
//                   ? "bg-blue-600 text-white shadow-md shadow-blue-200" 
//                   : "bg-white border border-gray-200 text-gray-600 hover:border-blue-400"
//                 }`}
//               >
//                 {i + 1}
//               </button>
//             ))}
//           </div>

//           <button
//             disabled={page === totalPages}
//             onClick={() => goToPage(page + 1)}
//             className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition-all"
//           >
//             <ChevronRight size={18} />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }



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
  Plus
} from "lucide-react";

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
/**
 * Generates an array of page numbers with ellipses for long lists.
 * Example: [1, "...", 4, 5, 6, "...", 50]
 */
function getSummarizedPages(current: number, total: number) {
  const delta = 1; // Number of pages to show around current page
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
    <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
      
      {/* Table Top Header */}
      <div className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-50 bg-gray-50/50">
        <div>
          <h2 className="text-lg font-bold text-gray-800 tracking-tight text-lg italic uppercase">Category Management</h2>
          <p className="text-sm text-gray-500">
            Showing <span className="font-semibold text-blue-600">{start}–{end}</span> of {total} total categories
          </p>
        </div>
        {canManageCategories && (
            <button 
               onClick={() => { setLoading(true); router.push('/dashboard/admins/categories/new'); }}
               className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-tighter transition-all shadow-lg shadow-blue-200 active:scale-95"
            >
                <Plus size={16} strokeWidth={3} /> Add Category
            </button>
        )}
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-0">
          <thead>
            <tr className="bg-white">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">Category</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 hidden lg:table-cell">Slug (Path)</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 hidden md:table-cell">Sub-Items</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 hidden sm:table-cell text-center">Created At</th>
              {canManageCategories && (
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 text-center">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {categories.length > 0 ? (
              categories.map((cat) => (
                <tr key={cat.id} className="group hover:bg-blue-50/30 transition-colors">
                  {/* Category Name & Parent Info */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                        <Layers size={20} />
                      </div>
                      <div>
                        <div className="font-black text-gray-900 text-sm uppercase tracking-tight">{cat.name}</div>
                        {cat.parentName && (
                          <div className="text-[10px] text-gray-400 flex items-center gap-1 font-bold">
                            <ChevronRight size={10} /> {cat.parentName}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Slug Column */}
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <div className="flex items-center gap-1.5 text-gray-500 font-mono text-[11px] bg-gray-50 border border-gray-100 px-2 py-1 rounded-md w-fit">
                      <LinkIcon size={12} /> {cat.slug}
                    </div>
                  </td>

                  {/* Subcategories Badge */}
                  <td className="px-6 py-4 hidden md:table-cell">
                    {cat.children.length > 0 ? (
                      <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter">
                        {cat.children.length} Children
                      </span>
                    ) : (
                      <span className="text-gray-300 text-[10px] font-bold italic uppercase tracking-widest">Single</span>
                    )}
                  </td>

                  {/* Date Column */}
                  <td className="px-6 py-4 hidden sm:table-cell text-center">
                    <div className="text-[11px] text-gray-600 flex flex-col items-center font-bold">
                      <Calendar size={14} className="text-gray-300 mb-1" />
                      {new Date(cat.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </div>
                  </td>

                  {/* Action Buttons */}
                  {canManageCategories && (
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => { setLoading(true); router.push(`/dashboard/admins/categories/${cat.id}/edit`); }}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-xl transition-all active:scale-90"
                          title="Edit Category"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button
                          onClick={() => { setLoading(true); router.push(`/dashboard/admins/categories/${cat.id}/delete`); }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                          title="Delete Category"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-24 text-center">
                  <div className="flex flex-col items-center text-gray-400">
                    <Layers size={48} className="mb-4 opacity-10" />
                    <p className="text-sm font-bold uppercase tracking-widest opacity-40">No records found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Summarized Pagination Footer */}
      <div className="px-6 py-5 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-6">
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest italic">
          Admin Dashboard Management System
        </p>

        <div className="flex items-center gap-1.5">
          {/* Previous Page */}
          <button
            disabled={page === 1}
            onClick={() => goToPage(page - 1)}
            className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 hover:border-gray-300 disabled:opacity-20 transition-all shadow-sm"
          >
            <ChevronLeft size={16} strokeWidth={3} />
          </button>
          
          <div className="flex items-center gap-1.5 px-1">
            {pages.map((p, i) => {
              if (p === "...") {
                return (
                  <span key={`dots-${i}`} className="px-2 text-gray-300 font-black tracking-widest">
                    ...
                  </span>
                );
              }

              const isCurrent = page === p;

              return (
                <button
                  key={i}
                  onClick={() => goToPage(Number(p))}
                  className={`w-9 h-9 rounded-xl text-xs font-black transition-all duration-300 ${
                    isCurrent 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200 scale-110" 
                    : "bg-white border border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600"
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>

          {/* Next Page */}
          <button
            disabled={page === totalPages}
            onClick={() => goToPage(page + 1)}
            className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 hover:border-gray-300 disabled:opacity-20 transition-all shadow-sm"
          >
            <ChevronRight size={16} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
}
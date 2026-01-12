"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useLoadingOverlay } from "@/app/_context/LoadingOverlayContext";
import { Prisma } from "@prisma/client";

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

function RenderChildren({
  children,
  canManageCategories,
  setLoading,
}: {
  children: CategoryChild[];
  canManageCategories: boolean;
  setLoading: (loading: boolean) => void;
}) {
  return (
    <ul className="list-disc list-inside space-y-1 ml-4">
      {children.map((child, index) => (
        <li key={child.id ?? child.slug ?? index} className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            {child.slug ? (
              <a
                href={`/categories/${child.slug}`}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                {child.name}
              </a>
            ) : (
              child.name
            )}

            {canManageCategories && (
              <div className="flex gap-1">
                <a
                  href={`/dashboard/admins/categories/${child.id}/edit`}
                  className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors text-lg md:text-xl"
                  onClick={() => setLoading(true)}
                >
                  Edit
                </a>
                <a
                  href={`/dashboard/admins/categories/${child.id}/delete`}
                  className="px-2 py-0.5 rounded bg-red-100 text-red-700 hover:bg-red-200 transition-colors text-lg md:text-xl"
                  onClick={() => setLoading(true)}
                >
                  Delete
                </a>
              </div>
            )}
          </div>

          {child.children && child.children.length > 0 && (
            <RenderChildren
              children={child.children}
              canManageCategories={canManageCategories}
              setLoading={setLoading}
            />
          )}
        </li>
      ))}
    </ul>
  );
}

export default function CategoriesTable({
  categories,
  canManageCategories,
  total,
  page,
  pageSize,
  search,
}: CategoriesTableProps) {
  const totalPages = Math.ceil(total / pageSize);
  const { setLoading } = useLoadingOverlay();
  const router = useRouter();
  const params = useSearchParams();

  const goToPage = (p: number) => {
    setLoading(true);
    const newParams = new URLSearchParams(params.toString());
    newParams.set("page", p.toString());
    newParams.set("pageSize", pageSize.toString());
    newParams.set("search", search);
    router.push(`/dashboard/admins/categories?${newParams.toString()}`);
  };

  const updateSort = (column: string) => {
    setLoading(true);
    const newParams = new URLSearchParams(params.toString());
    const currentSortBy = newParams.get("sortBy");
    const currentSortOrder = newParams.get("sortOrder") ?? "asc";

    if (currentSortBy === column) {
      // toggle order
      newParams.set("sortOrder", currentSortOrder === "asc" ? "desc" : "asc");
    } else {
      newParams.set("sortBy", column);
      newParams.set("sortOrder", "asc");
    }

    router.push(`/dashboard/admins/categories?${newParams.toString()}`);
  };

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden">
      {/* Results indicator */}
      <div className="px-4 py-2 text-lg md:text-xl text-gray-600 border-b bg-gray-50">
        Showing {start}–{end} of {total} results
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm sm:text-base">
          <thead className="bg-gray-50 text-gray-700 uppercase text-xs sm:text-sm tracking-wider">
            <tr>
              <th
                className="text-left p-3 text-lg md:text-xl cursor-pointer hover:text-blue-600"
                onClick={() => updateSort("name")}
              >
                Name
              </th>
              <th
                className="text-left p-3 text-lg md:text-xl hidden md:table-cell cursor-pointer hover:text-blue-600"
                onClick={() => updateSort("slug")}
              >
                Slug
              </th>
              <th className="text-left p-3 text-lg md:text-xl hidden lg:table-cell">Parent</th>
              <th className="text-left p-3 text-lg md:text-xl">Subcategories</th>
              <th
                className="text-center p-3 text-lg md:text-xl hidden md:table-cell cursor-pointer hover:text-blue-600"
                onClick={() => updateSort("position")}
              >
                Position
              </th>
              <th
                className="text-left p-3 text-lg md:text-xl hidden sm:table-cell cursor-pointer hover:text-blue-600"
                onClick={() => updateSort("createdAt")}
              >
                Created
              </th>
              {canManageCategories && (
                <th className="p-3 text-lg md:text-xl text-center">Actions</th>
              )}
            </tr>
          </thead>

          <tbody>
            {categories.length > 0 ? (
              categories.map((cat, idx) => (
                <tr
                  key={cat.id}
                  className={`border-t ${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-blue-50 transition-colors`}
                >
                  <td className="p-3 text-lg md:text-xl font-medium text-gray-900">{cat.name}</td>
                  <td className="p-3 text-lg md:text-xl text-gray-600 hidden md:table-cell">
                    {cat.slug}
                  </td>
                  <td className="p-3 text-lg md:text-xl text-gray-600 hidden lg:table-cell">
                    {cat.parentName ?? "-"}
                  </td>
                  <td className="p-3 text-lg md:text-xl text-gray-600">
                    {cat.children.length > 0 ? (
                      <RenderChildren
                        children={cat.children}
                        canManageCategories={canManageCategories}
                        setLoading={setLoading}
                      />
                    ) : (
                      <span className="text-gray-400 italic">None</span>
                    )}
                  </td>
                  <td className="p-3 text-lg md:text-xl text-center hidden md:table-cell">
                    {cat.position}
                  </td>
                  <td className="p-3 text-lg md:text-xl text-gray-600 hidden sm:table-cell">
                    {new Date(cat.createdAt).toLocaleDateString()}
                  </td>
                  {canManageCategories && (
                    <td className="p-3 text-lg md:text-xl flex flex-col sm:flex-row gap-2 justify-center">
                      <a
                        href={`/dashboard/admins/categories/${cat.id}/edit`}
                        className="px-3 py-1.5 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors text-lg md:text-xl text-center"
                        onClick={() => setLoading(true)}
                      >
                        Edit
                      </a>
                      <a
                        href={`/dashboard/admins/categories/${cat.id}/delete`}
                        className="px-3 py-1.5 rounded bg-red-100 text-red-700 hover:bg-red-200 transition-colors text-lg md:text-xl text-center"
                        onClick={() => setLoading(true)}
                      >
                        Delete
                      </a>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-500 italic">
                  No categories found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-t bg-gray-50">
          {/* Page size selector */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="pageSize"
              className="text-sm sm:text-base text-gray-600"
            >
              Rows per page:
            </label>
            <select
              id="pageSize"
              value={pageSize}
              onChange={(e) => {
                const newSize = parseInt(e.target.value, 10);
                const newParams = new URLSearchParams(params.toString()

                                  );
                setLoading(true);
              }}
              className="border rounded px-2 py-1 text-sm sm:text-base"
            >
              {[10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          {/* Page navigation */}
          <div className="flex flex-wrap items-center gap-2">
            {page > 1 && (
              <button
                onClick={() => goToPage(page - 1)}
                className="px-3 py-1.5 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
              >
                Prev
              </button>
            )}

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => goToPage(p)}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  p === page
                    ? "bg-blue-600 text-white font-bold"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {p}
              </button>
            ))}

            {page < totalPages && (
              <button
                onClick={() => goToPage(page + 1)}
                className="px-3 py-1.5 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
              >
                Next
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


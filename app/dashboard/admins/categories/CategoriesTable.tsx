// app/dashboard/admins/categories/CategoriesTable.tsx
"use client";

import Link from "next/link";
import { useLoadingOverlay } from "@/app/_context/LoadingOverlayContext";

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  position: number;
  parentName: string | null;
  children: string[];
  createdAt: string;
};

type CategoriesTableProps = {
  categories: CategoryRow[];
  canManageCategories: boolean;
  total: number;
  page: number;
  pageSize: number;
  search: string;
};

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

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <table className="w-full border-collapse">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left p-3">Name</th>
            <th className="text-left p-3">Slug</th>
            <th className="text-left p-3">Parent</th>
            <th className="text-left p-3">Subcategories</th>
            <th className="text-left p-3">Position</th>
            <th className="text-left p-3">Created</th>
            {canManageCategories && <th className="p-3">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat.id} className="border-t">
              <td className="p-3 font-medium">{cat.name}</td>
              <td className="p-3 text-gray-600">{cat.slug}</td>
              <td className="p-3 text-gray-600">{cat.parentName ?? "-"}</td>
              <td className="p-3 text-gray-600">
                {cat.children.length > 0 ? (
                  <ul className="list-disc list-inside text-sm">
                    {cat.children.map((child) => (
                      <li key={child}>{child}</li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-gray-400">None</span>
                )}
              </td>
              <td className="p-3">{cat.position}</td>
              <td className="p-3 text-gray-600">
                {new Date(cat.createdAt).toLocaleDateString()}
              </td>
              {canManageCategories && (
                <td className="p-3">
                  <Link
                    href={`/dashboard/admins/categories/${cat.id}/edit`}
                    className="text-blue-600 hover:underline mr-3"
                    onClick={() => setLoading(true)}
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/dashboard/admins/categories/${cat.id}/delete`}
                    className="text-red-600 hover:underline"
                    onClick={() => setLoading(true)}
                  >
                    Delete
                  </Link>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* ✅ Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 p-4">
          {page > 1 && (
            <Link
              href={`/dashboard/admins/categories?page=${page - 1}&pageSize=${pageSize}&search=${search}`}
              className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
              onClick={() => setLoading(true)}
            >
              Prev
            </Link>
          )}

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/dashboard/admins/categories?page=${p}&pageSize=${pageSize}&search=${search}`}
              className={`px-3 py-1 rounded ${
                p === page
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              onClick={() => setLoading(true)}
            >
              {p}
            </Link>
          ))}

          {page < totalPages && (
            <Link
              href={`/dashboard/admins/categories?page=${page + 1}&pageSize=${pageSize}&search=${search}`}
              className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
              onClick={() => setLoading(true)}
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

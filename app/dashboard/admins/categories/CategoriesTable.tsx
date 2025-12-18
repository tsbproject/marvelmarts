"use client";

import Link from "next/link";

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  position: number;
  parentName: string | null;
  childrenCount: number;
  createdAt: string;
};

export default function CategoriesTable({
  categories,
  canManageCategories,
}: {
  categories: CategoryRow[];
  canManageCategories: boolean;
}) {
  return (
    <table className="w-full border">
      <thead>
        <tr>
          <th>Name</th>
          <th>Slug</th>
          <th>Position</th>
          <th>Parent</th>
          <th>Children</th>
          <th>Created</th>
          {canManageCategories && <th>Actions</th>}
        </tr>
      </thead>
      <tbody>
        {categories.map((cat) => (
          <tr key={cat.id}>
            <td>{cat.name}</td>
            <td>{cat.slug}</td>
            <td>{cat.position}</td>
            <td>{cat.parentName ?? "-"}</td>
            <td>{cat.childrenCount}</td>
            <td>{new Date(cat.createdAt).toLocaleDateString()}</td>
            {canManageCategories && (
              <td>
                <Link
                  href={`/dashboard/admins/categories/${cat.id}/edit`}
                  className="text-blue-500 mr-2"
                >
                  Edit
                </Link>
                <Link
                  href={`/dashboard/admins/categories/${cat.id}/delete`}
                  className="text-red-500"
                >
                  Delete
                </Link>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

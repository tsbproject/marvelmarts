



// "use client";

// import { useState } from "react";
// import Link from "next/link";
// import DeleteCategoryModal from "@/app/_components/DeleteCategoryModal";

// export interface CategoryRow {
//   id: string;
//   name: string;
//   slug: string;
//   position: number;
//   parentName: string | null;
//   childrenCount: number;
//   createdAt: string;
// }

// export default function CategoriesTable({
//   categories,
//   canManageCategories,
// }: {
//   categories: CategoryRow[];
//   canManageCategories: boolean;
// }) {
//   const [rows, setRows] = useState<CategoryRow[]>(categories);
//   const [selectedCategory, setSelectedCategory] = useState<CategoryRow | null>(null);

//   return (
//     <div className="border rounded-lg overflow-hidden">
//       <table className="w-full border-collapse">
//         <thead>
//           <tr className="bg-gray-100 text-left">
//             <th className="p-2">Name</th>
//             <th className="p-2">Slug</th>
//             <th className="p-2">Parent</th>
//             <th className="p-2">Children</th>
//             <th className="p-2">Position</th>
//             <th className="p-2">Created</th>
//             {canManageCategories && <th className="p-2">Actions</th>}
//           </tr>
//         </thead>
//         <tbody>
//           {rows.map((cat) => (
//             <tr key={cat.id} className="border-t">
//               <td className="p-2">{cat.name}</td>
//               <td className="p-2">{cat.slug}</td>
//               <td className="p-2">{cat.parentName ?? "-"}</td>
//               <td className="p-2">{cat.childrenCount}</td>
//               <td className="p-2">{cat.position}</td>
//               <td className="p-2">{new Date(cat.createdAt).toLocaleDateString()}</td>
//               {canManageCategories && (
//                 <td className="p-2">
//                   <div className="flex items-center gap-2">
//                     <Link
//                       href={`/dashboard/admins/categories/${cat.id}/edit`}
//                       className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
//                     >
//                       Edit
//                     </Link>
//                     <button
//                       onClick={() => setSelectedCategory(cat)}
//                       className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
//                     >
//                       Delete
//                     </button>
//                   </div>
//                 </td>
//               )}
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {selectedCategory && (
//         <DeleteCategoryModal
//           categoryId={selectedCategory.id}
//           categoryName={selectedCategory.name}
//           onClose={() => setSelectedCategory(null)}
//           onDeleted={(deletedId) =>
//             setRows((prev) => prev.filter((c) => c.id !== deletedId))
//           }
//         />
//       )}
//     </div>
//   );
// }


"use client";

import { useState } from "react";
import Link from "next/link";
import DeleteCategoryModal from "@/app/_components/DeleteCategoryModal";

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  position: number;
  parentName: string | null;
  childrenCount: number;
  createdAt: string;
}

export default function CategoriesTable({
  categories,
  canManageCategories,
}: {
  categories: CategoryRow[];
  canManageCategories: boolean;
}) {
  const [rows, setRows] = useState<CategoryRow[]>(categories);
  const [selectedCategory, setSelectedCategory] = useState<CategoryRow | null>(null);

  // 🔹 Search
  const [searchTerm, setSearchTerm] = useState("");

  // 🔹 Sorting
  const [sortBy, setSortBy] = useState<keyof CategoryRow>("position");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // 🔹 Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // 🔹 Filter rows
  const filteredRows = rows.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 🔹 Sort rows
  const sortedRows = [...filteredRows].sort((a, b) => {
  let valA = a[sortBy];
  let valB = b[sortBy];

  // normalize nulls
  if (valA == null) valA = "";
  if (valB == null) valB = "";

  // compare numbers vs strings
  if (typeof valA === "number" && typeof valB === "number") {
    return sortOrder === "asc" ? valA - valB : valB - valA;
  }

  // string comparison
  return sortOrder === "asc"
    ? String(valA).localeCompare(String(valB))
    : String(valB).localeCompare(String(valA));
});



  // 🔹 Paginate rows
  const totalPages = Math.ceil(sortedRows.length / pageSize);
  const paginatedRows = sortedRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // 🔹 Handle sorting toggle
  const handleSort = (column: keyof CategoryRow) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Search bar */}
      <div className="p-2">
        <input
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="border p-2 rounded w-1/3"
        />
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2 cursor-pointer" onClick={() => handleSort("name")}>
              Name {sortBy === "name" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
            </th>
            <th className="p-2 cursor-pointer" onClick={() => handleSort("slug")}>
              Slug {sortBy === "slug" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
            </th>
            <th className="p-2">Parent</th>
            <th className="p-2 cursor-pointer" onClick={() => handleSort("childrenCount")}>
              Children {sortBy === "childrenCount" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
            </th>
            <th className="p-2 cursor-pointer" onClick={() => handleSort("position")}>
              Position {sortBy === "position" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
            </th>
            <th className="p-2 cursor-pointer" onClick={() => handleSort("createdAt")}>
              Created {sortBy === "createdAt" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
            </th>
            {canManageCategories && <th className="p-2">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {paginatedRows.map((cat) => (
            <tr key={cat.id} className="border-t">
              <td className="p-2">{cat.name}</td>
              <td className="p-2">{cat.slug}</td>
              <td className="p-2">{cat.parentName ?? "-"}</td>
              <td className="p-2">{cat.childrenCount}</td>
              <td className="p-2">{cat.position}</td>
              <td className="p-2">{new Date(cat.createdAt).toLocaleDateString()}</td>
              {canManageCategories && (
                <td className="p-2">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/admins/categories/${cat.id}/edit`}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => setSelectedCategory(cat)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-center mt-4 space-x-2">
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-1 border rounded ${currentPage === i + 1 ? "bg-blue-600 text-white" : ""}`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {selectedCategory && (
        <DeleteCategoryModal
          categoryId={selectedCategory.id}
          categoryName={selectedCategory.name}
          onClose={() => setSelectedCategory(null)}
          onDeleted={(deletedId) =>
            setRows((prev) => prev.filter((c) => c.id !== deletedId))
          }
        />
      )}
    </div>
  );
}

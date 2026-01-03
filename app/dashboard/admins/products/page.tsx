



// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { useSearchParams, useRouter } from "next/navigation";
// import DashboardHeader from "@/app/_components/DashboardHeader";

// interface Product {
//   id: string;
//   slug: string;
//   title: string;
//   price: number;
//   status: string;
//   category?: { name: string };
// }

// interface ProductResponse {
//   items: Product[];
//   total: number;
//   page: number;
//   pageSize: number;
//   totalPages: number;
// }

// export default function ProductsPage() {
//   const [products, setProducts] = useState<Product[]>([]);
//   const [total, setTotal] = useState(0);

//   const searchParams = useSearchParams();
//   const router = useRouter();

//   const page = Number(searchParams.get("page")) || 1;
//   const pageSize = Number(searchParams.get("pageSize")) || 10;
//   const search = searchParams.get("search")?.trim() ?? "";

//   useEffect(() => {
//     const query = new URLSearchParams({
//       page: String(page),
//       pageSize: String(pageSize),
//       search,
//     });

//     fetch(`/api/products?${query.toString()}`)
//       .then((res) => res.json())
//       .then((data: ProductResponse) => {
//         setProducts(data.items ?? []);
//         setTotal(data.total ?? 0);
//       })
//       .catch((err) => {
//         console.error("Error fetching products:", err);
//       });
//   }, [page, pageSize, search]);

//   const totalPages = Math.max(1, Math.ceil(total / pageSize));

//   function handleSearch(e: React.FormEvent<HTMLFormElement>) {
//     e.preventDefault();
//     const formData = new FormData(e.currentTarget);
//     const searchValue = formData.get("search")?.toString() ?? "";
//     router.push(
//       `/dashboard/admins/products?page=1&pageSize=${pageSize}&search=${encodeURIComponent(
//         searchValue
//       )}`
//     );
//   }

//   function setPage(nextPage: number) {
//     router.push(
//       `/dashboard/admins/products?page=${nextPage}&pageSize=${pageSize}&search=${encodeURIComponent(
//         search
//       )}`
//     );
//   }

//   return (
//     <div className="w-full max-w-screen-lg mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 md:py-6">
//       <DashboardHeader
//         title="Products"
//         showAddButton
//         addButtonLabel="Add Product"
//         addButtonLink="/dashboard/admins/products/new"
//         showSecondaryButton
//         secondaryButtonLabel="Manage Inventory"
//         secondaryButtonLink="/dashboard/admins/products/inventory"
//       />

//       {/* Search form */}
//       <form
//         onSubmit={handleSearch}
//         className="mb-4 flex flex-col sm:flex-row gap-2 w-full"
//       >
//         <input
//           type="text"
//           name="search"
//           defaultValue={search}
//           placeholder="Search products..."
//           className="border rounded px-3 py-2 w-full sm:w-64 text-sm sm:text-base"
//         />
//         <button className="px-4 py-2 bg-blue-600 text-white rounded w-full sm:w-auto text-sm sm:text-base">
//           Search
//         </button>
//       </form>

//       {/* Products list */}
//       {(products ?? []).length === 0 ? (
//         <p className="text-sm sm:text-base">No products found.</p>
//       ) : (
//         <>
//           {/* Mobile cards */}
//           <div className="space-y-4 lg:hidden">
//             {products.map((p) => (
//               <div
//                 key={p.id}
//                 className="rounded border bg-white p-4 shadow-sm text-sm sm:text-base"
//               >
//                 <p className="font-semibold">{p.title}</p>
//                 <p className="text-gray-600">Price: ${p.price}</p>
//                 <p className="text-gray-600">Status: {p.status}</p>
//                 <p className="text-gray-600">
//                   Category: {p.category?.name ?? "-"}
//                 </p>
//                 <div className="mt-2 flex flex-col sm:flex-row gap-2">
//                   <Link
//                     href={`/dashboard/admins/products/${p.slug}`}
//                     className="px-3 py-2 bg-indigo-600 text-white rounded text-center text-xs sm:text-sm w-full sm:w-auto"
//                   >
//                     View
//                   </Link>
//                   <Link
//                     href={`/dashboard/admins/products/${p.slug}/edit`}
//                     className="px-3 py-2 bg-yellow-600 text-white rounded text-center text-xs sm:text-sm w-full sm:w-auto"
//                   >
//                     Edit
//                   </Link>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Desktop table */}
//           <div className="hidden lg:block overflow-x-auto">
//             <table className="min-w-full border-collapse border border-gray-300 text-sm sm:text-base">
//               <thead>
//                 <tr className="bg-gray-100">
//                   <th className="px-4 py-2 text-left">Title</th>
//                   <th className="px-4 py-2 text-left">Price</th>
//                   <th className="px-4 py-2 text-left">Status</th>
//                   <th className="px-4 py-2 text-left">Category</th>
//                   <th className="px-4 py-2 text-left">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {products.map((p) => (
//                   <tr key={p.id} className="hover:bg-gray-50 transition">
//                     <td className="border px-4 py-2">{p.title}</td>
//                     <td className="border px-4 py-2">${p.price}</td>
//                     <td className="border px-4 py-2">{p.status}</td>
//                     <td className="border px-4 py-2">{p.category?.name ?? "-"}</td>
//                     <td className="border px-4 py-2">
//                       <Link
//                         href={`/dashboard/admins/products/${p.slug}`}
//                         className="px-3 py-2 bg-indigo-600 text-white rounded text-xs sm:text-sm hover:bg-indigo-700 transition"
//                       >
//                         View
//                       </Link>
//                       <Link
//                         href={`/dashboard/admins/products/${p.slug}/edit`}
//                         className="ml-2 px-3 py-2 bg-yellow-600 text-white rounded text-xs sm:text-sm hover:bg-yellow-700 transition"
//                       >
//                         Edit
//                       </Link>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </>
//       )}

//       {/* Pagination */}
//       <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mt-4 text-sm sm:text-base">
//         <button
//           disabled={page <= 1}
//           onClick={() => setPage(page - 1)}
//           className="px-3 py-2 bg-gray-200 rounded disabled:opacity-50 w-full sm:w-auto"
//         >
//           Previous
//         </button>
//         <span>
//           Page {page} of {totalPages}
//         </span>
//         <button
//           disabled={page >= totalPages}
//           onClick={() => setPage(page + 1)}
//           className="px-3 py-2 bg-gray-200 rounded disabled:opacity-50 w-full sm:w-auto"
//         >
//           Next
//         </button>
//       </div>
//     </div>
//   );
// }




"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import DashboardHeader from "@/app/_components/DashboardHeader";

interface Product {
  id: string;
  slug: string;
  title: string;
  price: number;
  status: string;
  category?: { name: string };
}

interface ProductResponse {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  items?: Product[];
  total?: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
}

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const page = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("pageSize")) || 10;
  const search = (searchParams.get("search") || "").trim();

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]> | null>(null);
  const [loading, setLoading] = useState(false);

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
      setError(null);
      setValidationErrors(null);

      try {
        const res = await fetch(`/api/products?${queryString}`, {
          method: "GET",
          headers: { Accept: "application/json" },
        });

        // If API returns a non-JSON (e.g., HTML error), avoid res.json crash
        const contentType = res.headers.get("content-type") || "";
        const isJson = contentType.includes("application/json");

        if (!res.ok) {
          const text = isJson ? (await res.json()) : await res.text();
          const message = isJson
            ? (text.message || "Failed to fetch products")
            : `Failed to fetch products: ${res.status} ${text}`;
          throw new Error(message);
        }

        const data: ProductResponse = isJson ? await res.json() : { items: [], total: 0 };

        if (data.success === false) {
          if (!cancelled) {
            setError(data.message || "Failed to fetch products");
            setValidationErrors(data.errors || null);
            setProducts([]);
            setTotal(0);
          }
        } else {
          if (!cancelled) {
            setProducts(data.items || []);
            setTotal(data.total || 0);
            setError(null);
            setValidationErrors(null);
          }
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Something went wrong while fetching products.");
          setProducts([]);
          setTotal(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [queryString]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchValue = (formData.get("search")?.toString() || "").trim();
    router.push(
      `/dashboard/admins/products?page=1&pageSize=${pageSize}&search=${encodeURIComponent(searchValue)}`
    );
  }

  function setPage(nextPage: number) {
    router.push(
      `/dashboard/admins/products?page=${nextPage}&pageSize=${pageSize}&search=${encodeURIComponent(search)}`
    );
  }

  return {
    /* Wrapper */
  } && (
    <div className="w-full max-w-screen-lg mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 md:py-6">
      <DashboardHeader
        title="Products"
        showAddButton
        addButtonLabel="Add Product"
        addButtonLink="/dashboard/admins/products/new"
        showSecondaryButton
        secondaryButtonLabel="Manage Inventory"
        secondaryButtonLink="/dashboard/admins/products/inventory"
      />

      {/* Search form */}
      <form onSubmit={handleSearch} className="mb-4 flex flex-col sm:flex-row gap-2 w-full">
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Search products..."
          className="border rounded px-3 py-2 w-full sm:w-64 text-sm sm:text-base"
        />
        <button className="px-4 py-2 bg-blue-600 text-white rounded w-full sm:w-auto text-sm sm:text-base">
          Search
        </button>
      </form>

      {/* Status messages */}
      {loading && (
        <p className="mb-3 text-sm sm:text-base text-gray-600">Loading products…</p>
      )}

      {error && (
        <div className="mb-4 text-red-600 text-sm sm:text-base">
          {error}
          {validationErrors && (
            <ul className="mt-2 list-disc list-inside">
              {Object.entries(validationErrors).map(([field, messages]) => (
                <li key={field}>
                  <strong>{field}:</strong> {messages.join(", ")}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Products list */}
      {!loading && !error && (products ?? []).length === 0 ? (
        <p className="text-sm sm:text-base">No products found.</p>
      ) : (
        !loading && !error && (
          <>
            {/* Mobile cards */}
            <div className="space-y-4 lg:hidden">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="rounded border bg-white p-4 shadow-sm text-sm sm:text-base"
                >
                  <p className="font-semibold">{p.title}</p>
                  <p className="text-gray-600">Price: ${p.price}</p>
                  <p className="text-gray-600">Status: {p.status}</p>
                  <p className="text-gray-600">Category: {p.category?.name ?? "-"}</p>
                  <div className="mt-2 flex flex-col sm:flex-row gap-2">
                    <Link
                      href={`/dashboard/admins/products/${p.slug}`}
                      className="px-3 py-2 bg-indigo-600 text-white rounded text-center text-xs sm:text-sm w-full sm:w-auto"
                    >
                      View
                    </Link>
                    <Link
                      href={`/dashboard/admins/products/${p.slug}/edit`}
                      className="px-3 py-2 bg-yellow-600 text-white rounded text-center text-xs sm:text-sm w-full sm:w-auto"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-300 text-sm sm:text-base">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left">Title</th>
                    <th className="px-4 py-2 text-left">Price</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Category</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition">
                      <td className="border px-4 py-2">{p.title}</td>
                      <td className="border px-4 py-2">${p.price}</td>
                      <td className="border px-4 py-2">{p.status}</td>
                      <td className="border px-4 py-2">{p.category?.name ?? "-"}</td>
                      <td className="border px-4 py-2">
                        <Link
                          href={`/dashboard/admins/products/${p.slug}`}
                          className="px-3 py-2 bg-indigo-600 text-white rounded text-xs sm:text-sm hover:bg-indigo-700 transition"
                        >
                          View
                        </Link>
                        <Link
                          href={`/dashboard/admins/products/${p.slug}/edit`}
                          className="ml-2 px-3 py-2 bg-yellow-600 text-white rounded text-xs sm:text-sm hover:bg-yellow-700 transition"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )
      )}

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mt-4 text-sm sm:text-base">
        <button
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
          className="px-3 py-2 bg-gray-200 rounded disabled:opacity-50 w-full sm:w-auto"
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage(page + 1)}
          className="px-3 py-2 bg-gray-200 rounded disabled:opacity-50 w-full sm:w-auto"
        >
          Next
        </button>
      </div>
    </div>
  );
}

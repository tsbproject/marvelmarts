"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import DashboardHeader from "@/app/_components/DashboardHeader";
import { useNotification } from "@/app/_context/NotificationContext";

interface Product {
  id: string;
  slug: string;
  title: string;
  price: number;
  status: string;
  category?: { name: string };
}

interface ProductResponse {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);

  const searchParams = useSearchParams();
  const router = useRouter();
  const { notifySuccess, notifyError, notifyInfo } = useNotification(); // ✅ only notifications now

  const page = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("pageSize")) || 10;
  const search = searchParams.get("search")?.trim() ?? "";

       useEffect(() => {
  const query = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    search,
  });

  fetch(`/api/products?${query.toString()}`)
    .then((res) => res.json())
    .then((data: ProductResponse) => {
      setProducts(data.items ?? []);
      setTotal(data.total ?? 0);

      if (data.items && data.items.length > 0) {
        notifySuccess("Products loaded successfully ✅");
      } else {
        notifyInfo("No products available 📭");
      }
    })
    .catch((err) => {
      console.error("Error fetching products:", err);
      notifyError("Failed to load products ❌");
    });
}, [page, pageSize, search, notifySuccess, notifyError, notifyInfo]);


  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchValue = formData.get("search")?.toString() ?? "";
    router.push(
      `/dashboard/admins/products?page=1&pageSize=${pageSize}&search=${encodeURIComponent(
        searchValue
      )}`
    );
    notifyInfo(`Searching for "${searchValue}" 🔍`);
  }

  function setPage(nextPage: number) {
    router.push(
      `/dashboard/admins/products?page=${nextPage}&pageSize=${pageSize}&search=${encodeURIComponent(
        search
      )}`
    );
    notifyInfo(`Navigated to page ${nextPage} 📄`);
  }

  return (
    <div className="p-8 w-full">
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
      <form onSubmit={handleSearch} className="mb-4 flex items-center gap-2">
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Search products..."
          className="border rounded px-3 py-2 w-64"
        />
        <button className="px-4 py-2 bg-blue-600 text-white rounded">
          Search
        </button>
      </form>

      {/* Products table */}
      {(products ?? []).length === 0 ? (
        <p>No products found.</p>
      ) : (
        <table className="table-auto w-full border">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Title</th>
              <th className="px-4 py-2 text-left">Price</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Category</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td className="border px-4 py-2">{p.title}</td>
                <td className="border px-4 py-2">${p.price}</td>
                <td className="border px-4 py-2">{p.status}</td>
                <td className="border px-4 py-2">{p.category?.name ?? "-"}</td>
                <td className="border px-4 py-2">
                  <Link
                    href={`/dashboard/admins/products/${p.slug}`}
                    className="btn btn-sm"
                  >
                    View
                  </Link>
                  <Link
                    href={`/dashboard/admins/products/${p.slug}/edit`}
                    className="btn btn-sm ml-2"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <button
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
          className="btn btn-secondary disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage(page + 1)}
          className="btn btn-secondary disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

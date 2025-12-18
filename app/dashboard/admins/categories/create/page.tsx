"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useNotification } from "@/app/_context/NotificationContext";
import { useLoadingOverlay } from "@/app/_context/LoadingOverlayContext";

export default function CreateCategoryPage() {
  const router = useRouter();
  const { notifySuccess, notifyError } = useNotification();
  const { setLoading } = useLoadingOverlay();

  const [form, setForm] = useState({ name: "", slug: "", parentId: "", position: 0 });
  const [categories, setCategories] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [loading] = useState(false);
  const [error, setError] = useState<string | null>(null); // ✅ add this

  useEffect(() => {
    async function fetchCategories() {
      const res = await fetch("/api/admins/categories");
      const data = await res.json();
      if (data.success) setCategories(data.categories);
    }
    fetchCategories();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setLoading(true);
    setError(null); // ✅ clear error before submit

    try {
      const res = await fetch("/api/admins/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        notifySuccess("Category created successfully");
        router.push("/dashboard/admins/categories");
      } else {
        setError(data.error || "Failed to create category"); // ✅ set error state
        notifyError(data.error || "Failed to create category");
      }
    } catch {
      setError("Unexpected error occurred");
      notifyError("Unexpected error occurred");
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  }


  return (
    <div className="max-w-lg mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Create Category</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border p-2 w-full rounded"
          required
        />

        <input
          type="text"
          placeholder="Slug"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          className="border p-2 w-full rounded"
          required
        />

        {/* 🔹 Dropdown for parent category */}
        <select
          value={form.parentId}
          onChange={(e) => setForm({ ...form, parentId: e.target.value })}
          className="border p-2 w-full rounded"
        >
          <option value="">No Parent (Main Category)</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Position"
          value={form.position}
          onChange={(e) => setForm({ ...form, position: Number(e.target.value) })}
          className="border p-2 w-full rounded"
        />

        {error && <p className="text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
        >
          {loading ? "Saving..." : "Save Category"}
        </button>
      </form>
     

      <Link href="/dashboard/admins">
      <button className=" mt-10 border text-2xl text-white text-center
       rounded-2xl font-bold cursor-pointer hover:bg-blue-900
       bg-accent-navy p-4"> Back to Admin</button></Link>
    
    </div>
  );
}






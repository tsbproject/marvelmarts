


"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useNotification } from "@/app/_context/NotificationContext";
import { useLoadingOverlay } from "@/app/_context/LoadingOverlayContext";

export default function EditCategoryPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const { notifySuccess, notifyError } = useNotification();
  const { setLoading } = useLoadingOverlay();

  const [form, setForm] = useState({
    name: "",
    slug: "",
    parentId: "",
    position: 0,
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLocalLoading] = useState(true); // local loading for initial fetch
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔹 Fetch all categories + current category
  useEffect(() => {
    async function fetchData() {
      try {
        setLocalLoading(true);
        const res = await fetch("/api/admins/categories");
        const data = await res.json();

        if (data.success) {
          setCategories(data.categories);

          const current = data.categories.find((c: any) => c.id === id);
          if (current) {
            setForm({
              name: current.name,
              slug: current.slug,
              parentId: current.parentId ?? "",
              position: current.position ?? 0,
            });
          }
        } else {
          setError("Failed to load categories");
          notifyError("Failed to load categories");
        }
      } catch (err) {
        setError("Error fetching category");
        notifyError("Error fetching category");
      } finally {
        setLocalLoading(false);
      }
    }
    fetchData();
  }, [id, notifyError]);

  // 🔹 Handle update
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setLoading(true); // global overlay spinner
    setError(null);

    try {
      const res = await fetch(`/api/admins/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        notifySuccess("Category updated successfully");
        router.push("/dashboard/admins/categories");
      } else {
        setError(data.error || "Failed to update category");
        notifyError(data.error || "Failed to update category");
      }
    } catch {
      setError("Unexpected error occurred");
      notifyError("Unexpected error occurred");
    } finally {
      setSaving(false);
      setLoading(false);
    }
  }

  if (loading) return <p className="p-8">Loading category...</p>;

  return (
    <div className="max-w-lg mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Edit Category</h1>

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
          {categories
            .filter((cat) => cat.id !== id) // prevent selecting itself
            .map((cat) => (
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
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
        >
          {saving ? "Updating..." : "Update Category"}
        </button>
      </form>
    </div>
  );
}

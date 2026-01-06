

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useNotification } from "@/app/_context/NotificationContext";
import { useLoadingOverlay } from "@/app/_context/LoadingOverlayContext";

//  Utility to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

export default function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);

  const router = useRouter();
  const { notifySuccess, notifyError } = useNotification();
  const { setLoading } = useLoadingOverlay();

  const [form, setForm] = useState({
    name: "",
    slug: "",
    parentId: "",
    position: 0,
    imageUrl: "",
    metaTitle: "",
    metaDescription: "",
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLocalLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [finalSlug, setFinalSlug] = useState<string>("");
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Fetch categories + current category
  useEffect(() => {
    async function fetchData() {
      try {
        setLocalLoading(true);

        const res = await fetch("/api/admins/categories?all=true");
        const data = await res.json();

        setCategories(data.categories);

        const current = data.categories.find((c: any) => c.id === id);
        if (current) {
          setForm({
            name: current.name,
            slug: current.slug,
            parentId: current.parentId ?? "",
            position: current.position ?? 0,
            imageUrl: current.imageUrl ?? "",
            metaTitle: current.metaTitle ?? "",
            metaDescription: current.metaDescription ?? "",
          });
          setFinalSlug(current.slug);
          if (current.imageUrl) setPreviewUrl(current.imageUrl);
        }
      } catch {
        setError("Error fetching category");
        notifyError("Error fetching category");
      } finally {
        setLocalLoading(false);
      }
    }
    fetchData();
  }, [id, notifyError]);

  // Auto-generate slug when name changes
  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newName = e.target.value;
    const newSlug = generateSlug(newName);
    setForm({ ...form, name: newName, slug: newSlug });
    setFinalSlug(newSlug);
    validateSlug(newSlug);
  }

  // Validate slug availability
  async function validateSlug(slug: string) {
    if (!slug) {
      setSlugAvailable(null);
      return;
    }
    try {
      const res = await fetch(
        `/api/admins/categories/check-slug?slug=${slug}&excludeId=${id}`
      );
      const data = await res.json();
      setSlugAvailable(!data.exists);
    } catch {
      setSlugAvailable(null);
    }
  }

  //  Resolve slug conflicts
  async function resolveSlugConflict(baseSlug: string): Promise<string> {
    let candidate = baseSlug;
    let counter = 2;

    while (true) {
      const res = await fetch(
        `/api/admins/categories/check-slug?slug=${candidate}&excludeId=${id}`
      );
      const data = await res.json();

      if (!data.exists) return candidate;
      candidate = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  // Handle image upload (local preview)
  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setForm({ ...form, imageUrl: url });
    }
  }

  // Handle update
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setLoading(true);
    setError(null);

    try {
      let resolvedSlug = form.slug;

      const resCheck = await fetch(
        `/api/admins/categories/check-slug?slug=${form.slug}&excludeId=${id}`
      );
      const dataCheck = await resCheck.json();
      if (dataCheck.exists) {
        resolvedSlug = await resolveSlugConflict(form.slug);
        notifyError(`Slug conflict detected. Using "${resolvedSlug}" instead.`);
      }

      setFinalSlug(resolvedSlug);

      const res = await fetch(`/api/admins/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, slug: resolvedSlug }),
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
        {/* Name */}
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={handleNameChange}
          className="border p-2 w-full rounded"
          required
        />

        {/* Slug */}
        <input
          type="text"
          placeholder="Slug"
          value={form.slug}
          onChange={(e) => {
            setForm({ ...form, slug: e.target.value });
            setFinalSlug(e.target.value);
            validateSlug(e.target.value);
          }}
          onBlur={() => validateSlug(form.slug)}
          className="border p-2 w-full rounded"
          required
        />

        {finalSlug && (
          <p className="text-sm">
            Final slug:{" "}
            <span className="font-mono text-blue-700">{finalSlug}</span>{" "}
            {slugAvailable === true && (
              <span className="text-green-600">✓ Available</span>
            )}
            {slugAvailable === false && (
              <span className="text-red-600">✗ Already taken</span>
            )}
          </p>
        )}

        {/* Parent */}
        <select
          value={form.parentId}
          onChange={(e) => setForm({ ...form, parentId: e.target.value })}
          className="border p-2 w-full rounded"
        >
          <option value="">No Parent (Main Category)</option>
          {categories.filter((cat) => cat.id !== id).map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* Position */}
        <input
          type="number"
          placeholder="Position"
          value={form.position}
          onChange={(e) =>
            setForm({ ...form, position: Number(e.target.value) })
          }
          className="border p-2 w-full rounded"
        />

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium">Category Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="mt-1 block w-full"
          />
          {previewUrl && (
            <img src={previewUrl} alt="Preview" className="mt-2 h-24 rounded" />
          )}
        </div>

        {/* SEO Fields */}
        <input
          type="text"
          placeholder="Meta Title (max 60 chars)"
          maxLength={60}
          value={form.metaTitle}
          onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
          className="border p-2 w-full rounded"
        />

        <textarea
          placeholder="Meta Description (max 160 chars)"
          maxLength={160}
          value={form.metaDescription}
          onChange={(e) =>
            setForm({ ...form, metaDescription: e.target.value })
          }
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
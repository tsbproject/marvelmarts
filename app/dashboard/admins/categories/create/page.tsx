"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useNotification } from "@/app/_context/NotificationContext";
import { useLoadingOverlay } from "@/app/_context/LoadingOverlayContext";

//Utility to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // remove special chars
    .replace(/\s+/g, "-");        // replace spaces with hyphens
}

export default function CreateCategoryPage() {
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
  const [parentInput, setParentInput] = useState<string>(""); //separate input value for typing/search
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [finalSlug, setFinalSlug] = useState<string>("");
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      const res = await fetch("/api/admins/categories?all=true");
      const data = await res.json();
      setCategories(data.categories);

      // If editing or prefilled parentId exists, reflect its name in the input
      if (form.parentId) {
        const match = data.categories.find((c: any) => c.id === form.parentId);
        if (match) setParentInput(match.name);
      }
    }
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //Auto-generate slug when name changes
  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newName = e.target.value;
    const newSlug = generateSlug(newName);
    setForm((prev) => ({ ...prev, name: newName, slug: newSlug }));
    setFinalSlug(newSlug);
    validateSlug(newSlug);
  }

  //Validate slug availability
  async function validateSlug(slug: string) {
    if (!slug) {
      setSlugAvailable(null);
      return;
    }
    try {
      const res = await fetch(`/api/admins/categories/check-slug?slug=${slug}`);
      const data = await res.json();
      setSlugAvailable(!data.exists);
    } catch {
      setSlugAvailable(null);
    }
  }

  //Resolve slug conflicts
  async function resolveSlugConflict(baseSlug: string): Promise<string> {
    let candidate = baseSlug;
    let counter = 2;
    while (true) {
      const res = await fetch(`/api/admins/categories/check-slug?slug=${candidate}`);
      const data = await res.json();
      if (!data.exists) return candidate;
      candidate = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  //Handle image upload (local preview + store URL)
  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setForm((prev) => ({ ...prev, imageUrl: url }));
    }
  }

  //Handle parent category typing and selection (search inside the field)
  function handleParentInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setParentInput(value); // allow free typing

    // Map typed value to id if it matches a known category name (case-insensitive)
    if (!value || value.trim() === "" || value === "No Parent (Main Category)") {
      setForm((prev) => ({ ...prev, parentId: "" }));
      return;
    }

    const match = categories.find(
      (c: any) => c.name.toLowerCase() === value.toLowerCase()
    );

    setForm((prev) => ({ ...prev, parentId: match ? match.id : "" }));
  }

  // Optional: snap to exact match on blur to avoid partial text lingering
  function handleParentInputBlur() {
    if (!parentInput || parentInput === "No Parent (Main Category)") {
      setParentInput("");
      setForm((prev) => ({ ...prev, parentId: "" }));
      return;
    }
    const match = categories.find(
      (c: any) => c.name.toLowerCase() === parentInput.toLowerCase()
    );
    if (!match) {
      // Keep user text, but ensure backend gets no invalid id
      setForm((prev) => ({ ...prev, parentId: "" }));
    } else {
      // Sync input to canonical name casing
      setParentInput(match.name);
      setForm((prev) => ({ ...prev, parentId: match.id }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setLoading(true);
    setError(null);

    try {
      let resolvedSlug = form.slug;
      const resCheck = await fetch(`/api/admins/categories/check-slug?slug=${form.slug}`);
      const dataCheck = await resCheck.json();
      if (dataCheck.exists) {
        resolvedSlug = await resolveSlugConflict(form.slug);
        notifyError(`Slug conflict detected. Using "${resolvedSlug}" instead.`);
      }
      setFinalSlug(resolvedSlug);

      const res = await fetch("/api/admins/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, slug: resolvedSlug }),
      });

      const data = await res.json();
      if (res.ok) {
        notifySuccess("Category created successfully");
        router.push("/dashboard/admins/categories");
      } else {
        setError(data.error || "Failed to create category");
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
    <div className="max-w-4xl max-h-screen my-auto mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Create Category</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={handleNameChange}
          className="border text-2xl p-2 w-full rounded"
          required
        />

        {/* Slug */}
        <input
          type="text"
          placeholder="Slug"
          value={form.slug}
          onChange={(e) => {
            setForm((prev) => ({ ...prev, slug: e.target.value }));
            setFinalSlug(e.target.value);
            validateSlug(e.target.value);
          }}
          onBlur={() => validateSlug(form.slug)}
          className="border text-2xl p-2 w-full rounded"
          required
        />

        {/* Slug Preview */}
        {finalSlug && (
          <p className="text-sm">
            Final slug:{" "}
            <span className="font-mono text-2xl text-blue-700">{finalSlug}</span>{" "}
            {slugAvailable === true && (
              <span className="text-2xl text-green-600">✓ Available</span>
            )}
            {slugAvailable === false && (
              <span className="text-red-600">✗ Already taken</span>
            )}
          </p>
        )}

        {/* Parent Category with Searchable Select (datalist) */}
        <label className="block text-lg font-medium">Parent Category</label>
        <input
          list="categories-list"
          value={parentInput}
          onChange={handleParentInputChange}
          onBlur={handleParentInputBlur}
          className="border text-2xl p-2 w-full rounded"
          placeholder="Select or search category..."
        />
        <datalist id="categories-list">
          <option value="No Parent (Main Category)" />
          {categories.map((cat: any) => (
            <option key={cat.id} value={cat.name} />
          ))}
        </datalist>

        {/* Position */}
        <input
          type="number"
          placeholder="Position"
          value={form.position}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, position: Number(e.target.value) }))
          }
          className="border text-2xl p-2 w-full rounded"
        />

        {/* Image Upload */}
        <div>
          <label className="block text-lg font-medium">Category Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="mt-1 block w-full text-2xl"
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
          onChange={(e) =>
            setForm((prev) => ({ ...prev, metaTitle: e.target.value }))
          }
          className="border text-2xl p-2 w-full rounded"
        />

        <textarea
          placeholder="Meta Description (max 160 chars)"
          maxLength={160}
          value={form.metaDescription}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, metaDescription: e.target.value }))
          }
          className="border text-2xl p-2 w-full rounded"
        />

        {/* Error */}
        {error && <p className="text-red-600">{error}</p>}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="bg-green-600 hover:bg-green-700 text-white text-2xl px-4 py-2 rounded-xl transition"
        >
          {submitting ? "Saving..." : "Save Category"}
        </button>
      </form>

      {/* Back */}
      <Link href="/dashboard/admins">
        <button
          className="mt-10 border text-2xl text-white text-center rounded-2xl font-bold cursor-pointer hover:bg-blue-900 bg-accent-navy p-4"
        >
          Back to Admin
        </button>
      </Link>
    </div>
  );
}

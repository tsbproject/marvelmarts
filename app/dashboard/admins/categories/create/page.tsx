




"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useNotification } from "@/app/_context/NotificationContext";
import { useLoadingOverlay } from "@/app/_context/LoadingOverlayContext";

// 🔹 Utility to generate slug from name
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
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [finalSlug, setFinalSlug] = useState<string>(""); 
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null); // 🔹 live validation

  useEffect(() => {
  async function fetchCategories() {
    const res = await fetch("/api/admins/categories?all=true");
    const data = await res.json();
    // ✅ always set categories, no need for data.success check
    setCategories(data.categories);
  }
  fetchCategories();
}, []);

  // 🔹 Auto-generate slug when name changes
  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newName = e.target.value;
    const newSlug = generateSlug(newName);
    setForm({
      ...form,
      name: newName,
      slug: newSlug,
    });
    setFinalSlug(newSlug);
    validateSlug(newSlug);
  }

  // 🔹 Validate slug availability in real-time
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

  // 🔹 Try to resolve slug conflicts automatically
  async function resolveSlugConflict(baseSlug: string): Promise<string> {
    let candidate = baseSlug;
    let counter = 2;

    while (true) {
      const res = await fetch(`/api/admins/categories/check-slug?slug=${candidate}`);
      const data = await res.json();

      if (!data.exists) {
        return candidate; // ✅ free slug found
      }

      candidate = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setLoading(true);
    setError(null);

    try {
      let resolvedSlug = form.slug;

      // 🔹 Auto-resolve conflict if slug is taken
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
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={handleNameChange}
          className="border text-2xl p-2 w-full rounded"
          required
        />

        <input
          type="text"
          placeholder="Slug"
          value={form.slug}
          onChange={(e) => {
            setForm({ ...form, slug: e.target.value });
            setFinalSlug(e.target.value);
            validateSlug(e.target.value);
          }}
          onBlur={() => validateSlug(form.slug)} // 🔹 validate on blur too
          className="border text-2xl p-2 w-full rounded"
          required
        />

        {/* 🔹 Slug Preview + Availability */}
        {finalSlug && (
          <p className="text-sm">
            Final slug:{" "}
            <span className="font-mono text-2xl text-blue-700">{finalSlug}</span>{" "}
            {slugAvailable === true && (
              <span className=" text-2xl text-green-600">✓ Available</span>
            )}
            {slugAvailable === false && (
              <span className="text-red-600">✗ Already taken</span>
            )}
          </p>
        )}

      <select
        value={form.parentId}
        onChange={(e) => setForm({ ...form, parentId: e.target.value })}
        className="border text-2xl p-2 w-full rounded"
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
          className="border text-2xl p-2 w-full rounded"
        />

        {error && <p className="text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="bg-green-600 hover:bg-green-700 text-white text-2xl px-4 py-2 rounded-xl transition"
        >
          {submitting ? "Saving..." : "Save Category"}
        </button>
      </form>

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


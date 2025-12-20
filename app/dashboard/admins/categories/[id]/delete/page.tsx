"use client";

import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { useNotification } from "@/app/_context/NotificationContext";
import { useLoadingOverlay } from "@/app/_context/LoadingOverlayContext";

export default function DeleteCategoryPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id; // ✅ extract id safely
  const router = useRouter();
  const { notifySuccess, notifyError } = useNotification();
  const { setLoading } = useLoadingOverlay();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!id) {
      setError("Invalid category ID");
      return;
    }

    setSubmitting(true);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admins/categories/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (res.ok) {
        notifySuccess("Category deleted successfully");
        router.push("/dashboard/admins/categories");
      } else {
        setError(data.error || "Failed to delete category");
        notifyError(data.error || "Failed to delete category");
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
      <h1 className="text-2xl font-bold mb-6">Delete Category</h1>
      <p className="mb-4 text-gray-700">
        Are you sure you want to delete this category? This action cannot be undone.
      </p>

      {error && <p className="text-red-600">{error}</p>}

      <div className="flex gap-4">
        <button
          onClick={handleDelete}
          disabled={submitting}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition"
        >
          {submitting ? "Deleting..." : "Yes, Delete"}
        </button>

        <button
          onClick={() => router.push("/dashboard/admins/categories")}
          className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

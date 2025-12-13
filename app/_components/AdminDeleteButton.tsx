


// app/_components/AdminDeleteButton.tsx
"use client";

import { useState } from "react";
import { useNotification } from "@/app/_context/NotificationContext";

interface AdminDeleteButtonProps {
  id: string;
}

export default function AdminDeleteButton({ id }: AdminDeleteButtonProps) {
  const { notifySuccess, notifyError } = useNotification();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this admin?")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admins/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (res.ok && data.success) {
        notifySuccess("Admin deleted successfully");
        // Optionally refresh the page or router
      } else {
        notifyError(data.error ?? "Failed to delete admin");
      }
    } catch {
      notifyError("Unexpected error deleting admin");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
    >
      {loading ? "Deleting…" : "Delete"}
    </button>
  );
}


"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useNotification } from "@/app/_context/NotificationContext";
import { useLoadingOverlay } from "@/app/_context/LoadingOverlayContext";

interface AdminDeleteButtonProps {
  id: string;
}

export default function AdminDeleteButton({ id }: AdminDeleteButtonProps) {
  const { notifySuccess, notifyError } = useNotification();
  const { setLoading } = useLoadingOverlay();
  const router = useRouter();

  const [loading, setLocalLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this admin?")) return;

    setLocalLoading(true);
    setLoading(true); // 🔹 global overlay spinner

    try {
      const res = await fetch(`/api/admins/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (res.ok && data.success) {
        notifySuccess("Admin deleted successfully");
        router.refresh(); // 🔹 refresh page so table updates
      } else {
        notifyError(data.error ?? "Failed to delete admin");
      }
    } catch {
      notifyError("Unexpected error deleting admin");
    } finally {
      setLocalLoading(false);
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



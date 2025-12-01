"use client";

export default function AdminActions({ id }: { id: string }) {
  const handleDelete = async () => {
    if (!confirm("Delete this admin?")) return;

    await fetch("/api/admin/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    location.reload();
  };

  return (
    <button
      onClick={handleDelete}
      className="text-sm text-red-600 hover:underline"
    >
      Delete
    </button>
  );
}

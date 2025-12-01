"use client";

export default function AdminDeleteButton({ id }) {
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this admin?")) return;

    const res = await fetch(`/api/admin/delete?id=${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      alert("Delete failed.");
      return;
    }

    alert("Admin deleted");
    window.location.reload();
  };

  return (
    <button className="text-red-600" onClick={handleDelete}>
      Delete
    </button>
  );
}

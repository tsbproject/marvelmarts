"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Permissions type
type Permissions = {
  manageUsers?: boolean;
  manageBlogs?: boolean;
  manageMessages?: boolean;
  manageSettings?: boolean;
  manageAdmins?: boolean;
};

// Admin type exactly matches Prisma select
interface Admin {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: string | null;
  permissions?: Record<string, boolean> | null;
}

// Optional global window payload for client-side usage
declare global {
  interface Window {
    __ADMIN_PAYLOAD?: Admin;
  }
}

interface EditAdminFormProps {
  admin?: Admin;
}

export default function EditAdminForm({ admin }: EditAdminFormProps) {
  const router = useRouter();

  // Initialize admin from prop or global window payload
  const initial: Admin | undefined =
    admin ?? (typeof window !== "undefined" ? window.__ADMIN_PAYLOAD : undefined);

  const [perms, setPerms] = useState<Permissions>(initial?.permissions ?? {});
  const [loading, setLoading] = useState(false);

  function toggle(key: keyof Permissions) {
    setPerms((p) => ({ ...p, [key]: !p[key] }));
  }

  async function save() {
    if (!initial?.id) return;

    setLoading(true);

    const res = await fetch(`/api/admin/update-permissions/${initial.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ permissions: perms }),
    });

    const data: { error?: string } = await res.json();
    setLoading(false);

    if (!res.ok) {
      alert(data.error || "Failed");
      return;
    }

    alert("Saved");
    router.push("/dashboard/admins");
  }

  if (!initial) return <div className="p-4">Admin data not found</div>;

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-lg font-semibold mb-3">Permissions for {initial.name}</h2>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {(
          ["manageUsers", "manageBlogs", "manageMessages", "manageSettings", "manageAdmins"] as Array<
            keyof Permissions
          >
        ).map((key) => (
          <label key={key} className="flex items-center space-x-2">
            <input type="checkbox" checked={!!perms[key]} onChange={() => toggle(key)} />
            <span className="text-sm">{key}</span>
          </label>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={save}
          disabled={loading}
          className="px-4 py-2 bg-black text-white rounded"
        >
          {loading ? "Saving..." : "Save"}
        </button>
        <button
          onClick={() => router.push("/dashboard/admins")}
          className="px-4 py-2 border rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

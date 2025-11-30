"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

declare global {
  interface Window { __ADMIN_PAYLOAD?: any }
}

export default function EditAdminForm({ admin }: { admin?: any }) {
  const router = useRouter();
  const initial = admin ?? (typeof window !== "undefined" && window.__ADMIN_PAYLOAD);
  const [perms, setPerms] = useState(initial?.permissions ?? {});
  const [loading, setLoading] = useState(false);

  function toggle(key: string) {
    setPerms((p: any) => ({ ...p, [key]: !p[key] }));
  }

  async function save() {
    setLoading(true);
    const res = await fetch(`/api/admin/update-permissions/${initial.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ permissions: perms }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      alert(data.error || "Failed");
      return;
    }
    alert("Saved");
    router.push("/dashboard/admins");
  }

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-lg font-semibold mb-3">Permissions for {initial.name}</h2>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {["manageUsers","manageBlogs","manageMessages","manageSettings","manageAdmins"].map(k => (
          <label key={k} className="flex items-center space-x-2">
            <input type="checkbox" checked={!!perms[k]} onChange={() => toggle(k)} />
            <span className="text-sm">{k}</span>
          </label>
        ))}
      </div>

      <div className="flex gap-2">
        <button onClick={save} disabled={loading} className="px-4 py-2 bg-black text-white rounded">
          {loading ? "Saving..." : "Save"}
        </button>
        <button onClick={() => router.push("/dashboard/admins")} className="px-4 py-2 border rounded">Cancel</button>
      </div>
    </div>
  );
}

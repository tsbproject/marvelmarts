// app/dashboard/admins/create/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const defaultPerms = {
  manageUsers: false,
  manageBlogs: false,
  manageMessages: false,
  manageSettings: false,
  manageAdmins: false,
};

export default function CreateAdminPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "ADMIN" });
  const [perms, setPerms] = useState(defaultPerms);
  const [loading, setLoading] = useState(false);

  function toggle(key: keyof typeof defaultPerms) {
    setPerms(prev => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const payload = { ...form, permissions: perms };

    const res = await fetch("/api/admin/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      alert(data.error || "Failed to create admin");
      return;
    }
    alert("Admin created");
    router.push("/dashboard/admins");
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create Admin</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input name="name" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border p-2 rounded" />
        </div>

        <div>
          <label className="block text-sm font-medium">Email</label>
          <input name="email" type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border p-2 rounded" />
        </div>

        <div>
          <label className="block text-sm font-medium">Password</label>
          <input name="password" type="password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full border p-2 rounded" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Permissions</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.keys(perms).map(k => (
              <label key={k} className="flex items-center space-x-2">
                <input type="checkbox" checked={(perms as any)[k]} onChange={() => toggle(k as any)} />
                <span className="text-sm">{k}</span>
              </label>
            ))}
          </div>
        </div>

        <button disabled={loading} className="px-4 py-2 bg-black text-white rounded">
          {loading ? "Creating..." : "Create Admin"}
        </button>
      </form>
    </div>
  );
}

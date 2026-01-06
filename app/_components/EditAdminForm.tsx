"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useNotification } from "@/app/_context/NotificationContext";

export type Permissions = {
  manageAdmins: boolean;
  manageUsers: boolean;
  manageBlogs: boolean;
  manageProducts: boolean;
  manageOrders: boolean;
  manageMessages: boolean;
  manageSettings: boolean;
};

const DEFAULT_PERMISSIONS: Permissions = {
  manageAdmins: false,
  manageUsers: false,
  manageBlogs: false,
  manageProducts: false,
  manageOrders: false,
  manageMessages: false,
  manageSettings: false,
};

export default function EditAdminForm({
  mode,
  initialData,
}: {
  mode: "create" | "edit";
  initialData?: any;
}) {
  const { notifySuccess, notifyError } = useNotification();
  const router = useRouter();

  const [name, setName] = useState(initialData?.name || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"ADMIN" | "SUPER_ADMIN">(
    initialData?.role || "ADMIN"
  );

  const [permissions, setPermissions] = useState<Permissions>({
    ...DEFAULT_PERMISSIONS,
    ...(initialData?.adminProfile?.permissions || {}),
  });

  function toggle(key: keyof Permissions) {
    setPermissions((p) => ({ ...p, [key]: !p[key] }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    const body: any = {
      name,
      email,
      role,
      permissions,
    };

    if (mode === "create") body.password = password;
    else if (password.trim().length > 0) body.password = password;

    try {
      const res = await fetch(
        mode === "create"
          ? "/api/admins"
          : `/api/admins/${initialData.id}`,
        {
          method: mode === "create" ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        notifyError(data.error || "Error saving admin");
      } else {
        notifySuccess(
          mode === "create"
            ? "Admin created successfully"
            : "Admin updated successfully"
        );
        router.push("/dashboard/admins");
      }
    } catch {
      notifyError("Server error");
    }
  }

  return (
    <form
      onSubmit={submit}
      className="bg-white shadow rounded-xl p-6 space-y-6"
    >
      {/* Name */}
      <div>
        <label className="block font-medium mb-1">Name</label>
        <input
          className="w-full px-3 py-2 border rounded-md"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      {/* Email */}
      <div>
        <label className="block font-medium mb-1">Email</label>
        <input
          className="w-full px-3 py-2 border rounded-md"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      {/* Password (optional for edit) */}
      <div>
        <label className="block font-medium mb-1">
          {mode === "create" ? "Password" : "New Password (optional)"}
        </label>
        <input
          className="w-full px-3 py-2 border rounded-md"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={mode === "create" ? 6 : 0}
        />
      </div>

      {/* Role */}
      <div>
        <label className="block font-medium mb-1">Role</label>
        <select
          className="w-full px-3 py-2 border rounded-md"
          value={role}
          onChange={(e) =>
            setRole(e.target.value as "ADMIN" | "SUPER_ADMIN")
          }
        >
          <option value="ADMIN">Admin</option>
          <option value="SUPER_ADMIN">Super Admin</option>
        </select>
      </div>

      {/* Permissions */}
      <div>
        <label className="block font-medium mb-2">Permissions</label>
        <div className="grid grid-cols-2 gap-3">
          {Object.keys(DEFAULT_PERMISSIONS).map((key) => (
            <label key={key} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={permissions[key as keyof Permissions]}
                onChange={() =>
                  toggle(key as keyof Permissions)
                }
              />
              <span className="capitalize">
                {key.replace(/([A-Z])/g, " $1")}
              </span>
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
      >
        {mode === "create" ? "Create Admin" : "Update Admin"}
      </button>
    </form>
  );
}

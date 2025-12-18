"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useNotification } from "@/app/_context/NotificationContext";
import { useLoadingOverlay } from "@/app/_context/LoadingOverlayContext";

export type Permissions = {
  manageAdmins: boolean;
  manageUsers: boolean;
  manageBlogs: boolean;
  manageProducts: boolean;
  manageOrders: boolean;
  manageMessages: boolean;
  manageSettings: boolean;
  manageCategories: boolean; // 🔹 new permission
};


export type AdminProfile = {
  id: string;
  userId: string;
  permissions?: Permissions;
  notes?: string | null;
};

export type AdminUser = {
  id: string; // User.id
  name?: string | null;
  email: string;
  role: "ADMIN" | "SUPER_ADMIN" | "CUSTOMER";
  image?: string | null;
  adminProfile?: AdminProfile | null;
};

const DEFAULT_PERMISSIONS: Permissions = {
  manageAdmins: false,
  manageUsers: false,
  manageBlogs: false,
  manageProducts: false,
  manageOrders: false,
  manageMessages: false,
  manageSettings: false,
  manageCategories: false, // 🔹 new permission
};


type Props =
  | { mode: "create"; initialData?: undefined }
  | { mode: "edit"; initialData: AdminUser };

export default function EditAdminForm(props: Props) {
  const { mode } = props;
  const initialData = mode === "edit" ? props.initialData : undefined;

  const { notifySuccess, notifyError } = useNotification();
  const { setLoading } = useLoadingOverlay();
  const router = useRouter();

  const [name, setName] = useState<string>(initialData?.name ?? "");
  const [email, setEmail] = useState<string>(initialData?.email ?? "");
  const [password, setPassword] = useState<string>("");
  const [role, setRole] = useState<"ADMIN" | "SUPER_ADMIN">(
    initialData?.role === "SUPER_ADMIN" ? "SUPER_ADMIN" : "ADMIN"
  );

  const [permissions, setPermissions] = useState<Permissions>({
    ...DEFAULT_PERMISSIONS,
    ...(initialData?.adminProfile?.permissions ?? {}),
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(key: keyof Permissions) {
    setPermissions((p) => ({ ...p, [key]: !p[key] }));
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setLoading(true);
    setError(null);

    const body: {
      name?: string;
      email?: string;
      role?: "ADMIN" | "SUPER_ADMIN";
      password?: string;
      permissions?: Permissions;
    } = { name, email, role, permissions };

    if (mode === "create") {
      body.password = password;
    } else if (password.trim().length > 0) {
      body.password = password;
    }

    try {
      const url =
        mode === "create"
          ? "/api/admins"
          : `/api/admins/${initialData!.id}`;

      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error saving admin");
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
      setError("Server error while saving admin");
      notifyError("Server error while saving admin");
    } finally {
      setSaving(false);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="bg-white shadow rounded-xl p-6 space-y-6">
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

      {/* Password */}
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
          onChange={(e) => setRole(e.target.value as "ADMIN" | "SUPER_ADMIN")}
        >
          <option value="ADMIN">Admin</option>
          <option value="SUPER_ADMIN">Super Admin</option>
        </select>
      </div>

      {/* Permissions */}
      <div>
        <label className="block font-medium mb-2">Permissions</label>
        <div className="grid grid-cols-2 gap-3">
          {(Object.keys(DEFAULT_PERMISSIONS) as Array<keyof Permissions>).map(
            (key) => (
              <label key={key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={permissions[key]}
                  onChange={() => toggle(key)}
                />
                <span className="capitalize">
                  {String(key).replace(/([A-Z])/g, " $1")}
                </span>
              </label>
            )
          )}
        </div>
      </div>

      {error && <p className="text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
      >
        {saving
          ? mode === "create"
            ? "Creating..."
            : "Updating..."
          : mode === "create"
          ? "Create Admin"
          : "Update Admin"}
      </button>
    </form>
  );
}


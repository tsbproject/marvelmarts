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

export type AdminProfile = {
  id: string;
  userId: string;
  permissions?: Permissions;
  notes?: string | null;
};

export type AdminUser = {
  id: string; // User.id (canonical)
  name?: string | null;
  email: string;
  role: "ADMIN" | "SUPER_ADMIN" | "CUSTOMER"; // your schema default is CUSTOMER; API should return ADMIN/SUPER_ADMIN for this page
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
};

type Props =
  | { mode: "create"; initialData?: undefined }
  | { mode: "edit"; initialData: AdminUser };

export default function EditAdminForm(props: Props) {
  const { mode } = props;
  const initialData = mode === "edit" ? props.initialData : undefined;

  const { notifySuccess, notifyError } = useNotification();
  const router = useRouter();

  const [name, setName] = useState<string>(initialData?.name ?? "");
  const [email, setEmail] = useState<string>(initialData?.email ?? "");
  const [password, setPassword] = useState<string>("");
  const [role, setRole] = useState<"ADMIN" | "SUPER_ADMIN">(
    (initialData?.role === "SUPER_ADMIN" ? "SUPER_ADMIN" : "ADMIN")
  );

  const [permissions, setPermissions] = useState<Permissions>({
    ...DEFAULT_PERMISSIONS,
    ...(initialData?.adminProfile?.permissions ?? {}),
  });

  function toggle(key: keyof Permissions) {
    setPermissions((p) => ({ ...p, [key]: !p[key] }));
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const body: {
      name?: string;
      email?: string;
      role?: "ADMIN" | "SUPER_ADMIN";
      password?: string;
      permissions?: Permissions;
    } = {
      name,
      email,
      role,
      permissions,
    };

    if (mode === "create") {
      body.password = password;
    } else if (password.trim().length > 0) {
      body.password = password;
    }

    try {
      const url =
        mode === "create"
          ? "/api/admins"
          : `/api/admins/${initialData!.id}`; // IMPORTANT: this is User.id

      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = (await res.json()) as { error?: string };

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
      notifyError("Server error while saving admin");
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
          {(
            Object.keys(DEFAULT_PERMISSIONS) as Array<keyof Permissions>
          ).map((key) => (
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

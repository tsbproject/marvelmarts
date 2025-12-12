// "use client";

// import { FC, useState } from "react";
// import { useRouter } from "next/navigation";
// import { useNotification } from "@/app/_context/NotificationContext";
// import { Admin, Permissions } from "@/app/types/admin";

// interface Props {
//   admin: Admin;
// }

// const EditAdminForm: FC<Props> = ({ admin }) => {
//   const router = useRouter();
//   const { notifySuccess, notifyError } = useNotification();

//   const [form, setForm] = useState({
//     name: admin.name,
//     email: admin.email,
//     role: admin.role,
//     password: "",
//     confirmPassword: "",
//   });

//   const [perms, setPerms] = useState<Permissions>(
//     admin.adminProfile?.permissions ?? {
//       manageAdmins: false,
//       manageUsers: false,
//       manageBlogs: false,
//       manageProducts: false,
//       manageOrders: false,
//       manageMessages: false,
//       manageSettings: false,
//     }
//   );

//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);

//   const togglePermission = (key: keyof Permissions) =>
//     setPerms((p) => ({ ...p, [key]: !p[key] }));

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));
//   };

//   const validateForm = () => {
//     if (!form.name.trim() || !form.email.trim()) {
//       notifyError("Name and Email are required");
//       return false;
//     }
//     if (form.password && form.password !== form.confirmPassword) {
//       notifyError("Passwords do not match");
//       return false;
//     }
//     return true;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!validateForm()) return;

//     setLoading(true);
//     try {
//       const res = await fetch(`/api/admins/${admin.id}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ ...form, permissions: perms }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         notifyError(data.error || "Failed to update admin");
//         return;
//       }

//       notifySuccess("Admin updated successfully");
//       router.push("/dashboard/admins");
//     } catch {
//       notifyError("Server error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow max-w-lg mx-auto">
//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//         <div>
//           <label className="block mb-1 font-medium">Name</label>
//           <input
//             name="name"
//             value={form.name}
//             onChange={handleChange}
//             className="w-full border p-2 rounded"
//             required
//           />
//         </div>

//         <div>
//           <label className="block mb-1 font-medium">Email</label>
//           <input
//             type="email"
//             name="email"
//             value={form.email}
//             onChange={handleChange}
//             className="w-full border p-2 rounded"
//             required
//           />
//         </div>

//         <div>
//           <label className="block mb-1 font-medium">Role</label>
//           <select
//             name="role"
//             value={form.role}
//             onChange={handleChange}
//             className="w-full border p-2 rounded"
//           >
//             <option value="ADMIN">Admin</option>
//             <option value="SUPER_ADMIN">Super Admin</option>
//           </select>
//         </div>
//       </div>

//       <div>
//         <label className="block mb-2 font-medium">Password</label>
//         <div className="relative">
//           <input
//             type={showPassword ? "text" : "password"}
//             name="password"
//             value={form.password}
//             onChange={handleChange}
//             className="w-full border p-2 rounded"
//           />
//           <button
//             type="button"
//             onClick={() => setShowPassword((s) => !s)}
//             className="absolute right-2 top-2 text-sm text-gray-600"
//           >
//             {showPassword ? "Hide" : "Show"}
//           </button>
//         </div>
//         <input
//           type={showPassword ? "text" : "password"}
//           name="confirmPassword"
//           value={form.confirmPassword}
//           onChange={handleChange}
//           placeholder="Confirm password"
//           className="w-full border p-2 rounded mt-2"
//         />
//       </div>

//       <div>
//         <label className="block mb-2 font-medium">Permissions</label>
//         <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
//           {(Object.keys(perms) as Array<keyof Permissions>).map((key) => (
//             <label key={key} className="flex items-center space-x-2">
//               <input
//                 type="checkbox"
//                 checked={perms[key]}
//                 onChange={() => togglePermission(key)}
//               />
//               <span className="capitalize">{key.replace("manage", "")}</span>
//             </label>
//           ))}
//         </div>
//       </div>

//       <div className="flex gap-3">
//         <button
//           type="submit"
//           disabled={loading}
//           className="p-3 rounded bg-black text-white hover:bg-gray-900 transition disabled:opacity-50"
//         >
//           {loading ? "Saving..." : "Save changes"}
//         </button>
//         <button
//           type="button"
//           onClick={() => router.back()}
//           className="p-3 rounded border"
//         >
//           Cancel
//         </button>
//       </div>
//     </form>
//   );
// };

// export default EditAdminForm;


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

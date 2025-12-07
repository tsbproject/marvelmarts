// // app/dashboard/admins/create/page.tsx
// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";

// type Permissions = {
//   manageAdmins: boolean;
//   manageUsers: boolean;
//   manageBlogs: boolean;
//   manageProducts: boolean;
//   manageOrders: boolean;
//   manageMessages: boolean;
//   manageSettings: boolean;
 
// };

// type FormData = {
//   name: string;
//   email: string;
//   password: string;
//   role: "ADMIN" | "SUPER_ADMIN";
// };

// const defaultPerms: Permissions = {
//   manageAdmins: false,
//   manageUsers: false,
//   manageBlogs: false,
//   manageProducts: false,
//   manageOrders: false,
//   manageMessages: false,
//   manageSettings: false,
 
// };

// export default function CreateAdminPage() {
//   const router = useRouter();
//   const [form, setForm] = useState<FormData>({
//     name: "",
//     email: "",
//     password: "",
//     role: "ADMIN",
//   });
//   const [perms, setPerms] = useState<Permissions>(defaultPerms);
//   const [loading, setLoading] = useState(false);

//   function toggle(key: keyof Permissions) {
//     setPerms(prev => ({ ...prev, [key]: !prev[key] }));
//   }

//   async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
//     e.preventDefault();
//     setLoading(true);

//     const payload = { ...form, permissions: perms };

//     const res = await fetch("/api/admin/create", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(payload),
//     });

//     const data: { error?: string } = await res.json();
//     setLoading(false);

//     if (!res.ok) {
//       alert(data.error || "Failed to create admin");
//       return;
//     }

//     alert("Admin created");
//     router.push("/dashboard/admins");
//   }

//   return (
//     <div className="p-8 max-w-2xl mx-auto">
//       <h1 className="text-2xl font-bold mb-4">Create Admin</h1>
//       <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
//         <div>
//           <label className="block text-sm font-medium">Name</label>
//           <input
//             name="name"
//             required
//             value={form.name}
//             onChange={e => setForm({ ...form, name: e.target.value })}
//             className="w-full border p-2 rounded"
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium">Email</label>
//           <input
//             name="email"
//             type="email"
//             required
//             value={form.email}
//             onChange={e => setForm({ ...form, email: e.target.value })}
//             className="w-full border p-2 rounded"
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium">Password</label>
//           <input
//             name="password"
//             type="password"
//             required
//             value={form.password}
//             onChange={e => setForm({ ...form, password: e.target.value })}
//             className="w-full border p-2 rounded"
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium mb-2">Permissions</label>
//           <div className="grid grid-cols-2 gap-2">
//             {(Object.keys(perms) as Array<keyof Permissions>).map(key => (
//               <label key={key} className="flex items-center space-x-2">
//                 <input
//                   type="checkbox"
//                   checked={perms[key]}
//                   onChange={() => toggle(key)}
//                 />
//                 <span className="text-sm">{key}</span>
//               </label>
//             ))}
//           </div>
//         </div>

//         <button
//           type="submit"
//           disabled={loading}
//           className="px-4 py-2 bg-black text-white rounded"
//         >
//           {loading ? "Creating..." : "Create Admin"}
//         </button>
//       </form>
//     </div>
//   );
// }


"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useNotification } from "@/app/_context/NotificationContext"; // Correct notifications

type Permissions = {
  manageAdmins: boolean;
  manageUsers: boolean;
  manageBlogs: boolean;
  manageProducts: boolean;
  manageOrders: boolean;
  manageMessages: boolean;
  manageSettings: boolean;
};

type FormData = {
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "SUPER_ADMIN";
};

const defaultPerms: Permissions = {
  manageAdmins: false,
  manageUsers: false,
  manageBlogs: false,
  manageProducts: false,
  manageOrders: false,
  manageMessages: false,
  manageSettings: false,
};

export default function CreateAdminPage() {
  const router = useRouter();
  const { notifySuccess, notifyError } = useNotification();
  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    role: "ADMIN",
  });
  const [perms, setPerms] = useState<Permissions>(defaultPerms);
  const [loading, setLoading] = useState(false);

  function toggle(key: keyof Permissions) {
    setPerms((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const payload = { ...form, permissions: perms };

    try {
      const res = await fetch("/api/admin/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data: { error?: string } = await res.json();

      if (!res.ok) {
        notifyError(data.error || "Failed to create admin");
        return;
      }

      notifySuccess("Admin created successfully");
      router.push("/dashboard/admins");
    } catch (err) {
      console.error(err);
      notifyError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Create Admin</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-8 rounded-xl shadow-lg border border-gray-200"
      >
        {/* Admin Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-2xl font-medium text-gray-700">Name</label>
            <input
              name="name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 block w-full border text-xl border-gray-300 rounded-md p-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-2xl font-medium text-gray-700">Email</label>
            <input
              name="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1 block w-full border text-xl border-gray-300 rounded-md p-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label className="block text-2xl font-medium text-gray-700">Password</label>
            <input
              name="password"
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="mt-1 block w-full border text-xl border-gray-300 rounded-md p-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-2xl font-medium text-gray-700">Role</label>
            <select
              name="role"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as "ADMIN" | "SUPER_ADMIN" })}
              className="mt-1 block w-full border text-3xl border-gray-300 rounded-md p-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>
        </div>

        {/* Permissions */}
        <div>
          <label className="block text-2xl font-medium text-gray-700 mb-2">Permissions</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-2xl">
            {(Object.keys(perms) as Array<keyof Permissions>).map((key) => (
              <label
                key={key}
                className="flex items-center space-x-2 cursor-pointer  text-gray-700 hover:text-black"
              >
                <input
                  type="checkbox"
                  checked={perms[key]}
                  onChange={() => toggle(key)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600  focus:ring-blue-500"
                />
                <span className="text-2xl capitalize">{key.replace("manage", "")}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-4 rounded-lg text-white font-semibold transition ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-gray-900"
          }`}
        >
          {loading ? "Creating..." : "Create Admin"}
        </button>
      </form>
    </div>
  );
}

// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { useNotification } from "@/app/_context/NotificationContext";

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
//   const { notifySuccess, notifyError } = useNotification();
//   const [form, setForm] = useState<FormData>({
//     name: "",
//     email: "",
//     password: "",
//     role: "ADMIN",
//   });
//   const [perms, setPerms] = useState<Permissions>(defaultPerms);
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false); // 👈 password toggle

//   function toggle(key: keyof Permissions) {
//     setPerms((prev) => ({ ...prev, [key]: !prev[key] }));
//   }

//   async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
//     e.preventDefault();
//     setLoading(true);

//     const payload = { ...form, permissions: perms };

//     try {
//       const res = await fetch("/api/admins/create", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       const data: { error?: string } = await res.json();

//       if (!res.ok) {
//         notifyError(data.error || "Failed to create admin");
//         return;
//       }

//       notifySuccess("Admin created successfully");
//       router.push("/dashboard/admins");
//     } catch (err) {
//       console.error(err);
//       notifyError("An unexpected error occurred");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="p-8 max-w-5xl mx-auto">
//       <h1 className="text-3xl font-bold mb-6 text-gray-900">Create Admin</h1>

//       <form
//         onSubmit={handleSubmit}
//         className="space-y-6 bg-white p-8 rounded-xl shadow-lg border border-gray-200"
//       >
//         {/* Admin Info */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//           <div>
//             <label className="block text-2xl font-medium text-gray-700">Name</label>
//             <input
//               name="name"
//               required
//               value={form.name}
//               onChange={(e) => setForm({ ...form, name: e.target.value })}
//               className="mt-1 block w-full border text-xl border-gray-300 rounded-md p-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
//               placeholder="John Doe"
//             />
//           </div>

//           <div>
//             <label className="block text-2xl font-medium text-gray-700">Email</label>
//             <input
//               name="email"
//               type="email"
//               required
//               value={form.email}
//               onChange={(e) => setForm({ ...form, email: e.target.value })}
//               className="mt-1 block w-full border text-xl border-gray-300 rounded-md p-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
//               placeholder="admin@example.com"
//             />
//           </div>

//           <div>
//             <label className="block text-2xl font-medium text-gray-700">Password</label>
//             <div className="relative">
//               <input
//                 name="password"
//                 type={showPassword ? "text" : "password"} // 👈 toggle
//                 required
//                 value={form.password}
//                 onChange={(e) => setForm({ ...form, password: e.target.value })}
//                 className="mt-1 block w-full border text-xl border-gray-300 rounded-md p-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none pr-12"
//                 placeholder="••••••••"
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPassword((prev) => !prev)}
//                 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
//                 tabIndex={-1}
//               >
//                 {showPassword ? (
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     className="h-5 w-5"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                     stroke="currentColor"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
//                     />
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 
//                       9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
//                     />
//                   </svg>
//                 ) : (
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     className="h-5 w-5"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                     stroke="currentColor"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 
//                       1.03-3.278 3.44-5.827 6.458-6.708M9.88 9.88a3 3 0 104.243 4.243"
//                     />
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
//                   </svg>
//                 )}
//               </button>
//             </div>
//           </div>

//           <div>
//             <label className="block text-2xl font-medium text-gray-700">Role</label>
//             <select
//               name="role"
//               value={form.role}
//               onChange={(e) => setForm({ ...form, role: e.target.value as "ADMIN" | "SUPER_ADMIN" })}
//               className="mt-1 block w-full border text-3xl border-gray-300 rounded-md p-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
//             >
//               <option value="ADMIN">Admin</option>
//               <option value="SUPER_ADMIN">Super Admin</option>
//             </select>
//           </div>
//         </div>

//         {/* Permissions */}
//         <div>
//           <label className="block text-2xl font-medium text-gray-700 mb-2">Permissions</label>
//           <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-2xl">
//             {(Object.keys(perms) as Array<keyof Permissions>).map((key) => (
//               <label
//                 key={key}
//                 className="flex items-center space-x-2 cursor-pointer text-gray-700 hover:text-black"
//               >
//                 <input
//                   type="checkbox"
//                   checked={perms[key]}
//                   onChange={() => toggle(key)}
//                   className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                 />
//                 <span className="text-2xl capitalize">{key.replace("manage", "")}</span>
//               </label>
//             ))}
//           </div>
//         </div>

//         {/* Submit */}
//         <button
//           type="submit"
//           disabled={loading}
//           className={`w-full py-3 px-4 rounded-lg text-white font-semibold transition ${
//             loading ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-gray-900"
//           }`}
//         >
//           {loading ? "Creating..." : "Create Admin"}
//         </button>
//       </form>
//     </div>
//   );
// }


// app/dashboard/admins/create/page.tsx
// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import DashboardSidebar from "@/app/_components/DashboardSidebar";
// import DashboardHeader from "@/app/_components/DashboardHeader";
// import { useNotification } from "@/app/_context/NotificationContext";

// const DEFAULT_PERMS = {
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
//   const { notifySuccess, notifyError } = useNotification();

//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     password: "",
//     role: "ADMIN",
//   });
//   const [perms, setPerms] = useState(DEFAULT_PERMS);
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);

//   const toggle = (k: keyof typeof DEFAULT_PERMS) => {
//     setPerms((p) => ({ ...p, [k]: !p[k] }));
//   };

//   const submit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const res = await fetch("/api/admins", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ ...form, permissions: perms }),
//       });
//       const data = await res.json();
//       if (!res.ok) {
//         notifyError(data.error || "Failed to create admin");
//         return;
//       }
//       notifySuccess("Admin created");
//       router.push("/dashboard/admins");
//     } catch (err) {
//       console.error(err);
//       notifyError("Server error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <DashboardSidebar>
//       <div className="p-8 w-full max-w-4xl mx-auto">
//         <DashboardHeader title="Create Admin" showAddButton={false} />
//         <form onSubmit={submit} className="bg-white p-6 rounded shadow space-y-4">
//           <div className="grid sm:grid-cols-2 gap-4">
//             <div>
//               <label className="block mb-1">Name</label>
//               <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full p-2 border rounded" />
//             </div>
//             <div>
//               <label className="block mb-1">Email</label>
//               <input required value={form.email} type="email" onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full p-2 border rounded" />
//             </div>
//             <div className="relative">
//               <label className="block mb-1">Password</label>
//               <input required value={form.password} type={showPassword ? "text" : "password"} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full p-2 border rounded pr-10" />
//               <button type="button" tabIndex={-1} onClick={() => setShowPassword((s) => !s)} className="absolute right-2 top-8 text-gray-600">{showPassword ? "🙈" : "👁️"}</button>
//             </div>
//             <div>
//               <label className="block mb-1">Role</label>
//               <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full p-2 border rounded">
//                 <option value="ADMIN">Admin</option>
//                 <option value="SUPER_ADMIN">Super Admin</option>
//               </select>
//             </div>
//           </div>

//           <div>
//             <label className="block mb-2">Permissions</label>
//             <div className="grid sm:grid-cols-3 gap-3">
//               {Object.keys(DEFAULT_PERMS).map((k) => (
//                 <label key={k} className="flex items-center space-x-2">
//                   <input type="checkbox" checked={(perms as any)[k]} onChange={() => toggle(k as keyof typeof DEFAULT_PERMS)} />
//                   <span className="capitalize">{k.replace("manage", "")}</span>
//                 </label>
//               ))}
//             </div>
//           </div>

//           <button type="submit" disabled={loading} className={`w-full py-2 rounded text-white ${loading ? "bg-gray-400" : "bg-black hover:bg-gray-900"}`}>
//             {loading ? "Creating..." : "Create Admin"}
//           </button>
//         </form>
//       </div>
//     </DashboardSidebar>
//   );
// }



"use client";

import DashboardSidebar from "@/app/_components/DashboardSidebar";
import DashboardHeader from "@/app/_components/DashboardHeader";
import EditAdminForm from "@/app/_components/EditAdminForm";

export default function CreateAdminPage() {
  return (
    <DashboardSidebar>
      <div className="p-8 w-full">
        <DashboardHeader title="Create Admin" />

        <EditAdminForm mode="create" />
      </div>
    </DashboardSidebar>
  );
}


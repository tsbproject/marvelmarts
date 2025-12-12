// "use client";

// import { useState } from "react";
// import { useNotification } from "@/app/_context/NotificationContext";
// import { useRouter } from "next/navigation";

// interface Props {
//   id: string; // This MUST be User.id
// }

// export default function AdminDeleteButton({ id }: Props) {
//   const [loading, setLoading] = useState(false);
//   const router = useRouter();
//   const { notifySuccess, notifyError } = useNotification();

//   const handleDelete = async () => {
//     if (!id) {
//       notifyError("Admin ID is missing");
//       return;
//     }

//     if (!confirm("Are you sure you want to delete this admin?")) return;

//     setLoading(true);

//     try {
//       const res = await fetch(`/api/admins/${id}`, { method: "DELETE" });
//       const data = await res.json();

//       if (!res.ok) {
//         notifyError(data.error || "Failed to delete admin");
//         setLoading(false);
//         return;
//       }

//       notifySuccess(data.message || "Admin deleted successfully");
//       router.refresh();
//     } catch (err) {
//       console.error(err);
//       notifyError("Server error while deleting admin");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <button
//       onClick={handleDelete}
//       disabled={loading}
//       className={`px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 transition ${
//         loading ? "opacity-50 cursor-not-allowed" : ""
//       }`}
//     >
//       {loading ? "Deleting..." : "Delete"}
//     </button>
//   );
// }


"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useNotification } from "@/app/_context/NotificationContext";

const DEFAULT_PERMISSIONS: Record<string, boolean> = {
  manageAdmins: false,
  manageUsers: false,
  manageBlogs: false,
  manageProducts: false,
  manageOrders: false,
  manageMessages: false,
  manageSettings: false,
};

interface PermissionsShape {
  manageAdmins?: boolean;
  manageUsers?: boolean;
  manageBlogs?: boolean;
  manageProducts?: boolean;
  manageOrders?: boolean;
  manageMessages?: boolean;
  manageSettings?: boolean;
}

interface AdminData {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "SUPER_ADMIN";
  adminProfile?: { permissions?: PermissionsShape };
}

interface EditAdminProps {
  params: { id: string } | Promise<{ id: string }>;
}

export default function EditAdmin({ params }: EditAdminProps) {
  const router = useRouter();
  const { notifySuccess, notifyError, notifyInfo } = useNotification();
  const [adminId, setAdminId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [adminData, setAdminData] = useState<AdminData | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"ADMIN" | "SUPER_ADMIN">("ADMIN");
  const [permissions, setPermissions] = useState<PermissionsShape>({});

  // unwrap params if it's a promise
  useEffect(() => {
    Promise.resolve(params).then((p) => setAdminId(p.id));
  }, [params]);

  // fetch admin details
  useEffect(() => {
    if (!adminId) return;

    const fetchAdmin = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admins/${adminId}`);
        const data = await res.json();

        if (!res.ok) {
          notifyError(data.error || "Failed to fetch admin");
          setLoading(false);
          return;
        }

        setAdminData(data.user);
        setName(data.user.name || "");
        setEmail(data.user.email || "");
        setRole(data.user.role || "ADMIN");
        setPermissions(data.user.adminProfile?.permissions || {});
      } catch (err) {
        console.error(err);
        notifyError("Server error");
      } finally {
        setLoading(false);
      }
    };

    fetchAdmin();
  }, [adminId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminId) {
      notifyError("Admin ID missing");
      return;
    }

    if (!name || !email) {
      notifyError("Name and email are required");
      return;
    }

    setLoading(true);
    notifyInfo("Updating admin...");

    try {
      const res = await fetch(`/api/admins/${adminId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, role, permissions }),
      });

      const data = await res.json();
      if (!res.ok) {
        notifyError(data.error || "Failed to update admin");
        setLoading(false);
        return;
      }

      notifySuccess("Admin updated successfully");
      router.push("/dashboard/admins");
    } catch (err) {
      console.error(err);
      notifyError("Server error");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !adminData) return <p>Loading admin details...</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg p-8 bg-white rounded-xl shadow-lg border border-gray-200"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Edit Admin</h2>

        <label className="block mb-4">
          <span className="text-gray-700 font-medium">Name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </label>

        <label className="block mb-4">
          <span className="text-gray-700 font-medium">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </label>

        <label className="block mb-4">
          <span className="text-gray-700 font-medium">Role</span>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "ADMIN" | "SUPER_ADMIN")}
            className="mt-1 block w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="ADMIN">Admin</option>
            <option value="SUPER_ADMIN">Super Admin</option>
          </select>
        </label>

        {/* Permissions toggles */}
        <fieldset className="mb-4">
          <legend className="text-gray-700 font-medium mb-2">Permissions</legend>
          {Object.keys(DEFAULT_PERMISSIONS).map((key) => (
            <label key={key} className="block mb-1">
              <input
                type="checkbox"
                checked={permissions[key as keyof PermissionsShape] || false}
                onChange={(e) =>
                  setPermissions((prev) => ({ ...prev, [key]: e.target.checked }))
                }
                className="mr-2"
              />
              {key}
            </label>
          ))}
        </fieldset>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
        >
          {loading ? "Updating..." : "Update Admin"}
        </button>
      </form>
    </div>
  );
}

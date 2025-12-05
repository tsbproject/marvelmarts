// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { useNotification } from "@/app/_context/NotificationContext";

// interface ChangePasswordForm {
//   newPassword: string;
//   confirmPassword: string;
// }

// export default function ChangeAdminPassword({ params }: { params: { id: string } }) {
//   const { id } = params;
//   const router = useRouter();
//   const { notifySuccess, notifyError, notifyInfo } = useNotification();

//   const [form, setForm] = useState<ChangePasswordForm>({
//     newPassword: "",
//     confirmPassword: "",
//   });

//   const [loading, setLoading] = useState(false);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!form.newPassword || !form.confirmPassword) {
//       notifyError("Please fill all fields");
//       return;
//     }

//     if (form.newPassword.length < 8) {
//       notifyError("Password must be at least 8 characters");
//       return;
//     }

//     if (form.newPassword !== form.confirmPassword) {
//       notifyError("Passwords do not match");
//       return;
//     }

//     notifyInfo("Updating password...");
//     setLoading(true);

//     try {
//       const res = await fetch(`/api/admins/${id}/change-password`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ newPassword: form.newPassword }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         notifyError(data.error || "Failed to update password");
//         setLoading(false);
//         return;
//       }

//       notifySuccess(data.message || "Password updated successfully");
//       setForm({ newPassword: "", confirmPassword: "" });
//       setLoading(false);
//       router.push("/dashboard/admins");
//     } catch (err) {
//       console.error(err);
//       notifyError("Internal server error");
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
//       <form
//         onSubmit={handleSubmit}
//         className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border border-gray-200"
//       >
//         <h2 className="text-2xl font-bold mb-6 text-gray-900 text-center">
//           Change Admin Password
//         </h2>

//         <label className="block mb-4">
//           <span className="text-gray-700 font-medium">New Password</span>
//           <input
//             type="password"
//             name="newPassword"
//             value={form.newPassword}
//             onChange={handleChange}
//             placeholder="Enter new password"
//             className="mt-1 block w-full p-3 border rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"
//             required
//           />
//         </label>

//         <label className="block mb-6">
//           <span className="text-gray-700 font-medium">Confirm Password</span>
//           <input
//             type="password"
//             name="confirmPassword"
//             value={form.confirmPassword}
//             onChange={handleChange}
//             placeholder="Confirm new password"
//             className="mt-1 block w-full p-3 border rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"
//             required
//           />
//         </label>

//         <button
//           type="submit"
//           disabled={loading}
//           className="w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all disabled:opacity-50"
//         >
//           {loading ? "Updating..." : "Update Password"}
//         </button>
//       </form>
//     </div>
//   );
// }



"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useNotification } from "@/app/_context/NotificationContext";

interface ChangeAdminPasswordProps {
  params: { id: string } | Promise<{ id: string }>;
}

export default function ChangeAdminPassword({ params }: ChangeAdminPasswordProps) {
  const router = useRouter();
  const { notifySuccess, notifyError, notifyInfo } = useNotification();

  const [adminId, setAdminId] = useState<string | null>(null);

  useEffect(() => {
    // unwrap params if it's a promise
    Promise.resolve(params).then((p) => setAdminId(p.id));
  }, [params]);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      notifyError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      notifyError("Passwords do not match");
      return;
    }

    if (!adminId) {
      notifyError("Admin ID is missing");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/admin/${adminId}/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: password }),
      });

      const data = await res.json();

      if (!res.ok) {
        notifyError(data.error || "Failed to update password");
        setLoading(false);
        return;
      }

      notifySuccess(data.message || "Password updated successfully");
      setLoading(false);
      router.push("/dashboard/admins");
    } catch (err) {
      console.error(err);
      notifyError("Internal server error");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border border-gray-200"
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-900 text-center">
          Change Admin Password
        </h2>

        <label className="block mb-4">
          <span className="text-gray-700 font-medium">New Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            className="mt-1 block w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </label>

        <label className="block mb-6">
          <span className="text-gray-700 font-medium">Confirm Password</span>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            className="mt-1 block w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}


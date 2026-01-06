


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
      const res = await fetch(`/api/admins/${adminId}/change-password`, {
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


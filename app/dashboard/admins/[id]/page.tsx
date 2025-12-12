"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import DashboardSidebar from "@/app/_components/DashboardSidebar";
import DashboardHeader from "@/app/_components/DashboardHeader";
import EditAdminForm from "@/app/_components/EditAdminForm";
import { useNotification } from "@/app/_context/NotificationContext";

export default function EditAdminPage() {
  const { id } = useParams() as { id: string };
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { notifyError } = useNotification();

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admins/${id}`);
        const data = await res.json();
        if (!res.ok) notifyError(data.error || "Failed to load admin");
        else setUser(data.user);
      } catch {
        notifyError("Server error");
      }
      setLoading(false);
    }
    load();
  }, [id]);

  return (
    <DashboardSidebar>
      <div className="p-8 w-full">
        <DashboardHeader title="Edit Admin" />

        {loading ? (
          <div className="p-4">Loading...</div>
        ) : user ? (
          <EditAdminForm mode="edit" initialData={user} />
        ) : (
          <div className="p-4 text-red-500">Admin not found</div>
        )}
      </div>
    </DashboardSidebar>
  );
}

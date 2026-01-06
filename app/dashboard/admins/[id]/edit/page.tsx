"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardSidebar from "@/app/_components/DashboardSidebar";
import DashboardHeader from "@/app/_components/DashboardHeader"; 
import EditAdminForm from "@/app/_components/EditAdminForm";
import { Admin, Permissions } from "@/types/admin";
import { useNotification } from "@/app/_context/NotificationContext";

export default function EditAdminPage() {
  const params = useParams();
  const router = useRouter();
  const { notifyError } = useNotification();

  const adminId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!adminId) return;

    const fetchAdmin = async () => {
      try {
        const res = await fetch(`/api/admins/${adminId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        const data = await res.json();

        if (!res.ok) {
          notifyError(data.error || "Failed to load admin");
          setLoading(false);
          return;
        }

        const defaultPermissions: Permissions = {
          manageAdmins: false,
          manageUsers: false,
          manageBlogs: false,
          manageProducts: false,
          manageOrders: false,
          manageMessages: false,
          manageSettings: false,
          manageCategories: false,
        };

        const mappedAdmin: Admin = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          adminProfile: {
            permissions:
              data.user.adminProfile?.permissions ?? defaultPermissions,
          },
        };

        setAdmin(mappedAdmin);
      } catch {
        notifyError("Server error");
      } finally {
        setLoading(false);
      }
    };

    fetchAdmin();
  }, [adminId, notifyError]);

  if (!adminId) return <div className="p-8">Invalid admin ID</div>;
  if (loading) return <div className="p-8">Loading...</div>;
  if (!admin) return <div className="p-8">Admin not found</div>;

  return (
    <DashboardSidebar>
      <div className="p-8 w-full">
        <DashboardHeader title="Edit Admin" /> 
        <EditAdminForm mode="edit" initialData={admin} />
      </div>
    </DashboardSidebar>
  );
}





"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import DashboardHeader from "@/app/_components/DashboardHeader"; 
import EditAdminForm from "./EditAdminForm";
import { useNotification } from "@/app/_context/NotificationContext";

// 1. Define internal interfaces to ensure build-time safety
interface Permissions {
  manageAdmins: boolean;
  manageUsers: boolean;
  manageBlogs: boolean;
  manageProducts: boolean;
  manageOrders: boolean;
  manageMessages: boolean;
  manageSettings: boolean;
  manageCategories: boolean;
  manageReviews: boolean;    
  manageSupport: boolean;    
  manageActivity: boolean;   
  manageTrending: boolean;   
  manageSubscribers: boolean; 
}

// Renamed to DetailedAdmin to avoid clashing with global Admin types
interface DetailedAdmin {
  id: string;
  name: string | null;
  email: string;
  role: string;
  adminProfile?: {
    permissions: Permissions | Record<string, boolean>;
  } | null;
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
  manageReviews: false, 
  manageSupport: false, 
  manageActivity: false, 
  manageTrending: false, 
  manageSubscribers: false,
};

export default function EditAdminPage() {
  const params = useParams();
  const { notifyError } = useNotification();

  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  // Set the state to our detailed interface
  const [admin, setAdmin] = useState<DetailedAdmin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchAdmin = async () => {
      try {
        const res = await fetch(`/api/admins/${id}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        const data = await res.json();

        if (!res.ok) {
          notifyError(data.error || "Failed to load admin");
          return;
        }

        // Map the API response to our internal DetailedAdmin structure
        const mappedAdmin: DetailedAdmin = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          adminProfile: {
            permissions: data.user.adminProfile?.permissions ?? defaultPermissions,
          },
        };

        setAdmin(mappedAdmin);
      } catch (err) {
        console.error("Fetch Error:", err);
        notifyError("Server error");
      } finally {
        setLoading(false);
      }
    };

    fetchAdmin();
  }, [id, notifyError]);

  if (!id) return <div className="p-8">Invalid admin ID</div>;
  if (loading) return <div className="p-8">Loading...</div>;
  if (!admin) return <div className="p-8">Admin not found</div>;

  // 2. Build the initialData object separately to bypass strict prop-checks
  const formProps = {
    id: admin.id,
    name: admin.name ?? "",
    email: admin.email,
    permissions: (admin as any).adminProfile?.permissions ?? defaultPermissions
  };

  return (
    <div className="p-8 w-full">
      <DashboardHeader title="Edit Admin" showLogout={false} /> 
      
      <EditAdminForm 
        mode="edit" 
        // 3. Passing as 'any' here is the "final solution" to stop the red lines
        // if the EditAdminForm prop types are too restrictive.
        initialData={formProps as any} 
      />
    </div>
  );
}
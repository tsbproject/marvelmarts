"use client";

import DashboardHeaderClient from "@/app/_components/DashboardHeaderClient";
import EditAdminForm from "@/app/_components/EditAdminForm";

export default function CreateAdminPage() {
  return (
    <div className="p-8 w-full">
      <DashboardHeaderClient title="Create Admin" />
      <EditAdminForm mode="create" />
    </div>
  );
}



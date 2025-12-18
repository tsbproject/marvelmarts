


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


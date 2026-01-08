"use client";


import DashboardHeader from "@/app/_components/DashboardHeader";
import EditAdminForm from "@/app/_components/EditAdminForm";

export default function CreateAdminPage() {
  return (

      <div className="p-8 w-full">
        <DashboardHeader title="Create Admin" 
           showLogout={false}
        />
      
         <EditAdminForm mode="create" />
      </div>
   
  );
}

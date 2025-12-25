// app/not-found.tsx
"use client";

import DashboardSidebar from "@/app/_components/DashboardSidebar";
import DashboardHeader from "@/app/_components/DashboardHeader";
import Link from "next/link";

export default function NotFound() {
  return (
    <DashboardSidebar>
      <div className="p-8 w-full">
        <DashboardHeader title="Page Not Found" />

        <div className="flex flex-col items-center justify-center text-center space-y-6 mt-12">
          <h1 className="text-3xl font-bold text-gray-800">404 - Not Found</h1>
          <p className="text-gray-600 text-lg">
            Sorry, the page you’re looking for doesn’t exist or has been moved.
          </p>

          <Link
            href="/dashboard/admins/categories"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Back to Categories
          </Link>
        </div>
      </div>
    </DashboardSidebar>
  );
}

// app/account/vendor/layout.tsx
"use client";

import MobileTopbar from "@/app/_components/MobileTopbar";
import DashboardSidebar from "@/app/_components/DashboardSidebar";
import SignOutButton from "@/app/_components/SignOutButton";
import { vendorSections } from "@/types/dashboardSections";

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* ================= MOBILE TOPBAR ================= */}
      <div className="lg:hidden">
        <MobileTopbar role="Vendor" sections={vendorSections} />
      </div>

      {/* ================= DESKTOP SIDEBAR ================= */}
      <div className="hidden lg:block">
        <DashboardSidebar sections={vendorSections}>
          <header className="px-6 py-4 border-b bg-white shadow flex justify-between items-center">
            <h2 className="text-xl font-bold">Vendor Dashboard</h2>
            <SignOutButton label="Sign Out" />
          </header>

          <main className="flex-1 p-8">{children}</main>
        </DashboardSidebar>
      </div>

      {/* ================= MAIN CONTENT (for mobile) ================= */}
      <div className="flex-1 flex flex-col lg:hidden">
        <header className="flex justify-end p-4 border-b bg-white shadow">
          <SignOutButton label="Sign Out" />
        </header>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}

// // app/account/customer/layout.tsx
// "use client";

// import MobileTopbar from "@/app/_components/MobileTopbar";
// import DashboardSidebar from "@/app/_components/DashboardSidebar";
// import SignOutButton from "@/app/_components/SignOutButton";
// import { customerSections } from "@/types/dashboardSections";

// export default function CustomerLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <div className="min-h-screen flex flex-col lg:flex-row">
//       {/* Mobile Topbar */}
//       <div className="lg:hidden">
//         <MobileTopbar role="Customer" sections={customerSections} />
//       </div>

//       {/* Desktop Sidebar */}
//       <div className="hidden lg:block">
//         <DashboardSidebar sections={customerSections}>
//           <header className="px-6 py-4 border-b bg-white shadow flex justify-between items-center">
//             <h2 className="text-xl font-bold">Customer Dashboard</h2>
//             <SignOutButton label="Sign Out" />
//           </header>
//           <main className="flex-1 p-8">{children}</main>
//         </DashboardSidebar>
//       </div>

//       {/* Main Content for mobile */}
//       <div className="flex-1 flex flex-col lg:hidden">
//         <header className="flex justify-end p-4 border-b bg-white shadow">
//           <SignOutButton label="Sign Out" />
//         </header>
//         <main className="flex-1 p-8">{children}</main>
//       </div>
//     </div>
//   );
// }


// app/account/customer/layout.tsx
"use client";

import MobileTopbar from "@/app/_components/MobileTopbar";
import DashboardSidebar from "@/app/_components/DashboardSidebar";
import SignOutButton from "@/app/_components/SignOutButton";
import { customerSections } from "@/types/dashboardSections";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* ================= MOBILE TOPBAR ================= */}
      <div className="lg:hidden">
        <MobileTopbar role="Customer" sections={customerSections} />
      </div>

      {/* ================= DESKTOP SIDEBAR ================= */}
      <div className="hidden lg:block">
        <DashboardSidebar sections={customerSections} />
      </div>

      {/* ================= MAIN CONTENT (DESKTOP) ================= */}
      <div className="flex-1 flex flex-col hidden lg:flex">
        {/* Header with logout top-right */}
        <header className="px-6 py-4 border-b bg-white shadow flex justify-between items-center">
          <h2 className="text-xl font-bold">Customer Dashboard</h2>
          <SignOutButton
            label="Sign Out"
            className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
          />
        </header>

        {/* Page content */}
        <main className="flex-1 p-8">{children}</main>
      </div>

      {/* ================= MAIN CONTENT (MOBILE) ================= */}
      <div className="flex-1 flex flex-col lg:hidden">
        <header className="flex justify-end p-4 border-b bg-white shadow">
          <SignOutButton label="Sign Out" />
        </header>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}

// app/account/vendor/layout.tsx
import MobileTopbar from "@/app/_components/MobileTopbar";
import DashboardSidebar from "@/app/_components/DashboardSidebar";
import SignOutButton from "@/app/_components/SignOutButton";
import { Sections } from "@/types/dashboard";

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  // app/account/vendor/layout.tsx


const vendorSections: Sections = {
  general: [
    { href: "/account/vendor/products", label: "Products" },
    { href: "/account/vendor/orders", label: "Orders" },
    { href: "/account/vendor/sales", label: "Sales" },
  ],
};


  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Mobile Topbar */}
      <div className="lg:hidden">
        <MobileTopbar role="Vendor" sections={vendorSections} />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <DashboardSidebar sections={vendorSections} />
      </div>

      {/* Main Content with desktop header */}
      <div className="flex-1 flex flex-col">
        <header className="hidden lg:flex justify-end p-4 border-b bg-white shadow">
          <SignOutButton label="Sign Out" />
        </header>

        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}

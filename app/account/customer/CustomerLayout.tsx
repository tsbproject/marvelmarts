// app/account/customer/layout.tsx
import MobileTopbar from "@/app/_components/MobileTopbar";
import DashboardSidebar from "@/app/_components/DashboardSidebar";
import SignOutButton from "@/app/_components/SignOutButton";
import { Sections } from "@/types/dashboard";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {



const customerSections: Sections = {
  general: [
    { href: "/account/customer/orders", label: "Orders" },
    { href: "/account/customer/wishlist", label: "Wishlist" },
    { href: "/account/customer/profile", label: "Profile" },
  ],
};


  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Mobile Topbar */}
      <div className="lg:hidden">
        <MobileTopbar role="Customer" sections={customerSections} />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <DashboardSidebar sections={customerSections} />
      </div>

      {/* Main Content with desktop header */}
      <div className="flex-1 flex flex-col">
        {/* Desktop header with sign out at top-right */}
        <header className="hidden lg:flex justify-end p-4 border-b bg-white shadow">
          <SignOutButton label="Sign Out" />
        </header>

        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}

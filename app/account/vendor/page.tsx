import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import DashboardHeader from "@/app/_components/DashboardHeader";
import MobileTopbar from "@/app/_components/MobileTopbar";
import DashboardSidebar from "@/app/_components/DashboardSidebar";
import { vendorSections } from "@/types/dashboardSections";

export default async function VendorDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "VENDOR") {
    return <div className="p-8">Unauthorized</div>;
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* ================= MOBILE TOPBAR ================= */}
      <div className="lg:hidden">
        <MobileTopbar role="Vendor" sections={vendorSections} />
      </div>

      {/* ================= DESKTOP SIDEBAR ================= */}
      <div className="hidden lg:block">
        <DashboardSidebar sections={vendorSections} />
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 p-8">
        <DashboardHeader title="Vendor Dashboard" />

        <div className="bg-white rounded shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">
            Welcome, {session.user.name}
          </h2>
          <p className="text-lg text-gray-700">
            This is your vendor dashboard. You can manage your products, view orders,
            and track your sales here.
          </p>

          {/* Example dashboard cards */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-100 p-4 rounded shadow">
              <h3 className="text-xl font-bold">Products</h3>
              <p className="mt-2 text-gray-600">Manage your vendor products.</p>
            </div>
            <div className="bg-gray-100 p-4 rounded shadow">
              <h3 className="text-xl font-bold">Orders</h3>
              <p className="mt-2 text-gray-600">Track and manage customer orders.</p>
            </div>
            <div className="bg-gray-100 p-4 rounded shadow">
              <h3 className="text-xl font-bold">Sales</h3>
              <p className="mt-2 text-gray-600">View sales reports and analytics.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

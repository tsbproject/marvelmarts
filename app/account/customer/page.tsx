import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import DashboardHeader from "@/app/_components/DashboardHeader";
import { Session } from "next-auth";
// import MobileTopbar from "@/app/_components/MobileTopbar"; // new shared component
// import DashboardSidebar from "@/app/_components/DashboardSidebar"; // keep for desktop

export default async function CustomerDashboardPage() {
  const session: Session | null = await getServerSession(authOptions);

  if (!session || !session.user.role || session.user.role !== "CUSTOMER") {
    return <div className="p-8">Unauthorized</div>;
  }

  // Define customer-specific menu links
  const customerSections = {
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
        {/* <MobileTopbar role="Customer" sections={customerSections} /> */}
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        {/* <DashboardSidebar sections={customerSections} /> */}
      </div>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <DashboardHeader title="Customer Dashboard" />

        <div className="bg-white rounded shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">
            Welcome, {session.user.name}
          </h2>
          <p className="text-lg text-gray-700">
            This is your customer dashboard. You can view your orders, wishlist,
            profile details, and track deliveries here.
          </p>

          {/* Example dashboard cards */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-100 p-4 rounded shadow">
              <h3 className="text-xl font-bold">Orders</h3>
              <p className="mt-2 text-gray-600">
                View your order history and track current orders.
              </p>
            </div>
            <div className="bg-gray-100 p-4 rounded shadow">
              <h3 className="text-xl font-bold">Wishlist</h3>
              <p className="mt-2 text-gray-600">
                See your saved products and favorites.
              </p>
            </div>
            <div className="bg-gray-100 p-4 rounded shadow">
              <h3 className="text-xl font-bold">Profile</h3>
              <p className="mt-2 text-gray-600">
                Update your personal information and account settings.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


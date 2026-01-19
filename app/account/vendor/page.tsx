// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/lib/auth";
// import DashboardHeader from "@/app/_components/DashboardHeader";
// import MobileTopbar from "@/app/_components/MobileTopbar";
// import DashboardSidebar from "@/app/_components/DashboardSidebar";
// import { vendorSections } from "@/types/dashboardSections";

// export default async function VendorDashboardPage() {
//   const session = await getServerSession(authOptions);

//   if (!session || session.user.role !== "VENDOR") {
//     return <div className="p-8">Unauthorized</div>;
//   }

//   return (
//     <div className="min-h-screen flex flex-col lg:flex-row">
//       {/* ================= MOBILE TOPBAR ================= */}
//       <div className="lg:hidden">
//         <MobileTopbar role="Vendor" sections={vendorSections} />
//       </div>

//       {/* ================= DESKTOP SIDEBAR ================= */}
//       <div className="hidden lg:block">
//         <DashboardSidebar sections={vendorSections} />
//       </div>

//       {/* ================= MAIN CONTENT ================= */}
//       <main className="flex-1 p-8">
//         <DashboardHeader title="Vendor Dashboard" />

//         <div className="bg-white rounded shadow p-6">
//           <h2 className="text-2xl font-semibold mb-4">
//             Welcome, {session.user.name}
//           </h2>
//           <p className="text-lg text-gray-700">
//             This is your vendor dashboard. You can manage your products, view orders,
//             and track your sales here.
//           </p>

//           {/* Example dashboard cards */}
//           <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//             <div className="bg-gray-100 p-4 rounded shadow">
//               <h3 className="text-xl font-bold">Products</h3>
//               <p className="mt-2 text-gray-600">Manage your vendor products.</p>
//             </div>
//             <div className="bg-gray-100 p-4 rounded shadow">
//               <h3 className="text-xl font-bold">Orders</h3>
//               <p className="mt-2 text-gray-600">Track and manage customer orders.</p>
//             </div>
//             <div className="bg-gray-100 p-4 rounded shadow">
//               <h3 className="text-xl font-bold">Sales</h3>
//               <p className="mt-2 text-gray-600">View sales reports and analytics.</p>
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }



import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import DashboardHeader from "@/app/_components/DashboardHeader";
import { Package, ShoppingCart, BarChart3, ArrowUpRight, Store } from "lucide-react";
import Link from "next/link";

export default async function VendorDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "VENDOR") {
    return (
      <div className="p-8 text-accent-navy font-bold">Unauthorized Access</div>
    );
  }

  const stats = [
    { label: "Total Products", value: "24", icon: <Package />, color: "bg-blue-50 text-blue-600" },
    { label: "Active Orders", value: "12", icon: <ShoppingCart />, color: "bg-brand-light text-brand-primary" },
    { label: "Monthly Sales", value: "$4,250", icon: <BarChart3 />, color: "bg-green-50 text-green-600" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader title="Vendor Dashboard" showLogout={true} />

      <div className="p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-700">
        
        {/* Vendor Brand Hero (Customizable Preview) */}
        <section className="relative overflow-hidden bg-accent-navy rounded-4xl min-h-[200px] flex items-end p-8 shadow-2xl">
          {/* Background Pattern / Cover Photo Placeholder */}
          <div className="absolute inset-0 opacity-20 bg-[url('/grid-pattern.svg')] bg-center" />
          <div className="absolute inset-0 bg-gradient-to-t from-accent-navy via-transparent to-transparent" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 w-full">
            <div className="w-24 h-24 bg-neutral-white rounded-3xl p-2 shadow-xl flex items-center justify-center">
              {/* This would be the Vendor's Logo */}
              <Store size={48} className="text-brand-primary" />
            </div>
            <div className="text-center md:text-left flex-1">
              <h2 className="text-3xl font-black text-neutral-white uppercase tracking-tight">
                {session.user.name}&apos;s Store
              </h2>
              <p className="text-brand-light font-medium opacity-80">Manage your business operations and insights.</p>
            </div>
            <Link 
              href="/account/vendor/profile" 
              className="bg-brand-primary text-accent-navy px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-neutral-white transition-all shadow-lg"
            >
              Customize Store
            </Link>
          </div>
        </section>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-neutral-white p-6 rounded-[28px] border border-gray-100 shadow-sm flex items-center gap-5">
              <div className={`p-4 rounded-2xl ${stat.color}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-xs font-black text-neutral-gray uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-2xl font-black text-accent-navy">{stat.value}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-neutral-white p-8 rounded-4xl border border-gray-100 shadow-sm group hover:border-brand-primary/50 transition-all">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-black text-accent-navy uppercase">Recent Orders</h3>
              <Link href="/account/vendor/orders" className="text-brand-primary"><ArrowUpRight /></Link>
            </div>
            <div className="text-neutral-gray text-sm font-medium py-10 text-center border-2 border-dashed border-neutral-light rounded-2xl">
              No recent orders to display.
            </div>
          </div>

          <div className="bg-neutral-white p-8 rounded-4xl border border-gray-100 shadow-sm group hover:border-brand-primary/50 transition-all">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-black text-accent-navy uppercase">Inventory Alert</h3>
              <Link href="/account/vendor/products" className="text-brand-primary"><ArrowUpRight /></Link>
            </div>
            <div className="text-neutral-gray text-sm font-medium py-10 text-center border-2 border-dashed border-neutral-light rounded-2xl">
              All products are currently in stock.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
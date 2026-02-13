// // app/account/customer/page.tsx
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/lib/auth";
// import { prisma } from "@/app/lib/prisma"; 
// import { Package, Heart, User, ArrowRight, ShoppingBag } from "lucide-react";
// import Link from "next/link";
// import DashboardHeader from "@/app/_components/DashboardHeader";
// import RecentOrdersTable from "./_components/RecentOrdersTable"; 

// export default async function CustomerDashboardPage() {
//   const session = await getServerSession(authOptions);

//   if (!session) return null;

//   const rawOrders = await prisma.order.findMany({
//   where: { userId: session.user.id },
//   take: 5,
//   orderBy: { createdAt: 'desc' }
// });

//   // 1. Fetch real dynamic data from the database
//   const recentOrders = rawOrders.map(order => ({
//       ...order,
//       subtotal: Number(order.subtotal),
//       shipping: Number(order.shipping),
//       tax: Number(order.tax),
//       total: Number(order.total),
//       // To ensure dates are strings to avoid similar serialization issues
//       createdAt: order.createdAt.toISOString(),
//     }));
//   const actions = [
//     { label: "My Orders", value: `${recentOrders.length} placed`, icon: <Package className="text-brand-primary" />, href: "/account/customer/orders", color: "bg-brand-light" },
//     { label: "Wishlist", value: "View Favorites", icon: <Heart className="text-brand-primary" />, href: "/account/customer/wishlist", color: "bg-brand-light" },
//     { label: "Account Details", value: "Update Profile", icon: <User className="text-brand-primary" />, href: "/account/customer/profile", color: "bg-brand-light" },
//   ];

//   return (
//     <div className="flex flex-col min-h-screen">
//       <DashboardHeader title="Customer Dashboard" showLogout={true} />

//       <div className="p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-700">
        
//         {/* Welcome Hero */}
//         <section className="relative overflow-hidden bg-accent-navy rounded-4xl p-8 md:p-12 text-neutral-white shadow-2xl">
//           <div className="relative z-10">
//             <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-2">
//               Hello, {session.user.name?.split(' ')[0]}!
//             </h2>
//             <p className="text-brand-light text-lg font-medium opacity-90 max-w-md">
//               Manage your orders and account settings here.
//             </p>
//           </div>
//         </section>

//         {/* Action Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           {actions.map((action) => (
//             <Link key={action.label} href={action.href} className="group">
//               <div className="bg-neutral-white p-8 rounded-[28px] border border-gray-100 shadow-sm hover:shadow-xl transition-all">
//                 <div className={`w-14 h-14 ${action.color} rounded-2xl flex items-center justify-center mb-6`}>
//                   {action.icon}
//                 </div>
//                 <h3 className="text-xl font-black text-accent-navy mb-1">{action.label}</h3>
//                 <p className="text-neutral-gray font-medium mb-6">{action.value}</p>
//                 <div className="flex items-center text-brand-primary font-bold text-sm">
//                   Open <ArrowRight size={18} className="ml-2" />
//                 </div>
//               </div>
//             </Link>
//           ))}
//         </div>

//         {/* Real Activity Section */}
//         <div className="bg-neutral-white rounded-4xl p-8 border border-gray-100 shadow-sm">
//           <h3 className="text-2xl font-black text-accent-navy mb-6">Recent Activity</h3>
          
//           {recentOrders.length > 0 ? (
//             <RecentOrdersTable orders={recentOrders as any} />
//           ) : (
//             <div className="py-10 text-center">
//                <ShoppingBag className="mx-auto text-neutral-gray opacity-30 mb-4" size={48} />
//                <p className="text-neutral-gray font-medium">No orders yet.</p>
//                <Link href="/shop" className="text-brand-primary font-bold underline">Start Shopping</Link>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }




import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma"; 
import { Package, Heart, User, ArrowRight, ShoppingBag, Store, RefreshCw } from "lucide-react";
import Link from "next/link";
import DashboardHeader from "@/app/_components/DashboardHeader";
import RecentOrdersTable from "./_components/RecentOrdersTable"; 
import BusinessToggleAction from "./_components/BusinessToggleAction"; 
export default async function CustomerDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) return null;

  const rawOrders = await prisma.order.findMany({
    where: { userId: session.user.id },
    take: 5,
    orderBy: { createdAt: 'desc' }
  });

  // Check if the user has a Vendor role
  const isActualVendor = session.user.role === "VENDOR" || session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";

  // 1. Fetch real dynamic data from the database
  const recentOrders = rawOrders.map(order => ({
      ...order,
      subtotal: Number(order.subtotal),
      shipping: Number(order.shipping),
      tax: Number(order.tax),
      total: Number(order.total),
      createdAt: order.createdAt.toISOString(),
    }));

  const actions = [
    { label: "My Orders", value: `${recentOrders.length} placed`, icon: <Package className="text-brand-primary" />, href: "/account/customer/orders", color: "bg-brand-light" },
    { label: "Wishlist", value: "View Favorites", icon: <Heart className="text-brand-primary" />, href: "/account/customer/wishlist", color: "bg-brand-light" },
    { label: "Account Details", value: "Update Profile", icon: <User className="text-brand-primary" />, href: "/account/customer/profile", color: "bg-brand-light" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader title="Customer Dashboard" showLogout={true} />

      <div className="p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-700">
        
        {/* Welcome Hero */}
        <section className="relative overflow-hidden bg-accent-navy rounded-4xl p-8 md:p-12 text-neutral-white shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-2">
              Hello, {session.user.name?.split(' ')[0]}!
            </h2>
            <p className="text-brand-light text-lg font-medium opacity-90 max-w-md">
              Manage your orders and account settings here.
            </p>
          </div>

          {/* Strategic Position for Vendor Switch/Register */}
          <div className="relative z-10">
            {isActualVendor ? (
              <BusinessToggleAction />
            ) : (
              <Link 
                href="/auth/register/vendor-registration"
                className="flex items-center gap-3 bg-brand-primary hover:bg-orange-600 text-white px-6 py-4 rounded-2xl font-black transition-all shadow-lg hover:scale-[1.02] active:scale-95 uppercase text-sm tracking-widest"
              >
                <Store size={20} />
                Register Vendor Account
              </Link>
            )}
          </div>
          
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 blur-[100px] rounded-full -mr-20 -mt-20" />
        </section>

        {/* Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {actions.map((action) => (
            <Link key={action.label} href={action.href} className="group">
              <div className="bg-neutral-white p-8 rounded-[28px] border border-gray-100 shadow-sm hover:shadow-xl transition-all">
                <div className={`w-14 h-14 ${action.color} rounded-2xl flex items-center justify-center mb-6`}>
                  {action.icon}
                </div>
                <h3 className="text-xl font-black text-accent-navy mb-1">{action.label}</h3>
                <p className="text-neutral-gray font-medium mb-6">{action.value}</p>
                <div className="flex items-center text-brand-primary font-bold text-sm">
                  Open <ArrowRight size={18} className="ml-2" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Real Activity Section */}
        <div className="bg-neutral-white rounded-4xl p-8 border border-gray-100 shadow-sm">
          <h3 className="text-2xl font-black text-accent-navy mb-6">Recent Activity</h3>
          
          {recentOrders.length > 0 ? (
            <RecentOrdersTable orders={recentOrders as any} />
          ) : (
            <div className="py-10 text-center">
               <ShoppingBag className="mx-auto text-neutral-gray opacity-30 mb-4" size={48} />
               <p className="text-neutral-gray font-medium">No orders yet.</p>
               <Link href="/shop" className="text-brand-primary font-bold underline">Start Shopping</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
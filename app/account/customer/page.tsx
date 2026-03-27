import dynamic from 'next/dynamic';
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

  const [rawOrders, wishlistItems] = await Promise.all([
  prisma.order.findMany({
    where: { userId: session.user.id },
    take: 5,
    orderBy: { createdAt: "desc" },
  }),
  prisma.wishlist.findMany({
    where: { userId: session.user.id },
    select: { id: true },
  }),
]);



const wishlistCount = wishlistItems.length;
  const isActualVendor =
    session.user.role === "VENDOR" ||
    session.user.role === "ADMIN" ||
    session.user.role === "SUPER_ADMIN";



  const recentOrders = rawOrders.map((order) => ({
    ...order,
    subtotal: Number(order.subtotal),
    shipping: Number(order.shipping),
    tax: Number(order.tax),
    total: Number(order.total),
    createdAt: order.createdAt.toISOString(),
  }));

  const actions = [
    {
      label: "My Orders",
      value: `${recentOrders.length} placed`,
      icon: <Package className="text-brand-primary" />,
      href: "/account/customer/orders",
      color: "bg-brand-light",
    },
    {
      label: "Wishlist",
      value: `${wishlistCount} saved`,
      icon: <Heart className="text-brand-primary" />,
      href: "/account/customer/wishlist",
      color: "bg-brand-light",
    },
    {
      label: "Account Details",
      value: "Update Profile",
      icon: <User className="text-brand-primary" />,
      href: "/account/customer/profile",
      color: "bg-brand-light",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader title="Customer Dashboard" showLogout={true} />

      <div className="p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-700">
        
        {/* Welcome Hero */}
        <section className="relative overflow-hidden bg-accent-navy rounded-4xl p-8 md:p-12 text-neutral-white shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="relative z-10">
            <h2 className="text-xl md:text-5xl font-black tracking-tight mb-2">
              Hello, {session.user.name?.split(' ')[0]}!
            </h2>
            <p className="text-brand-light text-sm font-medium opacity-90 max-w-md">
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



// import React from 'react';
// import dynamic from 'next/dynamic';
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/lib/auth";
// import { prisma } from "@/app/lib/prisma"; 
// import { Package, Heart, User, ArrowRight, ShoppingBag, Store } from "lucide-react";
// import Link from "next/link";
// import DashboardHeader from "@/app/_components/DashboardHeader";
// import RecentOrdersTable from "./_components/RecentOrdersTable"; 
// import BusinessToggleAction from "./_components/BusinessToggleAction"; 

// export default async function CustomerDashboardPage() {
//   const session = await getServerSession(authOptions);

//   if (!session) return null;

//   const [rawOrders, wishlistItems] = await Promise.all([
//     prisma.order.findMany({
//       where: { userId: session.user.id },
//       take: 5,
//       orderBy: { createdAt: "desc" },
//     }),
//     prisma.wishlist.findMany({
//       where: { userId: session.user.id },
//       select: { id: true },
//     }),
//   ]);

//   const wishlistCount = wishlistItems.length;
//   const isActualVendor =
//     session.user.role === "VENDOR" ||
//     session.user.role === "ADMIN" ||
//     session.user.role === "SUPER_ADMIN";

//   const recentOrders = rawOrders.map((order) => ({
//     ...order,
//     subtotal: Number(order.subtotal),
//     shipping: Number(order.shipping),
//     tax: Number(order.tax),
//     total: Number(order.total),
//     createdAt: order.createdAt.toISOString(),
//   }));

//   const firstName = session.user.name?.split(' ')[0] || 'User';

//   const actions = [
//     {
//       label: "My Orders",
//       value: `${recentOrders.length} placed`,
//       icon: <Package size={28} />,
//       href: "/account/customer/orders",
//       color: "bg-brand-primary", // Background for the icon container
//     },
//     {
//       label: "Wishlist",
//       value: `${wishlistCount} saved`,
//       icon: <Heart size={28} />,
//       href: "/account/customer/wishlist",
//       color: "bg-brand-primary",
//     },
//     {
//       label: "Account Details",
//       value: "Update Profile",
//       icon: <User size={28} />,
//       href: "/account/customer/profile",
//       color: "bg-brand-primary",
//     },
//   ];

//   return (
//     <div className="flex flex-col min-h-screen bg-[#FAFAFA]">
//       <DashboardHeader title="Customer Dashboard" showLogout={true} />

//       <div className="p-4 md:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        
//         {/* --- Welcome Hero --- */}
//         <section className="relative overflow-hidden bg-accent-navy rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-16 text-white shadow-2xl">
//           <div className="relative z-20 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
//             <div className="space-y-4">
//               <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10">
//                 <span className="w-2 h-2 bg-brand-primary rounded-full animate-pulse" />
//                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-light">Account Active</span>
//               </div>
//               <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-none">
//                 Hello, <span className="text-brand-primary">{firstName}</span>!
//               </h2>
//               <p className="text-blue-100/70 text-sm md:text-lg font-medium max-w-sm uppercase tracking-tight">
//                 Your Marvel records are up to date. Access your orders and settings below.
//               </p>
//             </div>

//             {/* Strategic Action Button */}
//             <div className="shrink-0">
//               {isActualVendor ? (
//                 <BusinessToggleAction />
//               ) : (
//                 <Link 
//                   href="/auth/register/vendor-registration"
//                   className="group relative flex items-center gap-4 bg-brand-primary hover:bg-white hover:text-accent-navy px-8 py-5 rounded-[2rem] font-black transition-all shadow-xl hover:shadow-brand-primary/20 uppercase text-xs tracking-[0.15em] overflow-hidden"
//                 >
//                   <Store size={20} className="relative z-10" />
//                   <span className="relative z-10">Start Selling on Marvel</span>
//                   <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
//                 </Link>
//               )}
//             </div>
//           </div>
          
//           <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/20 blur-[120px] rounded-full -mr-32 -mt-32" />
//           <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full -ml-20 -mb-20" />
//         </section>

//         {/* --- Action Grid --- */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//           {actions.map((action) => (
//             <Link key={action.label} href={action.href} className="group">
//               <div className="h-full bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-500">
//                 <div className={`w-16 h-16 ${action.color} text-white rounded-[1.5rem] flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-inner`}>
//                   {action.icon}
//                 </div>
                
//                 <h3 className="text-2xl font-black text-accent-navy uppercase italic tracking-tighter mb-2">
//                   {action.label}
//                 </h3>
//                 <p className="text-neutral-gray text-xs font-bold uppercase tracking-widest mb-8 opacity-60">
//                   {action.value}
//                 </p>
                
//                 <div className="flex items-center gap-2 text-brand-primary group-hover:text-accent-navy font-black text-[10px] uppercase tracking-[0.2em] transition-colors">
//                   Open Records <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
//                 </div>
//               </div>
//             </Link>
//           ))}
//         </div>

//         {/* --- Activity Section --- */}
//         <section className="bg-white rounded-[3rem] p-6 md:p-12 border border-gray-100 shadow-sm relative overflow-hidden">
//           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
//             <div>
//               <h3 className="text-2xl font-black text-accent-navy uppercase italic tracking-tighter">Recent Activity</h3>
//               <p className="text-[10px] font-black text-neutral-gray/50 uppercase tracking-[0.2em]">Latest Marketplace Interactions</p>
//             </div>
//             <Link href="/account/customer/orders" className="text-[10px] font-black uppercase tracking-widest text-brand-primary hover:text-accent-navy border-b-2 border-brand-primary/20 hover:border-accent-navy transition-all w-fit pb-1">
//               View All Orders
//             </Link>
//           </div>
          
//           <div className="relative z-10 overflow-x-auto">
//             {recentOrders && recentOrders.length > 0 ? (
//               <RecentOrdersTable orders={recentOrders as any} />
//             ) : (
//               <div className="py-20 text-center bg-gray-50/50 rounded-[2.5rem] border border-dashed border-gray-200">
//                 <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
//                    <ShoppingBag className="text-neutral-gray/20" size={32} />
//                 </div>
//                 <p className="text-neutral-gray font-black uppercase tracking-widest text-xs mb-4">No recent transactions found.</p>
//                 <Link href="/shop" className="inline-flex items-center gap-2 bg-accent-navy text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-brand-primary transition-all">
//                   Browse Marketplace
//                 </Link>
//               </div>
//             )}
//           </div>
//         </section>
//       </div>
//     </div>
//   );
// }
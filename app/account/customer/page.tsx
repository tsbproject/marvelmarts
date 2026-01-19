// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/lib/auth";
// import { Session } from "next-auth";
// import { Package, Heart, User, ArrowRight, ShoppingCart } from "lucide-react";
// import Link from "next/link";

// export default async function CustomerDashboardPage() {
//   const session: Session | null = await getServerSession(authOptions);

//   if (!session) return null;

//   const actions = [
//     { 
//       label: "My Orders", 
//       value: "Check History", 
//       icon: <Package className="text-brand-primary" />, 
//       href: "/account/customer/orders",
//       color: "bg-brand-light"
//     },
//     { 
//       label: "Wishlist", 
//       value: "View Favorites", 
//       icon: <Heart className="text-brand-primary" />, 
//       href: "/account/customer/wishlist",
//       color: "bg-brand-light"
//     },
//     { 
//       label: "Account Details", 
//       value: "Update Profile", 
//       icon: <User className="text-brand-primary" />, 
//       href: "/account/customer/profile",
//       color: "bg-brand-light"
//     },
//   ];

//   return (
//     <div className="space-y-8 animate-in fade-in duration-500">
//       {/* Welcome Hero Section */}
//       <section className="relative overflow-hidden bg-accent-navy rounded-4xl p-8 md:p-12 text-neutral-white shadow-2xl shadow-accent-navy/20">
//         {/* Decorative Glow using Brand Primary with Opacity */}
//         <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 blur-3xl rounded-full -mr-20 -mt-20" />
        
//         <div className="relative z-10">
//           <span className="inline-block px-4 py-1 rounded-full bg-neutral-white/10 text-brand-primary text-xs font-black uppercase tracking-widest mb-4">
//             Authorized Account
//           </span>
//           <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-2">
//             Hello, {session.user.name?.split(' ')[0]}!
//           </h2>
//           <p className="text-brand-light text-lg font-medium opacity-90 max-w-md">
//             Welcome to MarvelMarts. Track your deliveries and explore your personalized offers.
//           </p>
//         </div>
//       </section>

//       {/* Modern Action Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         {actions.map((action) => (
//           <Link key={action.label} href={action.href} className="group">
//             <div className="bg-neutral-white p-8 rounded-[28px] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
//               <div className={`w-14 h-14 ${action.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
//                 {action.icon}
//               </div>
//               <h3 className="text-xl font-black text-accent-navy mb-1">{action.label}</h3>
//               <p className="text-neutral-gray font-medium mb-6">{action.value}</p>
//               <div className="flex items-center text-brand-primary font-bold text-sm">
//                 Open <ArrowRight size={18} className="ml-2 group-hover:translate-x-2 transition-transform" />
//               </div>
//             </div>
//           </Link>
//         ))}
//       </div>

//       {/* Recent Activity Card */}
//       <div className="bg-neutral-white rounded-4xl p-8 md:p-10 border border-gray-100 shadow-sm text-center">
//         <div className="max-w-xs mx-auto">
//           <div className="w-20 h-20 bg-neutral-light rounded-full flex items-center justify-center mx-auto mb-6">
//             <ShoppingCart className="text-neutral-gray opacity-30" size={32} />
//           </div>
//           <h3 className="text-xl font-black text-accent-navy mb-2">No Recent Orders</h3>
//           <p className="text-neutral-gray font-medium mb-8">It looks like you haven't placed any orders in the last 30 days.</p>
//           <Link 
//             href="/shop" 
//             className="inline-block px-10 py-4 bg-brand-primary text-accent-navy rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-accent-navy hover:text-neutral-white transition-all shadow-lg shadow-brand-primary/20"
//           >
//             Start Shopping
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// }




import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { Session } from "next-auth";
import { Package, Heart, User, ArrowRight, ShoppingCart, ShoppingBag } from "lucide-react";
import Link from "next/link";
import DashboardHeader from "@/app/_components/DashboardHeader";

export default async function CustomerDashboardPage() {
  const session: Session | null = await getServerSession(authOptions);

  // Guard clause: if no session, return null (handled by middleware usually)
  if (!session) return null;

  const actions = [
    { 
      label: "My Orders", 
      value: "Check History", 
      icon: <Package className="text-brand-primary" />, 
      href: "/account/customer/orders",
      color: "bg-brand-light"
    },
    { 
      label: "Wishlist", 
      value: "View Favorites", 
      icon: <Heart className="text-brand-primary" />, 
      href: "/account/customer/wishlist",
      color: "bg-brand-light"
    },
    { 
      label: "Account Details", 
      value: "Update Profile", 
      icon: <User className="text-brand-primary" />, 
      href: "/account/customer/profile",
      color: "bg-brand-light"
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* 🔹 Dashboard Header with Logout integrated */}
      <DashboardHeader 
        title="Customer Dashboard" 
        showLogout={true} 
      />

      <div className="p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-700">
        
        {/* Welcome Hero Section */}
        <section className="relative overflow-hidden bg-accent-navy rounded-4xl p-8 md:p-12 text-neutral-white shadow-2xl shadow-accent-navy/20">
          {/* Decorative Glow using Brand Primary with Opacity */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 blur-3xl rounded-full -mr-20 -mt-20" />
          
          <div className="relative z-10">
            <span className="inline-block px-4 py-1 rounded-full bg-neutral-white/10 text-brand-primary text-xs font-black uppercase tracking-widest mb-4">
              Authorized Account
            </span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-2">
              Hello, {session.user.name?.split(' ')[0]}!
            </h2>
            <p className="text-brand-light text-lg font-medium opacity-90 max-w-md">
              Welcome to MarvelMarts. Track your deliveries and explore your personalized offers.
            </p>
          </div>
        </section>

        {/* Modern Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {actions.map((action) => (
            <Link key={action.label} href={action.href} className="group">
              <div className="bg-neutral-white p-8 rounded-[28px] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className={`w-14 h-14 ${action.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  {action.icon}
                </div>
                <h3 className="text-xl font-black text-accent-navy mb-1">{action.label}</h3>
                <p className="text-neutral-gray font-medium mb-6">{action.value}</p>
                <div className="flex items-center text-brand-primary font-bold text-sm">
                  Open <ArrowRight size={18} className="ml-2 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Activity / Empty State Card */}
        <div className="bg-neutral-white rounded-4xl p-8 md:p-10 border border-gray-100 shadow-sm text-center">
          <div className="max-w-xs mx-auto">
            <div className="w-20 h-20 bg-neutral-light rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="text-neutral-gray opacity-30" size={32} />
            </div>
            <h3 className="text-xl font-black text-accent-navy mb-2">No Recent Orders</h3>
            <p className="text-neutral-gray font-medium mb-8">It looks like you haven't placed any orders in the last 30 days.</p>
            <Link 
              href="/shop" 
              className="inline-block px-10 py-4 bg-brand-primary text-accent-navy rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-accent-navy hover:text-neutral-white transition-all shadow-lg shadow-brand-primary/20"
            >
              Start Shopping
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
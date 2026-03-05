// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/lib/auth"; 
// import DashboardHeader from "@/app/_components/DashboardHeader";
// import { 
//   Store, Rocket, ShieldCheck, AlertCircle, 
//   CheckCircle2, Circle, TrendingUp, ArrowUpRight,
//   ShoppingBag, Package, MessageSquare, Plus, ShieldAlert, RefreshCcw, ExternalLink
// } from "lucide-react";
// import Link from "next/link";
// import { prisma } from "@/app/lib/prisma";
// import { redirect } from "next/navigation";
// import { formatNaira } from "@/app/lib/FormatNaira";
// import { startOfDay, startOfMonth, subDays, format } from "date-fns";
// import BusinessToggleAction from "./_components/BusinessToggleActions"; 
// import VendorMessageBadge from "./_components/VendorMessageBadge";
// import RevenueChart from "./_components/RevenueChart"; 
// import BoostButton from "./_components/BoostButton";

// export default async function VendorDashboardPage() {
//   const session = await getServerSession(authOptions);

//   if (!session || !["VENDOR", "ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
//     redirect("/auth/sign-in");
//   }

//   let vendorData = await prisma.vendorProfile.findUnique({
//     where: { userId: session.user.id },
//     include: {
//       onboarding: true,
//       store: true,
//       score: true,
//       boost: true,
//       products: { 
//         take: 3, 
//         orderBy: { salesCount: 'desc' },
//         include: { images: true } 
//       } 
//     }
//   });

//   if (!vendorData) redirect("/auth/register/vendor-registration");
//   const vId = vendorData.id;

//   // 1. SELF-HEALING INITIALIZATION
//   if (!vendorData.onboarding) {
//     vendorData.onboarding = await prisma.vendorOnboarding.upsert({
//       where: { vendorProfileId: vId },
//       update: {},
//       create: { vendorProfileId: vId, profileDone: true, storeDone: false, productDone: false }
//     });
//   }

//   if (!vendorData.store) {
//     vendorData.store = await prisma.vendorStore.upsert({
//       where: { vendorProfileId: vId },
//       update: {},
//       create: { 
//         vendorProfileId: vId, 
//         name: vendorData.storeName || "My Store", 
//         slug: `${(vendorData.storeName || 'store').toLowerCase().replace(/\s+/g, '-')}-${vId.slice(-8)}`,
//         logo: vendorData.logoUrl,
//         banner: vendorData.coverUrl
//       }
//     });
//   }

//   // Ensure Boost record exists for "Boost Credits" functionality
// if (!vendorData.boost) {
//   vendorData.boost = await prisma.vendorBoost.upsert({
//     where: { vendorProfileId: vId },
//     update: {},
//     create: { 
//       vendorProfileId: vId, 
//       credits: 0, 
//       plan: "FREE" 
//     }
//   });
// }
//   const isVerified = vendorData.isVerified;
//   const onboarding = vendorData.onboarding;
//   const showOnboardingSteps = !onboarding?.storeDone || !onboarding?.productDone;
//   const showPendingBanner = !isVerified;

//   const today = startOfDay(new Date());
//   const monthStart = startOfMonth(new Date());
//   const thirtyDaysAgo = subDays(today, 30);

//   // FETCH STATS & GRAPH DATA
//   const [liveProductsCount, newOrdersCount, todayRevenue, monthRevenue, unreadCount, rawRevenueData] = await Promise.all([
//     prisma.product.count({ where: { vendorProfileId: vId, isPublished: true } }),
//     prisma.order.count({ where: { vendorProfileId: vId, status: "PENDING" } }),
//     prisma.order.aggregate({
//       where: { vendorProfileId: vId, status: "APPROVED", createdAt: { gte: today } },
//       _sum: { total: true }
//     }),
//     prisma.order.aggregate({
//       where: { vendorProfileId: vId, status: "APPROVED", createdAt: { gte: monthStart } },
//       _sum: { total: true }
//     }),
//     prisma.message.count({
//       where: {
//         conversation: { participantIds: { has: session.user.id } },
//         isRead: false,
//         senderId: { not: session.user.id }
//       }
//     }),
//     prisma.order.findMany({
//         where: { 
//             vendorProfileId: vId, 
//             status: "APPROVED", 
//             createdAt: { gte: thirtyDaysAgo } 
//         },
//         select: { total: true, createdAt: true },
//         orderBy: { createdAt: 'asc' }
//     })
//   ]);

//   // Transform raw orders into daily revenue for the chart
//   const dailyDataMap: Record<string, number> = {};
//   for (let i = 0; i < 30; i++) {
//     const dateStr = format(subDays(today, i), 'MMM dd');
//     dailyDataMap[dateStr] = 0;
//   }

//   rawRevenueData.forEach(order => {
//     const dateStr = format(order.createdAt, 'MMM dd');
//     if (dailyDataMap[dateStr] !== undefined) {
//         dailyDataMap[dateStr] += Number(order.total || 0);
//     }
//   });

//   const chartData = Object.entries(dailyDataMap)
//     .map(([date, amount]) => ({ date, amount }))
//     .reverse();

//   const mappedProducts = vendorData.products.map(p => ({
//     ...p,
//     imageUrl: p.images[0]?.url || '/logo.png'
//   }));

//   const stats = [
//     { label: "Live Products", value: liveProductsCount, icon: <Package size={20}/>, color: "bg-blue-50 text-blue-600" },
//     { label: "New Orders", value: newOrdersCount, icon: <ShoppingBag size={20}/>, color: "bg-red-50 text-red-600" },
//     { label: "Reputation", value: vendorData.score?.tier || "BRONZE", icon: <ShieldCheck size={20}/>, color: "bg-purple-50 text-purple-600" },
//     { label: "Boost Credits", value: vendorData.boost?.credits ?? 0, icon: <Rocket size={20}/>, color: "bg-orange-50 text-orange-600" },
//   ];

//   return (
//     <div className=" flex flex-col min-h-screen text-md bg-[#FBFBFB]">
//       <DashboardHeader title="Merchant Command" showLogout={true} />

//       <div className="p-4 lg:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        
//         {/* HEADER SECTION */}
//         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
//             <div className="flex items-center gap-4">
//                 <div className="w-16 h-16 bg-accent-navy rounded-3xl flex items-center justify-center text-brand-primary shadow-2xl">
//                     <Store size={32} />
//                 </div>
//                 <div>
//                     <h1 className="text-md font-black text-accent-navy uppercase tracking-tighter italic leading-none">
//                         {vendorData.store?.name || "Merchant"}<span className="text-brand-primary">.</span>
//                     </h1>
//                     <div className="flex items-center gap-2 mt-2">
//                         <p className="text-[10px] font-black text-neutral-gray uppercase tracking-widest">
//                             SID: {vId.slice(-8).toUpperCase()}
//                         </p>
//                         {isVerified && (
//                              <span className="flex items-center gap-1 bg-green-50 text-green-600 px-2 py-0.5 rounded-full text-[8px] font-black uppercase">
//                                 <CheckCircle2 size={10} /> Verified
//                              </span>
//                         )}
//                     </div>
//                 </div>
//             </div>

//             <div className="flex items-center gap-4">
//                 <Link 
//                     href={`/store/${vendorData.store?.slug}`} 
//                     target="_blank"
//                     className="flex items-center gap-2 px-6 py-4 bg-white border border-gray-100 text-accent-navy rounded-2xl font-black text-[8px] uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm group"
//                 >
//                     <ExternalLink size={14} className="group-hover:text-brand-primary text-sm transition-colors" />
//                     View Public Store
//                 </Link>
//                 <BusinessToggleAction />
//             </div>
//         </div>

//         {/* ACCOUNT STATUS BANNER */}
//         {showPendingBanner && (
//           <div className="bg-accent-navy rounded-[2.5rem] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden group">
//             <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-brand-primary/20 transition-all" />
//             <div className="flex items-center gap-6 relative z-10">
//               <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
//                 <RefreshCcw className="animate-spin-slow text-brand-primary" size={24} />
//               </div>
//               <div>
//                 <p className="font-black uppercase text-lg tracking-tight">Verification in Progress</p>
//                 <p className="text-[10px] font-bold opacity-70 uppercase italic max-w-md">Your documents are under manual review by compliance. Verified badges activate within 48h of approval.</p>
//               </div>
//             </div>
//             <div className="flex gap-4 relative z-10">
//                 <Link href="/account/vendor/verification-center" className="px-8 py-4 bg-brand-primary text-accent-navy rounded-xl text-[10px] font-black uppercase shadow-lg hover:scale-105 transition-transform">Verification Center</Link>
//             </div>
//           </div>
//         )}

//         {/* STATS GRID */}
//         <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
//           {stats.map((stat) => (
//             <div key={stat.label} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
//               <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${stat.color}`}>
//                 {stat.icon}
//               </div>
//               <p className="text-[10px] font-black text-neutral-gray uppercase tracking-widest">{stat.label}</p>
//               <h3 className="text-2xl font-black text-accent-navy mt-1 uppercase italic tracking-tighter">{stat.value}</h3>
//             </div>
//           ))}
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           <div className="lg:col-span-2 space-y-8">
//             <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col h-[480px]">
//               <div className="flex justify-between items-center mb-8">
//                 <div>
//                     <h3 className="text-xl font-black text-accent-navy uppercase tracking-tight italic">Performance Graph</h3>
//                     <p className="text-[9px] font-bold text-neutral-gray uppercase tracking-widest">Revenue Flow (30 Days)</p>
//                 </div>
//                 <TrendingUp className="text-brand-primary" />
//               </div>
              
//               {/* FUNCTIONAL CHART INTEGRATION */}
//               <div className="flex-1 w-full bg-[#FBFBFB] rounded-3xl border border-gray-100 overflow-hidden mb-8">
//                  <RevenueChart data={chartData} />
//               </div>

//               <div className="grid grid-cols-2 border-t border-gray-50 pt-8">
//                 <div>
//                   <p className="text-[10px] font-black text-neutral-gray uppercase tracking-widest mb-2">Total Revenue Today</p>
//                   <p className="text-2xl font-black text-accent-navy italic">{formatNaira(Number(todayRevenue._sum.total || 0))}</p>
//                 </div>
//                 <div className="text-right">
//                   <p className="text-[10px] font-black text-neutral-gray uppercase tracking-widest mb-2">Monthly Stash</p>
//                   <p className="text-2xl font-black text-brand-primary italic">{formatNaira(Number(monthRevenue._sum.total || 0))}</p>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
//                 <div className="flex justify-between items-center mb-8">
//                    <h3 className="text-sm font-black text-accent-navy uppercase tracking-tight italic">Top Inventory</h3>
//                    <Link href="/account/vendor/products" className="text-[10px] font-black text-brand-primary uppercase underline italic tracking-widest">Manage All</Link>
//                 </div>
//                 <div className="space-y-4">
//                   {mappedProducts.length > 0 ? mappedProducts.map(product => (
//                     <div key={product.id} className="flex items-center gap-4 p-2 bg-gray-50/50 rounded-3xl group border border-transparent hover:border-brand-primary/20 hover:bg-white hover:shadow-xl transition-all duration-300">
//                       <div className="w-16 h-16 rounded-2xl bg-white overflow-hidden border border-gray-100 shrink-0 p-2">
//                         <img src={product.imageUrl} className="w-full h-full object-contain group-hover:scale-110 transition-transform" alt={product.title}/>
//                       </div>
//                       <div className="grid grid-cols-1">
//                         <p className="text-sm xxs:text-[8px] font-black text-accent-navy uppercase truncate italic">{product.title}</p>
//                         <p className="text-[9px] font-black text-neutral-gray uppercase mt-1 italic tracking-tighter">
//                             Sales: {product.salesCount || 0} units <span className="mx-2 opacity-30">|</span> Stock: {product.stock || 0}
//                         </p>
//                       </div>
//                       <div className="text-right pr-2">
//                         <p className="font-black text-accent-navy text-sm xxs:[7px] italic tracking-tighter">{formatNaira(Number(product.price))}</p>
//                       </div>
//                       <div className="text-right pr-2 space-y-2">
//                           <p className="font-black text-accent-navy text-sm italic tracking-tighter">
//                             {formatNaira(Number(product.price))}
//                           </p>
//                           <BoostButton productId={product.id} />
//                         </div>
//                     </div>
//                   )) : (
//                     <div className="py-20 text-center text-neutral-gray text-[10px] font-black uppercase border-2 border-dashed border-gray-100 rounded-[2rem] italic tracking-widest">No products detected in inventory</div>
//                   )}
//                 </div>
//             </div>
//           </div>

//           {/* SIDEBAR */}
//           <div className="space-y-8"> 
//             {showOnboardingSteps && (
//               <div className="bg-brand-primary p-8 rounded-[2.5rem] shadow-2xl animate-in zoom-in duration-500 relative overflow-hidden">
//                 <div className="absolute top-0 right-0 p-4 opacity-10">
//                     <ShieldAlert size={80} />
//                 </div>
//                 <h3 className="text-lg font-black text-gray-900 uppercase mb-6 flex items-center gap-2 relative z-10">
//                   <AlertCircle size={18} className="text-red-700" /> Pending store setup
//                 </h3>
//                 <div className="space-y-4 relative z-10">
//                   <OnboardingStep 
//                     label="KYC Verification" 
//                     done={onboarding?.profileDone ?? true} 
//                     href="/account/vendor/verification-center" 
//                     dark
//                   />
//                   <OnboardingStep 
//                     label="Store Branding" 
//                     done={onboarding?.storeDone ?? false} 
//                     href="/account/vendor/settings/store-setup" 
//                     dark
//                   />
//                   <OnboardingStep 
//                     label="Product Launch" 
//                     done={onboarding?.productDone ?? false} 
//                     href="/account/vendor/products/new" 
//                     dark
//                   />
//                 </div>
//               </div>
//             )}

//             <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
//                 <div className="flex justify-between items-center mb-8">
//                    <h3 className="text-lg font-black text-accent-navy uppercase italic">Comm Center</h3>
//                    <VendorMessageBadge vendorProfileId={vId} initialUnreadCount={unreadCount} />
//                 </div>
//                 <div className="space-y-6">
//                   <div className="p-5 bg-gray-50/50 rounded-2xl border border-transparent italic">
//                      <p className="text-[10px] font-bold text-accent-navy tracking-tight leading-relaxed">System Note: Response time directly impacts your Merchant Tier rating.</p>
//                   </div>
//                   <Link href="/account/vendor/messages" className="block text-center py-4 bg-accent-navy text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-brand-primary hover:text-accent-navy transition-all shadow-lg active:scale-95">
//                     Open Channel
//                   </Link>
//                 </div>
//             </div>

//             <div className="space-y-4">
//               <TipCard text="Verified badges boost product visibility by 40%." />
//               <TipCard text="High-quality images lead to 3x higher conversion." />
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function OnboardingStep({ label, done, href, dark = false }: { label: string; done?: boolean; href: string; dark?: boolean }) {
//   return (
//     <Link 
//       href={done ? "#" : href} 
//       className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
//         done 
//         ? 'bg-green-500 border-green-500 opacity-50 pointer-events-none' 
//         : dark 
//             ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-brand-primary group' 
//             : 'bg-white border-gray-100 hover:border-brand-primary hover:shadow-md group'
//       }`}
//     >
//       <div className="flex items-center gap-3">
//         {done ? <CheckCircle2 className="text-gray-50" size={18} /> : <Circle className={`${dark ? 'text-white' : 'text-gray-300'} group-hover:text-accent-navy`} size={18} />}
//         <span className={`text-[13px] font-bold uppercase ${done ? 'text-black' : dark ? 'text-white' : 'text-accent-navy'}`}>{label}</span>
//       </div>
//       {!done && <ArrowUpRight className={`${dark ? 'text-white' : 'text-gray-300'} group-hover:text-brand-primary`} size={14} />}
//     </Link>
//   );
// }

// function TipCard({ text }: { text: string }) {
//   return (
//     <div className="p-6 bg-white border border-gray-100 rounded-[2rem] shadow-sm flex items-start gap-4 hover:border-brand-primary/30 transition-colors">
//       <div className="w-8 h-8 rounded-xl bg-brand-primary/10 flex items-center justify-center shrink-0">
//         <ShieldCheck className="text-brand-primary" size={16} />
//       </div>
//       <p className="text-[10px] font-black text-accent-navy uppercase leading-relaxed tracking-tight italic">{text}</p>
//     </div>
//   );
// }





import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth"; 
import DashboardHeader from "@/app/_components/DashboardHeader";
import { 
  Store, Rocket, ShieldCheck, AlertCircle, 
  CheckCircle2, Circle, TrendingUp, ArrowUpRight,
  ShoppingBag, Package, MessageSquare, Plus, ShieldAlert, RefreshCcw, ExternalLink
} from "lucide-react";
import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";
import { formatNaira } from "@/app/lib/FormatNaira";
import { startOfDay, startOfMonth, subDays, format } from "date-fns";
import BusinessToggleAction from "./_components/BusinessToggleActions"; 
import VendorMessageBadge from "./_components/VendorMessageBadge";
import RevenueChart from "./_components/RevenueChart"; 
import BoostButton from "./_components/BoostButton";

export default async function VendorDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !["VENDOR", "ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    redirect("/auth/sign-in");
  }

  let vendorData = await prisma.vendorProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      onboarding: true,
      store: true,
      score: true,
      boost: true,
      products: { 
        take: 3, 
        orderBy: { salesCount: 'desc' },
        include: { images: true } 
      } 
    }
  });

  if (!vendorData) redirect("/auth/register/vendor-registration");
  const vId = vendorData.id;

  // 1. SELF-HEALING INITIALIZATION
  if (!vendorData.onboarding) {
    vendorData.onboarding = await prisma.vendorOnboarding.upsert({
      where: { vendorProfileId: vId },
      update: {},
      create: { vendorProfileId: vId, profileDone: true, storeDone: false, productDone: false }
    });
  }

  if (!vendorData.store) {
    vendorData.store = await prisma.vendorStore.upsert({
      where: { vendorProfileId: vId },
      update: {},
      create: { 
        vendorProfileId: vId, 
        name: vendorData.storeName || "My Store", 
        slug: `${(vendorData.storeName || 'store').toLowerCase().replace(/\s+/g, '-')}-${vId.slice(-8)}`,
        logo: vendorData.logoUrl,
        banner: vendorData.coverUrl
      }
    });
  }

  // Ensure Boost record exists
  if (!vendorData.boost) {
    vendorData.boost = await prisma.vendorBoost.upsert({
      where: { vendorProfileId: vId },
      update: {},
      create: { 
        vendorProfileId: vId, 
        credits: 0, 
        plan: "FREE" 
      }
    });
  }

  const isVerified = vendorData.isVerified;
  const onboarding = vendorData.onboarding;
  const showOnboardingSteps = !onboarding?.storeDone || !onboarding?.productDone;
  const showPendingBanner = !isVerified;

  const today = startOfDay(new Date());
  const monthStart = startOfMonth(new Date());
  const thirtyDaysAgo = subDays(today, 30);

  // FETCH STATS & GRAPH DATA
  const [liveProductsCount, newOrdersCount, todayRevenue, monthRevenue, unreadCount, rawRevenueData] = await Promise.all([
    prisma.product.count({ where: { vendorProfileId: vId, isPublished: true } }),
    prisma.order.count({ where: { vendorProfileId: vId, status: "PENDING" } }),
    prisma.order.aggregate({
      where: { vendorProfileId: vId, status: "APPROVED", createdAt: { gte: today } },
      _sum: { total: true }
    }),
    prisma.order.aggregate({
      where: { vendorProfileId: vId, status: "APPROVED", createdAt: { gte: monthStart } },
      _sum: { total: true }
    }),
    prisma.message.count({
      where: {
        conversation: { participantIds: { has: session.user.id } },
        isRead: false,
        senderId: { not: session.user.id }
      }
    }),
    prisma.order.findMany({
        where: { 
            vendorProfileId: vId, 
            status: "APPROVED", 
            createdAt: { gte: thirtyDaysAgo } 
        },
        select: { total: true, createdAt: true },
        orderBy: { createdAt: 'asc' }
    })
  ]);

  // Transform raw orders into daily revenue for the chart
  const dailyDataMap: Record<string, number> = {};
  for (let i = 0; i < 30; i++) {
    const dateStr = format(subDays(today, i), 'MMM dd');
    dailyDataMap[dateStr] = 0;
  }

  rawRevenueData.forEach(order => {
    const dateStr = format(order.createdAt, 'MMM dd');
    if (dailyDataMap[dateStr] !== undefined) {
        dailyDataMap[dateStr] += Number(order.total || 0);
    }
  });

  const chartData = Object.entries(dailyDataMap)
    .map(([date, amount]) => ({ date, amount }))
    .reverse();

  const mappedProducts = vendorData.products.map(p => ({
    ...p,
    imageUrl: p.images[0]?.url || '/logo.png'
  }));

  const stats = [
    { label: "Live Products", value: liveProductsCount, icon: <Package size={20}/>, color: "bg-blue-50 text-blue-600", href: null },
    { label: "New Orders", value: newOrdersCount, icon: <ShoppingBag size={20}/>, color: "bg-red-50 text-red-600", href: null },
    { label: "Reputation", value: vendorData.score?.tier || "BRONZE", icon: <ShieldCheck size={20}/>, color: "bg-purple-50 text-purple-600", href: null },
    { label: "Boost Credits", value: vendorData.boost?.credits ?? 0, icon: <Rocket size={20}/>, color: "bg-orange-50 text-orange-600", href: "/account/vendor/store-settings" },
  ];

  return (
    <div className=" flex flex-col min-h-screen text-md bg-[#FBFBFB]">
      <DashboardHeader title="Merchant Command" showLogout={true} />

      <div className="p-4 lg:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-accent-navy rounded-3xl flex items-center justify-center text-brand-primary shadow-2xl">
                    <Store size={32} />
                </div>
                <div>
                    <h1 className="text-md font-black text-accent-navy uppercase tracking-tighter italic leading-none">
                        {vendorData.store?.name || "Merchant"}<span className="text-brand-primary">.</span>
                    </h1>
                    <div className="flex items-center gap-2 mt-2">
                        <p className="text-[10px] font-black text-neutral-gray uppercase tracking-widest">
                            SID: {vId.slice(-8).toUpperCase()}
                        </p>
                        {isVerified && (
                             <span className="flex items-center gap-1 bg-green-50 text-green-600 px-2 py-0.5 rounded-full text-[8px] font-black uppercase">
                                <CheckCircle2 size={10} /> Verified
                             </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <Link 
                    href={`/store/${vendorData.store?.slug}`} 
                    target="_blank"
                    className="flex items-center gap-2 px-6 py-4 bg-white border border-gray-100 text-accent-navy rounded-2xl font-black text-[8px] uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm group"
                >
                    <ExternalLink size={14} className="group-hover:text-brand-primary text-sm transition-colors" />
                    View Public Store
                </Link>
                <BusinessToggleAction />
            </div>
        </div>

        {/* ACCOUNT STATUS BANNER */}
        {showPendingBanner && (
          <div className="bg-accent-navy rounded-[2.5rem] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-brand-primary/20 transition-all" />
            <div className="flex items-center gap-6 relative z-10">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                <RefreshCcw className="animate-spin-slow text-brand-primary" size={24} />
              </div>
              <div>
                <p className="font-black uppercase text-lg tracking-tight">Verification in Progress</p>
                <p className="text-[10px] font-bold opacity-70 uppercase italic max-w-md">Your documents are under manual review by compliance. Verified badges activate within 48h of approval.</p>
              </div>
            </div>
            <div className="flex gap-4 relative z-10">
                <Link href="/account/vendor/verification-center" className="px-8 py-4 bg-brand-primary text-accent-navy rounded-xl text-[10px] font-black uppercase shadow-lg hover:scale-105 transition-transform">Verification Center</Link>
            </div>
          </div>
        )}

        {/* STATS GRID */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const CardContent = (
              <>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${stat.color}`}>
                  {stat.icon}
                </div>
                <p className="text-[10px] font-black text-neutral-gray uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-2xl font-black text-accent-navy mt-1 uppercase italic tracking-tighter">{stat.value}</h3>
                {stat.href && (
                  <div className="mt-4 flex items-center gap-1 text-[8px] font-black text-brand-primary uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                    Buy Credits <ArrowUpRight size={10} />
                  </div>
                )}
              </>
            );

            return stat.href ? (
              <Link 
                key={stat.label} 
                href={stat.href} 
                className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md hover:border-brand-primary/30 transition-all group"
              >
                {CardContent}
              </Link>
            ) : (
              <div key={stat.label} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                {CardContent}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col h-[480px]">
              <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="text-xl font-black text-accent-navy uppercase tracking-tight italic">Performance Graph</h3>
                    <p className="text-[9px] font-bold text-neutral-gray uppercase tracking-widest">Revenue Flow (30 Days)</p>
                </div>
                <TrendingUp className="text-brand-primary" />
              </div>
              
              <div className="flex-1 w-full bg-[#FBFBFB] rounded-3xl border border-gray-100 overflow-hidden mb-8">
                 <RevenueChart data={chartData} />
              </div>

              <div className="grid grid-cols-2 border-t border-gray-50 pt-8">
                <div>
                  <p className="text-[10px] font-black text-neutral-gray uppercase tracking-widest mb-2">Total Revenue Today</p>
                  <p className="text-2xl font-black text-accent-navy italic">{formatNaira(Number(todayRevenue._sum.total || 0))}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-neutral-gray uppercase tracking-widest mb-2">Monthly Stash</p>
                  <p className="text-2xl font-black text-brand-primary italic">{formatNaira(Number(monthRevenue._sum.total || 0))}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                   <h3 className="text-sm font-black text-accent-navy uppercase tracking-tight italic">Top Inventory</h3>
                   <Link href="/account/vendor/products" className="text-[10px] font-black text-brand-primary uppercase underline italic tracking-widest">Manage All</Link>
                </div>
                <div className="space-y-4">
                  {mappedProducts.length > 0 ? mappedProducts.map(product => (
                    <div key={product.id} className="flex items-center gap-4 p-2 bg-gray-50/50 rounded-3xl group border border-transparent hover:border-brand-primary/20 hover:bg-white hover:shadow-xl transition-all duration-300">
                      <div className="w-16 h-16 rounded-2xl bg-white overflow-hidden border border-gray-100 shrink-0 p-2">
                        <img src={product.imageUrl} className="w-full h-full object-contain group-hover:scale-110 transition-transform" alt={product.title}/>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-black text-accent-navy uppercase truncate italic">{product.title}</p>
                        <p className="text-[9px] font-black text-neutral-gray uppercase mt-1 italic tracking-tighter">
                            Sales: {product.salesCount || 0} units <span className="mx-2 opacity-30">|</span> Stock: {product.stock || 0}
                        </p>
                      </div>
                      <div className="text-right pr-2 space-y-2">
                          <p className="font-black text-accent-navy text-sm italic tracking-tighter">
                            {formatNaira(Number(product.price))}
                          </p>
                          <BoostButton productId={product.id} />
                        </div>
                    </div>
                  )) : (
                    <div className="py-20 text-center text-neutral-gray text-[10px] font-black uppercase border-2 border-dashed border-gray-100 rounded-[2rem] italic tracking-widest">No products detected in inventory</div>
                  )}
                </div>
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="space-y-8"> 
            {showOnboardingSteps && (
              <div className="bg-brand-primary p-8 rounded-[2.5rem] shadow-2xl animate-in zoom-in duration-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <ShieldAlert size={80} />
                </div>
                <h3 className="text-lg font-black text-gray-900 uppercase mb-6 flex items-center gap-2 relative z-10">
                  <AlertCircle size={18} className="text-red-700" /> Pending store setup
                </h3>
                <div className="space-y-4 relative z-10">
                  <OnboardingStep 
                    label="KYC Verification" 
                    done={onboarding?.profileDone ?? true} 
                    href="/account/vendor/verification-center" 
                    dark
                  />
                  <OnboardingStep 
                    label="Store Branding" 
                    done={onboarding?.storeDone ?? false} 
                    href="/account/vendor/store-settings" 
                    dark
                  />
                  <OnboardingStep 
                    label="Product Launch" 
                    done={onboarding?.productDone ?? false} 
                    href="/account/vendor/products/new" 
                    dark
                  />
                </div>
              </div>
            )}

            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                   <h3 className="text-lg font-black text-accent-navy uppercase italic">Comm Center</h3>
                   <VendorMessageBadge vendorProfileId={vId} initialUnreadCount={unreadCount} />
                </div>
                <div className="space-y-6">
                  <div className="p-5 bg-gray-50/50 rounded-2xl border border-transparent italic">
                     <p className="text-[10px] font-bold text-accent-navy tracking-tight leading-relaxed">System Note: Response time directly impacts your Merchant Tier rating.</p>
                  </div>
                  <Link href="/account/vendor/messages" className="block text-center py-4 bg-accent-navy text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-brand-primary hover:text-accent-navy transition-all shadow-lg active:scale-95">
                    Open Channel
                  </Link>
                </div>
            </div>

            <div className="space-y-4">
              <TipCard text="Verified badges boost product visibility by 40%." />
              <TipCard text="High-quality images lead to 3x higher conversion." />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OnboardingStep({ label, done, href, dark = false }: { label: string; done?: boolean; href: string; dark?: boolean }) {
  return (
    <Link 
      href={done ? "#" : href} 
      className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
        done 
        ? 'bg-green-500 border-green-500 opacity-50 pointer-events-none' 
        : dark 
            ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-brand-primary group' 
            : 'bg-white border-gray-100 hover:border-brand-primary hover:shadow-md group'
      }`}
    >
      <div className="flex items-center gap-3">
        {done ? <CheckCircle2 className="text-gray-50" size={18} /> : <Circle className={`${dark ? 'text-white' : 'text-gray-300'} group-hover:text-accent-navy`} size={18} />}
        <span className={`text-[13px] font-bold uppercase ${done ? 'text-black' : dark ? 'text-white' : 'text-accent-navy'}`}>{label}</span>
      </div>
      {!done && <ArrowUpRight className={`${dark ? 'text-white' : 'text-gray-300'} group-hover:text-brand-primary`} size={14} />}
    </Link>
  );
}

function TipCard({ text }: { text: string }) {
  return (
    <div className="p-6 bg-white border border-gray-100 rounded-[2rem] shadow-sm flex items-start gap-4 hover:border-brand-primary/30 transition-colors">
      <div className="w-8 h-8 rounded-xl bg-brand-primary/10 flex items-center justify-center shrink-0">
        <ShieldCheck className="text-brand-primary" size={16} />
      </div>
      <p className="text-[10px] font-black text-accent-navy uppercase leading-relaxed tracking-tight italic">{text}</p>
    </div>
  );
}
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/lib/auth"; 
// import DashboardHeader from "@/app/_components/DashboardHeader";
// import { 
//   Store, Rocket, ShieldCheck, AlertCircle, 
//   CheckCircle2, Circle, TrendingUp, ArrowUpRight,
//   ShoppingBag, Package, MessageSquare, Plus, ShieldAlert, RefreshCcw
// } from "lucide-react";
// import Link from "next/link";
// import { prisma } from "@/app/lib/prisma";
// import { redirect } from "next/navigation";
// import { formatNaira } from "@/app/lib/FormatNaira";
// import { startOfDay, startOfMonth } from "date-fns";

// export default async function VendorDashboardPage() {
//   const session = await getServerSession(authOptions);

//   if (!session || session.user.role !== "VENDOR") {
//     redirect("/auth/sign-in");
//   }

//   // 1. Initial Fetch with Roadmap Relations + Product Images
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

//   if (!vendorData) redirect("/onboarding/apply");
//   const vId = vendorData.id;

//   // --- STATUS GUARDS ---
//   const isVerified = vendorData.isVerified;
//   const hasSubmitted = vendorData.onboarding?.completed;

//   // Case A: Application Pending (Submitted but not verified yet)
//   if (!isVerified && hasSubmitted) {
//     return (
//       <div className="min-h-screen bg-[#FBFBFB] flex items-center justify-center p-6">
//         <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-xl shadow-blue-100/50 border border-blue-50 text-center">
//           <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
//             <RefreshCcw className="text-blue-500 animate-spin-slow" size={40} />
//           </div>
//           <h2 className="text-2xl font-black text-accent-navy mb-3 uppercase tracking-tight">Review in Progress</h2>
//           <p className="text-neutral-gray font-bold text-sm leading-relaxed mb-8 uppercase tracking-tight">
//             Your application is currently being reviewed by our team. You will be notified once your store is activated.
//           </p>
//           <Link href="/" className="flex items-center justify-center gap-2 w-full py-4 bg-accent-navy hover:bg-brand-primary text-white rounded-2xl font-black uppercase text-xs transition-all shadow-lg">
//             Return to Marketplace
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   // Case B: Application Rejected (Not verified and onboarding reset/incomplete)
//   if (!isVerified && !hasSubmitted) {
//     return (
//       <div className="min-h-screen bg-[#FBFBFB] flex items-center justify-center p-6">
//         <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-xl shadow-red-100/50 border border-red-50 text-center">
//           <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
//             <AlertCircle className="text-red-500" size={40} />
//           </div>
//           <h2 className="text-2xl font-black text-accent-navy mb-3 uppercase tracking-tight">Application Declined</h2>
//           <p className="text-neutral-gray font-bold text-sm leading-relaxed mb-8 uppercase tracking-tight">
//             Your vendor application was not approved. Please review your details and re-apply.
//           </p>
//           <Link href="/onboarding/apply" className="flex items-center justify-center gap-2 w-full py-4 bg-accent-navy hover:bg-brand-primary text-white rounded-2xl font-black uppercase text-xs transition-all shadow-lg">
//             <RefreshCcw size={16} /> Update & Re-apply
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   // 2. SELF-HEALING INITIALIZATION
//   if (!vendorData.onboarding) {
//     vendorData.onboarding = await prisma.vendorOnboarding.upsert({
//       where: { vendorProfileId: vId },
//       update: {},
//       create: { vendorProfileId: vId, profileDone: true }
//     });
//   }

//   if (!vendorData.store) {
//     vendorData.store = await prisma.vendorStore.upsert({
//       where: { vendorProfileId: vId },
//       update: {},
//       create: { 
//         vendorProfileId: vId, 
//         name: vendorData.storeName, 
//         slug: `${vendorData.storeName.toLowerCase().replace(/\s+/g, '-')}-${vId.slice(-4)}`,
//         logo: vendorData.logoUrl,
//         banner: vendorData.coverUrl
//       }
//     });
//   }

//   if (!vendorData.score) {
//     vendorData.score = await prisma.vendorScore.upsert({
//       where: { vendorProfileId: vId },
//       update: {},
//       create: { vendorProfileId: vId, score: 0, tier: "BRONZE" }
//     });
//   }

//   if (!vendorData.boost) {
//     vendorData.boost = await prisma.vendorBoost.upsert({
//       where: { vendorProfileId: vId },
//       update: {},
//       create: { vendorProfileId: vId, credits: 100 }
//     });
//   }

//   // 3. Fetch Real-time Stats & Revenue
//   const today = startOfDay(new Date());
//   const monthStart = startOfMonth(new Date());

//   const [liveProductsCount, newOrdersCount, todayRevenue, monthRevenue] = await Promise.all([
//     prisma.product.count({ where: { vendorProfileId: vId, isPublished: true } }),
//     prisma.order.count({ where: { vendorProfileId: vId, status: "pending" } }),
//     prisma.order.aggregate({
//       where: { vendorProfileId: vId, status: "approved", createdAt: { gte: today } },
//       _sum: { total: true }
//     }),
//     prisma.order.aggregate({
//       where: { vendorProfileId: vId, status: "approved", createdAt: { gte: monthStart } },
//       _sum: { total: true }
//     })
//   ]);

//   // Map products to include imageUrl for the UI
//   const mappedProducts = vendorData.products.map(p => ({
//     ...p,
//     imageUrl: p.images[0]?.url || '/logo.png'
//   }));

//   const stats = [
//     { label: "Live Products", value: liveProductsCount, icon: <Package size={20}/>, color: "bg-blue-50 text-blue-600" },
//     { label: "New Orders", value: newOrdersCount, icon: <ShoppingBag size={20}/>, color: "bg-red-50 text-red-600" },
//     { label: "Trust Badge", value: vendorData.score?.tier || "BRONZE", icon: <ShieldCheck size={20}/>, color: "bg-purple-50 text-purple-600" },
//     { label: "Boost Credits", value: vendorData.boost?.credits ?? 0, icon: <Rocket size={20}/>, color: "bg-orange-50 text-orange-600" },
//   ];

//   return (
//     <div className="flex flex-col min-h-screen bg-[#FBFBFB]">
//       <DashboardHeader title="Merchant Command" showLogout={true} />

//       <div className="p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        
//         {/* --- SUSPENSION BANNER --- */}
//         {vendorData.isSuspended && (
//           <div className="overflow-hidden rounded-[2rem] bg-gradient-to-r from-red-600 to-red-500 p-[1px] shadow-lg shadow-red-200">
//             <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white rounded-[1.95rem] px-8 py-6">
//               <div className="flex items-center gap-5">
//                 <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600 shadow-inner">
//                   <ShieldAlert size={28} />
//                 </div>
//                 <div>
//                   <h4 className="text-lg font-black text-accent-navy uppercase tracking-tight">Store Suspended</h4>
//                   <p className="text-sm font-bold text-neutral-gray italic">
//                     Admin has restricted your store visibility. Customers cannot see your products.
//                   </p>
//                 </div>
//               </div>
//               <Link href="mailto:support@marvelmarts.com" className="px-8 py-3 bg-accent-navy text-white rounded-xl text-xs font-black uppercase hover:bg-brand-primary transition-all">
//                 Contact Support
//               </Link>
//             </div>
//           </div>
//         )}

//         {/* TOP ROW: STATS GRID */}
//         <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
//           {stats.map((stat) => (
//             <div key={stat.label} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
//               <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${stat.color}`}>
//                 {stat.icon}
//               </div>
//               <p className="text-[10px] font-black text-neutral-gray uppercase tracking-widest">{stat.label}</p>
//               <h3 className="text-xl font-black text-accent-navy mt-1">{stat.value}</h3>
//             </div>
//           ))}
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           <div className="lg:col-span-2 space-y-8">
//             <div className="bg-white p-8 rounded-4xl border border-gray-100 shadow-sm flex flex-col h-[400px]">
//               <div className="flex justify-between items-center mb-8">
//                 <h3 className="text-xl font-black text-accent-navy uppercase tracking-tight">Sales Overview</h3>
//                 <TrendingUp className="text-brand-primary" />
//               </div>
//               <div className="flex-1 flex flex-col justify-center items-center py-12 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100 mb-6">
//                 <p className="text-neutral-gray font-bold text-xs uppercase italic tracking-widest">Earnings Chart Loading...</p>
//               </div>
//               <div className="grid grid-cols-2 border-t border-gray-50 pt-6">
//                 <div>
//                   <p className="text-[10px] font-black text-neutral-gray uppercase">Today's Earnings</p>
//                   <p className="text-lg font-black text-accent-navy">{formatNaira(Number(todayRevenue._sum.total || 0))}</p>
//                 </div>
//                 <div className="text-right">
//                   <p className="text-[10px] font-black text-neutral-gray uppercase">This Month</p>
//                   <p className="text-lg font-black text-brand-primary font-italic italic">{formatNaira(Number(monthRevenue._sum.total || 0))}</p>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white p-8 rounded-4xl border border-gray-100 shadow-sm">
//                 <div className="flex justify-between items-center mb-8">
//                    <h3 className="text-xl font-black text-accent-navy uppercase tracking-tight">Top Selling</h3>
//                    <Link href="/account/vendor/products" className="text-[10px] font-black text-brand-primary uppercase underline">View All</Link>
//                 </div>
//                 <div className="space-y-4">
//                   {mappedProducts.length > 0 ? mappedProducts.map(product => (
//                     <div key={product.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl group cursor-pointer hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-brand-primary/20">
//                       <div className="w-14 h-14 rounded-xl bg-white overflow-hidden border border-gray-100 shrink-0">
//                         <img src={product.imageUrl} className="w-full h-full object-contain p-1" alt={product.title}/>
//                       </div>
//                       <div className="flex-1">
//                         <p className="text-sm font-black text-accent-navy uppercase truncate italic">{product.title}</p>
//                         <p className="text-[9px] font-bold text-neutral-gray uppercase mt-1 tracking-tighter">{product.salesCount || 0} Units Sold Total</p>
//                       </div>
//                       <div className="text-right">
//                         <p className="font-black text-brand-primary text-md">{formatNaira(Number(product.price))}</p>
//                         <button className="text-[8px] font-black uppercase text-accent-navy/40 hover:text-brand-primary">Boost</button>
//                       </div>
//                     </div>
//                   )) : (
//                     <div className="py-12 text-center text-neutral-gray text-[10px] font-black uppercase border-2 border-dashed border-gray-100 rounded-3xl">No products listed yet</div>
//                   )}
//                 </div>
//             </div>
//           </div>

//           <div className="space-y-8">
//             {!vendorData.onboarding?.completed && (
//               <div className="bg-white border-2 border-brand-primary/20 p-6 rounded-4xl shadow-sm">
//                 <h3 className="text-md font-black text-accent-navy uppercase mb-4 flex items-center gap-2">
//                   <AlertCircle size={18} className="text-brand-primary" /> Action Needed
//                 </h3>
//                 <div className="space-y-3">
//                   <OnboardingStep label="Identity Verified" done={vendorData.onboarding?.profileDone} href="/auth/register/vendor-registration" />
//                   <OnboardingStep label="Store Identity" done={vendorData.onboarding?.storeDone} href="/account/vendor/settings/store-setup" />
//                   <OnboardingStep label="First Product" done={vendorData.onboarding?.productDone} href="/account/vendor/products/new" />
//                 </div>
//               </div>
//             )}

//             <div className="bg-white p-6 rounded-4xl border border-gray-100 shadow-sm">
//                 <div className="flex justify-between items-center mb-6">
//                    <h3 className="text-lg font-black text-accent-navy uppercase">Messages</h3>
//                    <MessageSquare className="text-brand-primary" size={20} />
//                 </div>
//                 <div className="space-y-4">
//                   <div className="p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-brand-primary/20 cursor-pointer transition-all">
//                      <div className="flex justify-between mb-1">
//                         <span className="text-[9px] font-black text-brand-primary uppercase">Customer</span>
//                         <span className="text-[9px] font-bold text-neutral-gray">Just now</span>
//                      </div>
//                      <p className="text-xs font-bold text-accent-navy line-clamp-2 italic">Connect with customers to increase conversion rates.</p>
//                   </div>
//                   <Link href="/account/vendor/messages" className="block text-center py-3 bg-accent-navy text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary hover:text-accent-navy transition-all">
//                     Go to Inbox
//                   </Link>
//                 </div>
//             </div>

//             <div className="space-y-3">
//               <TipCard text="Price items competitively for better visibility." />
//               <TipCard text="Keep your response time under 2 hours." />
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function OnboardingStep({ label, done, href }: { label: string; done?: boolean; href: string }) {
//   return (
//     <Link href={done ? "#" : href} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${done ? 'bg-green-50 border-green-100 opacity-60' : 'bg-white border-gray-100 hover:border-brand-primary hover:shadow-md group'}`}>
//       <div className="flex items-center gap-3">
//         {done ? <CheckCircle2 className="text-green-600" size={18} /> : <Circle className="text-gray-300 group-hover:text-brand-primary" size={18} />}
//         <span className={`text-[10px] font-black uppercase ${done ? 'text-green-700' : 'text-accent-navy'}`}>{label}</span>
//       </div>
//       {!done && <ArrowUpRight className="text-gray-300 group-hover:text-brand-primary" size={14} />}
//     </Link>
//   );
// }

// function TipCard({ text }: { text: string }) {
//   return (
//     <div className="p-4 bg-brand-primary/5 rounded-2xl border border-brand-primary/10 flex items-start gap-3">
//       <CheckCircle2 className="text-brand-primary shrink-0" size={14} />
//       <p className="text-[9px] font-black text-accent-navy uppercase leading-relaxed">{text}</p>
//     </div>
//   );
// }




import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth"; 
import DashboardHeader from "@/app/_components/DashboardHeader";
import { 
  Store, Rocket, ShieldCheck, AlertCircle, 
  CheckCircle2, Circle, TrendingUp, ArrowUpRight,
  ShoppingBag, Package, MessageSquare, Plus, ShieldAlert, RefreshCcw
} from "lucide-react";
import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";
import { formatNaira } from "@/app/lib/FormatNaira";
import { startOfDay, startOfMonth } from "date-fns";
import BusinessToggleAction from "./_components/BusinessToggleActions"; 
import SessionUpdater from "./_components/SessionUpdater";

export default async function VendorDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== "VENDOR" && session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
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

  if (!vendorData) redirect("/onboarding/apply");
  const vId = vendorData.id;

  // 1. SELF-HEALING INITIALIZATION (Ensures records exist)
  if (!vendorData.onboarding) {
    vendorData.onboarding = await prisma.vendorOnboarding.upsert({
      where: { vendorProfileId: vId },
      update: {},
      create: { vendorProfileId: vId, profileDone: true }
    });
  }

  // ... (Keep existing Store, Score, Boost initializations)
  if (!vendorData.store) {
    vendorData.store = await prisma.vendorStore.upsert({
      where: { vendorProfileId: vId },
      update: {},
      create: { 
        vendorProfileId: vId, 
        name: vendorData.storeName, 
        slug: `${vendorData.storeName.toLowerCase().replace(/\s+/g, '-')}-${vId.slice(-4)}`,
        logo: vendorData.logoUrl,
        banner: vendorData.coverUrl
      }
    });
  }

  const isVerified = vendorData.isVerified;
  const onboarding = vendorData.onboarding;
  const hasSubmitted = onboarding?.completed;

  // FETCH STATS
  const today = startOfDay(new Date());
  const monthStart = startOfMonth(new Date());

  const [liveProductsCount, newOrdersCount, todayRevenue, monthRevenue] = await Promise.all([
    prisma.product.count({ where: { vendorProfileId: vId, isPublished: true } }),
    prisma.order.count({ where: { vendorProfileId: vId, status: "pending" } }),
    prisma.order.aggregate({
      where: { vendorProfileId: vId, status: "approved", createdAt: { gte: today } },
      _sum: { total: true }
    }),
    prisma.order.aggregate({
      where: { vendorProfileId: vId, status: "approved", createdAt: { gte: monthStart } },
      _sum: { total: true }
    })
  ]);

  const mappedProducts = vendorData.products.map(p => ({
    ...p,
    imageUrl: p.images[0]?.url || '/logo.png'
  }));

  const stats = [
    { label: "Live Products", value: liveProductsCount, icon: <Package size={20}/>, color: "bg-blue-50 text-blue-600" },
    { label: "New Orders", value: newOrdersCount, icon: <ShoppingBag size={20}/>, color: "bg-red-50 text-red-600" },
    { label: "Trust Badge", value: vendorData.score?.tier || "BRONZE", icon: <ShieldCheck size={20}/>, color: "bg-purple-50 text-purple-600" },
    { label: "Boost Credits", value: vendorData.boost?.credits ?? 0, icon: <Rocket size={20}/>, color: "bg-orange-50 text-orange-600" },
  ];

  // LOGIC: Show steps if any step is false
  const showOnboardingSteps = !onboarding || 
  onboarding.profileDone === false || 
  onboarding.storeDone === false || 
  onboarding.productDone === false;

// DEBUG LOG (Check your VS Code Terminal)
console.log("ONBOARDING DATA:", {
  exists: !!onboarding,
  profile: onboarding?.profileDone,
  store: onboarding?.storeDone,
  product: onboarding?.productDone,
  willShow: showOnboardingSteps
});
  return (
    <div className="flex flex-col min-h-screen bg-[#FBFBFB]">
      <SessionUpdater /> 
      <DashboardHeader title="Merchant Command" showLogout={true} />

      <div className="p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-black text-accent-navy uppercase tracking-tighter italic">
                    Merchant Command<span className="text-brand-primary">.</span>
                </h1>
                <p className="text-[10px] font-black text-neutral-gray uppercase tracking-widest mt-1">
                    Store ID: {vId.slice(-8).toUpperCase()}
                </p>
            </div>
            <BusinessToggleAction />
        </div>

        {/* 2. PENDING REVIEW STATUS (Rendered as a Notification Bar instead of a full page) */}
        {!isVerified && hasSubmitted && (
          <div className="bg-blue-600 rounded-[2rem] p-6 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg shadow-blue-200">
            <div className="flex items-center gap-4">
              <RefreshCcw className="animate-spin-slow" size={24} />
              <div>
                <p className="font-black uppercase text-sm tracking-tight">Review in Progress</p>
                <p className="text-[10px] font-bold opacity-80 uppercase">Your application is being verified. Most features will activate once approved.</p>
              </div>
            </div>
            <Link href="/" className="px-6 py-2 bg-white text-blue-600 rounded-xl text-[10px] font-black uppercase shadow-sm">Marketplace</Link>
          </div>
        )}

        {/* 3. REJECTION STATUS */}
        {!isVerified && !hasSubmitted && (
          <div className="bg-red-600 rounded-[2rem] p-6 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg shadow-red-200">
            <div className="flex items-center gap-4">
              <AlertCircle size={24} />
              <div>
                <p className="font-black uppercase text-sm tracking-tight">Application Declined</p>
                <p className="text-[10px] font-bold opacity-80 uppercase">{vendorData.rejectionReason || "Please review your details and re-apply."}</p>
              </div>
            </div>
            <Link href="/auth/register/vendor-registration" className="px-6 py-2 bg-white text-red-600 rounded-xl text-[10px] font-black uppercase shadow-sm">Re-Apply</Link>
          </div>
        )}

        {/* STATS GRID */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${stat.color}`}>
                {stat.icon}
              </div>
              <p className="text-[10px] font-black text-neutral-gray uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-xl font-black text-accent-navy mt-1">{stat.value}</h3>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* MAIN CONTENT */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-4xl border border-gray-100 shadow-sm flex flex-col h-[400px]">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black text-accent-navy uppercase tracking-tight">Sales Overview</h3>
                <TrendingUp className="text-brand-primary" />
              </div>
              <div className="flex-1 flex flex-col justify-center items-center py-12 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100 mb-6 text-neutral-gray font-bold text-[10px] uppercase">
                Revenue Data Pending
              </div>
              <div className="grid grid-cols-2 border-t border-gray-50 pt-6">
                <div>
                  <p className="text-[10px] font-black text-neutral-gray uppercase">Today</p>
                  <p className="text-lg font-black text-accent-navy">{formatNaira(Number(todayRevenue._sum.total || 0))}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-neutral-gray uppercase">Month</p>
                  <p className="text-lg font-black text-brand-primary italic">{formatNaira(Number(monthRevenue._sum.total || 0))}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-4xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                   <h3 className="text-xl font-black text-accent-navy uppercase tracking-tight">Inventory Performance</h3>
                   <Link href="/account/vendor/products" className="text-[10px] font-black text-brand-primary uppercase underline italic">Manage All</Link>
                </div>
                <div className="space-y-4">
                  {mappedProducts.length > 0 ? mappedProducts.map(product => (
                    <div key={product.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl group border border-transparent hover:border-brand-primary/20 transition-all">
                      <div className="w-14 h-14 rounded-xl bg-white overflow-hidden border border-gray-100 shrink-0">
                        <img src={product.imageUrl} className="w-full h-full object-contain p-1" alt={product.title}/>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-black text-accent-navy uppercase truncate italic">{product.title}</p>
                        <p className="text-[9px] font-bold text-neutral-gray uppercase mt-1 italic tracking-tighter">{product.salesCount || 0} Units Sold</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-brand-primary text-md">{formatNaira(Number(product.price))}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="py-12 text-center text-neutral-gray text-[10px] font-black uppercase border-2 border-dashed border-gray-100 rounded-3xl italic">Awaiting first product upload</div>
                  )}
                </div>
            </div>
          </div>

          {/* SIDEBAR */}
          
          <div className="space-y-8" key={vId}> 
          {/* ONBOARDING SECTION */}
          {(!vendorData.onboarding || !vendorData.onboarding.productDone || !vendorData.onboarding.storeDone) ? (
            <div className="bg-white border-2 border-brand-primary/20 p-6 rounded-4xl shadow-sm animate-in fade-in zoom-in duration-500">
              <h3 className="text-md font-black text-accent-navy uppercase mb-4 flex items-center gap-2">
                <AlertCircle size={18} className="text-brand-primary" /> Setup Progress
              </h3>
              <div className="space-y-3">
                <OnboardingStep 
                  label="Identity Verified" 
                  done={vendorData.onboarding?.profileDone ?? true} 
                  href="/auth/register/vendor-registration" 
                />
                <OnboardingStep 
                  label="Store Identity" 
                  done={vendorData.onboarding?.storeDone ?? false} 
                  href="/account/vendor/settings/store-setup" 
                />
                <OnboardingStep 
                  label="First Product" 
                  done={vendorData.onboarding?.productDone ?? false} 
                  href="/account/vendor/products/new" 
                />
              </div>
            </div>
          ) : null}
            <div className="bg-white p-6 rounded-4xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                   <h3 className="text-lg font-black text-accent-navy uppercase">Inbox</h3>
                   <MessageSquare className="text-brand-primary" size={20} />
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-brand-primary/20 cursor-pointer transition-all">
                     <p className="text-xs font-bold text-accent-navy italic">Maintain high response rates to earn more trust badges.</p>
                  </div>
                  <Link href="/account/vendor/messages" className="block text-center py-3 bg-accent-navy text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary transition-all shadow-md">
                    Open Inbox
                  </Link>
                </div>
            </div>

            <div className="space-y-3">
              <TipCard text="Verified stores appear higher in search results." />
              <TipCard text="Upload at least 5 products to increase traffic." />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ... (Maintain existing OnboardingStep and TipCard functions)
function OnboardingStep({ label, done, href }: { label: string; done?: boolean; href: string }) {
  return (
    <Link href={done ? "#" : href} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${done ? 'bg-green-50 border-green-100 opacity-60' : 'bg-white border-gray-100 hover:border-brand-primary hover:shadow-md group'}`}>
      <div className="flex items-center gap-3">
        {done ? <CheckCircle2 className="text-green-600" size={18} /> : <Circle className="text-gray-300 group-hover:text-brand-primary" size={18} />}
        <span className={`text-[10px] font-black uppercase ${done ? 'text-green-700' : 'text-accent-navy'}`}>{label}</span>
      </div>
      {!done && <ArrowUpRight className="text-gray-300 group-hover:text-brand-primary" size={14} />}
    </Link>
  );
}

function TipCard({ text }: { text: string }) {
  return (
    <div className="p-4 bg-brand-primary/5 rounded-2xl border border-brand-primary/10 flex items-start gap-3">
      <CheckCircle2 className="text-brand-primary shrink-0" size={14} />
      <p className="text-[9px] font-black text-accent-navy uppercase leading-relaxed tracking-tight italic">{text}</p>
    </div>
  );
}
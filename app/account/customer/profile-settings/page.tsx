



// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/lib/auth";
// import { User, Mail, ShieldCheck, BadgeCheck, Lock } from "lucide-react";
// import DashboardHeader from "@/app/_components/DashboardHeader";

// export default async function CustomerProfilePage() {
//   const session = await getServerSession(authOptions);

//   return (
//     <div className="flex flex-col min-h-screen">
//       {/*Central Header with Logout Integrated */}
//       <DashboardHeader 
//         title="My Profile" 
//         showLogout={true} 
//       />

//       <div className="p-4 md:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-700">
//         {/* Profile Card Container */}
//         <div className="bg-neutral-white rounded-4xl border border-gray-100 shadow-sm overflow-hidden">
          
//           {/* Brand Header/Cover Area */}
//           <div className="bg-accent-navy p-8 h-32 relative">
//              <div className="absolute -bottom-12 left-8 w-24 h-24 bg-brand-primary rounded-3xl border-4 border-neutral-white flex items-center justify-center shadow-lg shadow-accent-navy/10">
//                 <span className="text-accent-navy text-3xl font-black">
//                   {session?.user?.name?.charAt(0)}
//                 </span>
//              </div>
             
//              {/* Verification Badge */}
//              <div className="absolute bottom-4 right-8 hidden sm:flex items-center gap-2 bg-neutral-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-neutral-white/20">
//                 <BadgeCheck className="text-brand-primary" size={16} />
//                 <span className="text-neutral-white text-[10px] font-black uppercase tracking-widest">Verified Customer</span>
//              </div>
//           </div>
          
//           {/* Profile Details Area */}
//           <div className="pt-16 p-8 space-y-8">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
//               {/* Name Field */}
//               <div className="space-y-3">
//                 <label className="text-[10px] font-black text-neutral-gray uppercase tracking-[0.2em] flex items-center gap-2">
//                   <User size={14} className="text-brand-primary" /> Full Display Name
//                 </label>
//                 <div className="p-4 bg-neutral-light rounded-2xl border border-transparent font-bold text-accent-navy">
//                   {session?.user?.name}
//                 </div>
//               </div>
              
//               {/* Email Field */}
//               <div className="space-y-3">
//                 <label className="text-[10px] font-black text-neutral-gray uppercase tracking-[0.2em] flex items-center gap-2">
//                   <Mail size={14} className="text-brand-primary" /> Registered Email
//                 </label>
//                 <div className="p-4 bg-neutral-light rounded-2xl border border-transparent font-bold text-accent-navy">
//                   {session?.user?.email}
//                 </div>
//               </div>

//             </div>

//             {/* Action Buttons */}
//             <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row gap-4">
//                <button className="flex-1 sm:flex-none px-8 py-4 bg-brand-primary text-accent-navy rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-accent-navy hover:text-neutral-white transition-all shadow-lg shadow-brand-primary/20">
//                   Edit Profile Information
//                </button>
//                <button className="flex-1 sm:flex-none px-8 py-4 bg-neutral-light text-accent-navy rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-neutral-gray/10 transition-all flex items-center justify-center gap-2">
//                   <Lock size={14} /> Change Password
//                </button>
//             </div>
//           </div>
//         </div>

//         {/* Security Notice Section */}
//         <div className="bg-brand-light/30 border border-brand-primary/10 rounded-3xl p-6 flex items-start gap-4">
//           <div className="p-2 bg-brand-primary/20 rounded-lg">
//             <ShieldCheck className="text-brand-primary" size={20} />
//           </div>
//           <div>
//             <h4 className="text-accent-navy font-black text-sm uppercase tracking-tight">Data Privacy</h4>
//             <p className="text-neutral-gray text-xs font-medium leading-relaxed mt-1">
//               Your personal information is encrypted and stored securely. MarvelMarts never shares your private data with third-party vendors without your explicit consent.
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }





import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { User, Mail, ShieldCheck, BadgeCheck, Lock, Store } from "lucide-react";
import DashboardHeader from "@/app/_components/DashboardHeader";
import Link from "next/link";
import BusinessToggleAction from "@/app/account/vendor/_components/BusinessToggleActions";

export default async function CustomerProfilePage() {
  const session = await getServerSession(authOptions);

  // Logic: Check if the user is a fully approved vendor
  const isActualVendor = session?.user?.role === "VENDOR" && session?.user?.vendorStatus === "APPROVED";

  return (
    <div className="flex flex-col min-h-screen bg-[#FBFBFB]">
      {/* Central Header with Logout Integrated */}
      <DashboardHeader 
        title="My Profile" 
        showLogout={true} 
      />

      <div className="p-4 md:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-700">
        
        {/* Strategic Position for Vendor Switch/Register */}
        <div className="flex justify-end">
          {isActualVendor ? (
            <BusinessToggleAction />
          ) : (
            <Link 
              href="/auth/register/vendor-registration"
              className="flex items-center gap-3 bg-brand-primary hover:bg-accent-navy text-accent-navy hover:text-white px-6 py-4 rounded-2xl font-black transition-all shadow-lg hover:scale-[1.02] active:scale-95 uppercase text-[10px] tracking-widest"
            >
              <Store size={18} />
              Register Vendor Account
            </Link>
          )}
        </div>

        {/* Profile Card Container */}
        <div className="bg-white rounded-4xl border border-gray-100 shadow-sm overflow-hidden">
          
          {/* Brand Header/Cover Area */}
          <div className="bg-accent-navy p-8 h-32 relative">
             <div className="absolute -bottom-12 left-8 w-24 h-24 bg-brand-primary rounded-3xl border-4 border-white flex items-center justify-center shadow-lg shadow-accent-navy/10">
                <span className="text-accent-navy text-3xl font-black">
                  {session?.user?.name?.charAt(0)}
                </span>
             </div>
             
             {/* Verification Badge */}
             <div className="absolute bottom-4 right-8 hidden sm:flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                <BadgeCheck className="text-brand-primary" size={16} />
                <span className="text-white text-[10px] font-black uppercase tracking-widest">Verified Customer</span>
             </div>
          </div>
          
          {/* Profile Details Area */}
          <div className="pt-16 p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Name Field */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-neutral-gray uppercase tracking-[0.2em] flex items-center gap-2">
                  <User size={14} className="text-brand-primary" /> Full Display Name
                </label>
                <div className="p-4 bg-gray-50 rounded-2xl border border-transparent font-bold text-accent-navy uppercase text-xs">
                  {session?.user?.name}
                </div>
              </div>
              
              {/* Email Field */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-neutral-gray uppercase tracking-[0.2em] flex items-center gap-2">
                  <Mail size={14} className="text-brand-primary" /> Registered Email
                </label>
                <div className="p-4 bg-gray-50 rounded-2xl border border-transparent font-bold text-accent-navy text-xs">
                  {session?.user?.email}
                </div>
              </div>

            </div>

            {/* Action Buttons */}
            <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row gap-4">
               <button className="flex-1 sm:flex-none px-8 py-4 bg-brand-primary text-accent-navy rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-accent-navy hover:text-white transition-all shadow-lg shadow-brand-primary/20">
                 Edit Profile Information
               </button>
               <button className="flex-1 sm:flex-none px-8 py-4 bg-gray-50 text-accent-navy rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center justify-center gap-2">
                  <Lock size={14} /> Change Password
               </button>
            </div>
          </div>
        </div>

        {/* Security Notice Section */}
        <div className="bg-brand-primary/5 border border-brand-primary/10 rounded-3xl p-6 flex items-start gap-4">
          <div className="p-2 bg-brand-primary/20 rounded-xl">
            <ShieldCheck className="text-brand-primary" size={20} />
          </div>
          <div>
            <h4 className="text-accent-navy font-black text-sm uppercase tracking-tight">Data Privacy</h4>
            <p className="text-neutral-gray text-[11px] font-bold leading-relaxed mt-1 uppercase opacity-80 italic">
              Your personal information is encrypted and stored securely. MarvelMarts never shares your private data with third-party vendors without your explicit consent.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
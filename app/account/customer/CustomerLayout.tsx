

// "use client";

// import MobileTopbar from "@/app/_components/MobileTopbar";
// import DashboardSidebar from "@/app/_components/DashboardSidebar";
// import DashboardHeader from "@/app/_components/DashboardHeader";
// import SignOutButton from "@/app/_components/SignOutButton";
// import { customerSections } from "@/types/dashboardSections";

// export default function CustomerLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <div className="min-h-screen flex flex-col lg:flex-row bg-neutral-light">
      
//       {/* Sidebar - Mobile */}
//       <div className="lg:hidden">
//         <MobileTopbar role="Customer" sections={customerSections} />
//       </div>

//       {/* Sidebar - Desktop */}
//       <div className="hidden lg:block border-r border-gray-200 bg-neutral-white w-64 fixed h-full z-40">
//         <DashboardSidebar sections={customerSections} />
//       </div>

//       {/* Main Content Area */}
//       <div className="flex-1 flex flex-col lg:ml-64 relative">
        
//         {/* Unified Header */}
//         <header className="w-full px-6 py-4 bg-neutral-white border-b border-gray-100 flex justify-between items-center sticky top-0 z-50 shadow-sm">
//           <div>
//             <h2 className="text-accent-navy font-black uppercase tracking-tight text-sm md:text-lg">
//               Customer <span className="text-brand-primary">Portal</span>
//             </h2>
//           </div>

//           {/* Wrapper to ensure the button is visible */}
//           <div className="flex items-center">
//             <SignOutButton
//               label="Logout"
//               className="flex items-center gap-2 px-5 py-2.5 bg-accent-navy text-neutral-white rounded-xl font-bold hover:bg-neutral-dark transition-all text-xs md:text-sm shadow-lg border-none cursor-pointer"
//             />
//           </div>
//         </header>

//         {/* Page Content */}
//         <main className="flex-1 p-4 md:p-8 z-10">
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// }



"use client";

import MobileTopbar from "@/app/_components/MobileTopbar";
import DashboardSidebar from "@/app/_components/DashboardSidebar";
import { customerSections } from "@/types/dashboardSections";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-neutral-light">
      
      {/* MOBILE NAVIGATION: Only visible on small screens */}
      <div className="lg:hidden sticky top-0 z-50">
        <MobileTopbar role="Customer" sections={customerSections} />
      </div>

      {/* DESKTOP SIDEBAR: Fixed position, hidden on mobile */}
      <aside className="hidden lg:block border-r border-gray-200 bg-neutral-white w-64 fixed h-full z-40">
        <DashboardSidebar sections={customerSections} />
      </aside>

      {/* MAIN CONTENT AREA */}
      {/* We push the content left by 64 units on desktop to account for the fixed sidebar */}
      <div className="flex-1 flex flex-col lg:ml-64 min-w-0 relative">
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
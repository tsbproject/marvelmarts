

// "use client";

// import { useState } from "react";
// import Link from "next/link";
// import { User, Store } from "lucide-react";
// import Logo from "./Logo";
// import NavigationRight from "./NavigationRight";
// import UserMenu from "@/app/_components/UserMenu";
// import SearchBar from "@/app/_components/SearchBar";
// import HamburgerMenu from "@/app/_components/HamburgerMenu";
// import CartDrawer from "./CartDrawer";
// import HelpMenu from "./HelpMenu"; 
// import CategoryMenu from "./CategoryMenu"; 
// import { CategoryWithChildren as CategoryTree } from "../layout"; 

// interface HeaderProps {
//   initialCategories: CategoryTree[]; 
// }

// export default function Header({ initialCategories = [] }: HeaderProps) {
//   const [userMenuOpen, setUserMenuOpen] = useState(false);

//   return (
//     <header className="bg-accent-navy h-36 xs:h-40 lg:h-56 shadow p-4 relative z-[1001] transition-all">
      
//       {/* --- MOBILE LAYOUT (Applied for xxs, xs, sm, md up to 899px) --- */}
//       <div className="lg:hidden flex flex-col justify-between w-full h-full">
//         {/* Top Row: Hamburger, Logo, and Actions */}
//         <div className="flex items-center justify-between w-full">
//           {/* Grouping Hamburger and Logo to the left */}
//           <div className="flex items-center gap-2 xs:gap-4 min-w-0">
//             <div className="flex-shrink-0">
//               <HamburgerMenu categories={initialCategories} />
//             </div>
//             {/* min-w-0 is critical for Firefox to handle the logo scaling on xxs screens */}
//             <div className="min-w-0 flex-shrink">
//               <Logo />
//             </div>
//           </div>

//           {/* Action Icons to the right */}
//           <div className="flex items-center gap-3 xs:gap-5 flex-shrink-0">
//             <HelpMenu />
//             <CartDrawer />
//           </div>
//         </div>

//         {/* Bottom Row: Mobile Search Bar */}
//         <div className="w-full pb-1 xxs:mt-4">
//           <SearchBar />
//         </div>
//       </div>

//       {/* --- DESKTOP LAYOUT (900px and above) --- */}
      
//       {/* Logo - Desktop */}
//       <div className="hidden lg:block absolute lg:left-20 lg:top-2 xl:left-8 xl:top-10 2xl:left-8 2xl:top-8">
//         <Logo />
//       </div>

//       {/* Search Bar - Desktop */}
//       <div className="absolute top-15 left-30 hidden lg:block xl:top-25 xl:left-57 2xl:top-20 2xl:left-50">
//         <SearchBar />
//       </div>

//       {/* Category Menu - Desktop */}
//       <div className="absolute bottom-0 left-0 w-full hidden lg:block">
//         <CategoryMenu initialCategories={initialCategories} />
//       </div>

//       {/* Desktop Navigation Area */}
//       <div className="absolute right-8 -top-1 2xl:-top-15 2xl:right-11 xl:-top-11 hidden lg:flex items-center gap-6 z-20">
//         <NavigationRight />
//       </div>

//       {/* Account Menu - Desktop */}
//       <div className="absolute right-60 top-24 2xl:top-13 xl:top-16 hidden lg:flex items-center">
//         <UserMenu open={userMenuOpen} onClose={() => setUserMenuOpen(false)} />
//         <button
//           className="flex items-center gap-2 text-lg font-semibold text-gray-800"
//           onClick={() => setUserMenuOpen(true)}
//         >
//           <User className="w-8 h-8 2xl:w-5 2xl:h-5 rounded-full text-brand-primary" />
//           <span className="text-white text-base 2xl:text-[13px] mt-1">Account</span>
//         </button>
//       </div>
      
//       {/* Vendor Registration Button - Desktop */}
//       <Link href="/auth/register/vendor-registration">
//         <button className="absolute 2xl:top-22 2xl:left-[65rem] xl:top-35 xl:left-[50rem] hidden lg:flex items-center gap-2 
//           bg-white/80 backdrop-blur-md border border-gray-100 shadow-sm
//           hover:shadow-md hover:border-brand-primary hover:bg-brand-primary hover:text-white
//           text-accent-navy text-[10px] font-black uppercase tracking-widest 
//           rounded-full py-2.5 px-6 transition-all duration-300 active:scale-95 group">
//           <Store size={14} className="text-brand-primary group-hover:text-white transition-colors" />
//           <span>Register Merchant Account</span>
//         </button>
//       </Link>
//     </header>
//   );
// }




"use client";

import { useState } from "react";
import Link from "next/link";
import { User, Store } from "lucide-react";
import Logo from "./Logo";
import NavigationRight from "./NavigationRight";
import UserMenu from "@/app/_components/UserMenu";
import SearchBar from "@/app/_components/SearchBar";
import HamburgerMenu from "@/app/_components/HamburgerMenu";
import CartDrawer from "./CartDrawer";
import HelpMenu from "./HelpMenu"; 
import CategoryMenu from "./CategoryMenu"; 
import { CategoryWithChildren as CategoryTree } from "../layout"; 

interface HeaderProps {
  initialCategories: CategoryTree[]; 
}

export default function Header({ initialCategories = [] }: HeaderProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    /* Height stays mobile-friendly until xl (1100px based on your breakpoints). 
       Using xl:overflow-visible allows desktop elements to hang outside if needed.
    */
    <header className="bg-accent-navy h-40 xs:h-44 xl:h-56 shadow p-4 relative z-[1001] transition-all overflow-hidden xl:overflow-visible">
      
      {/* --- MOBILE & TABLET LAYOUT (Active until 1099px) --- */}
      <div className="xl:hidden flex flex-col justify-between w-full h-full pb-2">
        {/* Top Row */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 xs:gap-4 min-w-0">
            <div className="flex-shrink-0">
              {/* Hamburger now stays active through your 900px and 1100px breakpoints */}
              <HamburgerMenu categories={initialCategories} />
            </div>
            <div className="min-w-0 flex-shrink">
              <Logo />
            </div>
          </div>

          <div className="flex items-center  gap-3 xs:gap-5 lg:gap-10 lg:mr-10 flex-shrink-0">
            <HelpMenu />
            <CartDrawer />
          </div>
        </div>

        {/* Bottom Row Search Bar */}
        <div className="w-full xxs:mt-5 xs:mt-7 sm:mt-7">
          <SearchBar />
        </div>
      </div>

      {/* --- DESKTOP LAYOUT (1100px and above) --- */}
      <div className="hidden xl:block">
        {/* Logo */}
        <div className="absolute xl:left-8 xl:top-10 2xl:left-8 2xl:top-8">
          <Logo />
        </div>

        {/* Search Bar */}
        <div className="absolute xl:top-25 xl:left-57 2xl:top-20 2xl:left-43">
          <SearchBar />
        </div>

        {/* Category Menu */}
        <div className="absolute bottom-0 left-0 w-full">
          <CategoryMenu initialCategories={initialCategories} />
        </div>

        {/* Desktop Navigation Area */}
        <div className="absolute right-8  xl:-top-11 2xl:-top-15 2xl:right-11 flex items-center gap-6 z-20">
          <NavigationRight />
        </div>

        {/* Account Menu */}
        <div className="absolute right-60 xl:top-16 2xl:top-13 flex items-center">
          <UserMenu open={userMenuOpen} onClose={() => setUserMenuOpen(false)} />
          <button
            className="flex items-center gap-2 text-lg font-semibold text-gray-800"
            onClick={() => setUserMenuOpen(true)}
          >
            <User className="w-8 h-8 2xl:w-5 2xl:h-5 rounded-full text-brand-primary" />
            <span className="text-white text-base 2xl:text-[13px] mt-1">Account</span>
          </button>
        </div>
        
        {/* Vendor Button */}
        <Link href="/auth/register/vendor-registration">
          <button className="absolute xl:top-35 xl:left-[50rem] 2xl:top-30 2xl:left-[66rem] flex items-center gap-2 
            bg-white/80 backdrop-blur-md border border-gray-100 shadow-sm
            hover:shadow-md hover:border-brand-primary hover:bg-brand-primary hover:text-white
            text-accent-navy text-[10px] font-black uppercase tracking-widest 
            rounded-full py-2.5 px-6  transition-all duration-300 active:scale-95 group">
            <Store size={14} className="text-brand-primary group-hover:text-white transition-colors" />
            <span>Register Merchant Account</span>
          </button>
        </Link>
      </div>
    </header>
  );
}
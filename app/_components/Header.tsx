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
    <header className="bg-accent-navy h-36 md:h-56 2xl:h-50 shadow p-4 relative z-[1001]">
      {/* Logo */}
      <div
        className="
          absolute
          xs:left-10
          sm:left-20 sm:top-7
          md:left-28 md:top-3
          lg:left-20 lg:top-2
          xl:left-20 xl:top-4
          2xl:left-8 2xl:top-8
        "
      >
        <Logo />
      </div>

      {/* Search Bar - Desktop */}
      <div className="absolute 
                      top-15 left-30 hidden lg:block
                      2xl:top-20  2xl:left-50
                      "
                                      
      >
                          
        <SearchBar />
      </div>

      {/* Category Menu - Desktop Topbar */}
      <div className="absolute bottom-0 left-0 w-full hidden lg:block">
        <CategoryMenu initialCategories={initialCategories} />
      </div>

      {/* Mobile Hamburger */}
      <div
        className="
          absolute -top-1   md:hidden
          xxs:top-12
          xs:top-12
          sm:right-100 sm:top-15
          md:left-2
          lg:right-20 lg:top-4
        "
      >
        <HamburgerMenu categories={initialCategories} />
      </div>

      {/* HelpMenu - Mobile */}
      <div
        className="
          absolute visible lg:invisible
          xxs:left-60 xxs:top-20
          xs:left-72 xs:top-20
          sm:left-85 sm:top-20
          md:left-110 md:top-25
          lg:left-72 lg:top-5
          xl:left-72 xl:top-0
        "
      >
        <HelpMenu />
      </div>

      {/* CartDrawer - Mobile */}
      <div
        className="
          absolute visible lg:invisible
          xxs:left-72 xxs:top-20
          xs:left-87 xs:top-20
          sm:left-107 sm:top-20
          md:left-130 md:top-25
          lg:left-80 lg:top-5
          
        "
      >
        <CartDrawer />
      </div>

      {/* RIGHT CORNER AREA FOR ALL ICONS */}
      <div className="absolute right-8 -top-1 2xl:-top-15 2xl:right-11 flex items-center gap-6 z-20 invisible lg:visible">
        <NavigationRight />
      </div>

      <div className="absolute right-60 top-24 2xl:top-13 flex items-center invisible lg:visible">
        <UserMenu open={userMenuOpen} onClose={() => setUserMenuOpen(false)} />
        <button
          className="flex items-center gap-2 text-lg font-semibold text-gray-800"
          onClick={() => setUserMenuOpen(true)}
        >
          <User className="w-8 h-8 2xl:w-5 2xl:h-5  rounded-full  text-brand-primary" />
          <span className="text-white text-base 2xl:text-[13px] mt-1">Account</span>
        </button>
      </div>
      <Link href="/auth/register/vendor-registration">
  <button className="absolute 2xl:top-22 2xl:left-[65rem] hidden lg:flex items-center gap-2 
    bg-white/80 backdrop-blur-md border border-gray-100 shadow-sm
    hover:shadow-md hover:border-brand-primary hover:bg-brand-primary hover:text-white
    text-accent-navy text-[10px] font-black uppercase tracking-widest 
    rounded-full py-2.5 px-6 transition-all duration-300 active:scale-95 group">
    
    <Store size={14} className="text-brand-primary group-hover:text-white transition-colors" />
    <span>Register Merchant Account</span>
  </button>
</Link>
    </header>
  );
}

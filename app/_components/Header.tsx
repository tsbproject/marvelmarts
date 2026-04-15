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
    
    <header className="bg-accent-navy h-40 xs:h-44 xl:h-56 shadow p-4 relative  transition-all  xl:overflow-visible z-[1001]">
      
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

          <div className="flex items-center  gap-3 xs:gap-5 lg:gap-10 lg:mr-10 flex-shrink-0 z-[2001]">
            <HelpMenu />
            <CartDrawer />
          </div>
        </div>

        {/* Bottom Row Search Bar */}
        <div className="w-full xxs:mt-5 xs:mt-7 sm:mt-7 z-1001">
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
            <span>Sell On MarvelMarts</span>
          </button>
        </Link>
      </div>
    </header>
  );
}
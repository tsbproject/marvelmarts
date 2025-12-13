



import Logo from './Logo'
import NavigationRight from "./NavigationRight";
import NavigationLeftMobile from './NavigationLeftMobile';
import UserMenu from "@/app/_components/UserMenu";
import SearchBar from '@/app/_components/SearchBar';

export default function Header() {
  return (
    <header className="bg-accent-navy h-35 md:h-40 shadow p-4 md:p-4 relative overflow-x-hidden overflow-y-hidden">

      {/* Logo */}
      <Logo />

      {/* Search Bar - Desktop */}
      <div className='hidden lg:block'>
        <SearchBar />
      </div>

      {/* Mobile Hamburger */}
      <div className="absolute left-100 top-8 lg:hidden">
        <NavigationLeftMobile />
      </div>

      {/* 👇 RIGHT CORNER AREA FOR ALL ICONS */}
      <div className="absolute right-40 top-4 flex items-center gap-6 z-40">
  <NavigationRight />

</div>


<div className="absolute right-20 top-25 flex items-center gap-6 z-40">
 <UserMenu />
</div>


    </header>
  );
}


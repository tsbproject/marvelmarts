



import Logo from './Logo'
import NavigationRight from "./NavigationRight";
import NavigationLeftMobile from './NavigationLeftMobile';
import UserMenu from "@/app/_components/UserMenu";
import SearchBar from '@/app/_components/SearchBar';
import HamburgerMenu from '@/app/_components/HamburgerMenu';

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
<div
  className="
    absolute -top-6 visible lg:invisible
    [@media(min-width:300px)]:right-[30px]
    [@media(min-width:300px)]:top-12
    [@media(min-width:400px)]:right-[30px]
    [@media(min-width:400px)]:mb-60
    [@media(min-width:500px)]:ml-[130px]
    [@media(max-width:600px)]:-right-[230px]
    [@media(min-width:900px)]:right-[85px]
    [@media(min-width:900px)]:mt-25
  "
>
  <HamburgerMenu />
</div>




      {/* 👇 RIGHT CORNER AREA FOR ALL ICONS */}
      <div className="absolute right-60 top-0 flex items-center gap-6 z-40 invisible lg:visible">
  <NavigationRight />

</div>


<div className="absolute right-40 top-22 flex items-center gap-6 z-40 invisible lg:visible">
 <UserMenu />
</div>


    </header>
  );
}


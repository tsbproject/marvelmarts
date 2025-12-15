import Logo from './Logo'
import NavigationRight from "./NavigationRight";
import NavigationLeftMobile from './NavigationLeftMobile';
import UserMenu from "@/app/_components/UserMenu";
import SearchBar from '@/app/_components/SearchBar';
import HamburgerMenu from '@/app/_components/HamburgerMenu';
import CartDrawer from './CartDrawer';

export default function Header() {
  return (
    <header className="bg-accent-navy h-35 md:h-40 shadow p-4 md:p-4 relative overflow-x-hidden overflow-y-hidden">

     

  {/* Logo */}
<div
  className="
    absolute
    [@media(min-width:300px)]:left-30 [@media(min-width:300px)]:top-13
    [@media(min-width:400px)]:left-30 [@media(min-width:400px)]:top-15
    [@media(min-width:500px)]:left-[90px] [@media(min-width:500px)]:top-12
    [@media(min-width:600px)]:left-[110px] [@media(min-width:600px)]:top-13
    [@media(min-width:900px)]:left-[85px]  [@media(min-width:900px)]:top-8
    [@media(min-width:1100px)]:left-[85px] [@media(min-width:1100px)]:top-16
    [@media(min-width:1200px)]:left-[100px] [@media(min-width:1200px)]:top-20
  "
>
  <Logo />
</div>
     

      {/* Search Bar - Desktop */}
      <div className='hidden lg:block'>
        <SearchBar />
      </div>

     {/* Mobile Hamburger */}
<div
  className="
    absolute -top-6 visible lg:invisible
    [@media(min-width:300px)]:right-[250px]
    [@media(min-width:300px)]:top-12
    [@media(min-width:350px)]:right-[300px]
    [@media(min-width:400px)]:right-[360px]
    [@media(min-width:400px)]:mb-60
    [@media(min-width:500px)]:left-10
    [@media(max-width:600px)]:-right-[230px]
    [@media(min-width:900px)]:right-[85px]
    [@media(min-width:900px)]:top-15
  "
>
  <HamburgerMenu />
</div>

{/*CartDrawer*/}
<div className='
absolute visible lg:invisible
    [@media(min-width:300px)]:left-100 [@media(min-width:300px)]:top-17
    [@media(min-width:350px)]:left-120 [@media(min-width:350px)]:top-21
    [@media(min-width:400px)]:left-100 [@media(min-width:400px)]:top-21
    [@media(min-width:500px)]:left-180 [@media(min-width:500px)]:top-20
    [@media(min-width:600px)]:left-220 [@media(min-width:600px)]:top-20
    [@media(min-width:900px)]:left-320  [@media(min-width:900px)]:top-21
'>
  <CartDrawer />
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


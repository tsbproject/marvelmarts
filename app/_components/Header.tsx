// import Logo from './Logo'
// import NavigationRight from "./NavigationRight";
// import NavigationLeftMobile from './NavigationLeftMobile';
// import UserMenu from "@/app/_components/UserMenu";
// import SearchBar from '@/app/_components/SearchBar';
// // import CategorySidebar from './_components/CategorySidebar';


// export default function Header() {
//   return (
//     <header className="bg-(--color-accent-navy) h-30 md:h-40 shadow  p-4 md:p-4  overflow-x-hidden overflow-y-hidden ">
//        <Logo />

        
      
//       <div className='hidden lg:block'>
//        <SearchBar /> 
//        </div> 
       
      
       
    
     
       
//        {/* 👇 Mobile Hambugger Area */}
//     <div className="relative -top-35 left-4 lg:hidden">
//      <NavigationLeftMobile  />     
//     </div>

//     {/* 👇 Right-side icons area */}
//     <div className="hidden lg:block  ">
//       <NavigationRight  />
//     </div>

//     <div className='hidden lg:block '>
//       <UserMenu />  {/* The collapsible right-side menu component */}

//     </div>

    
      
//     </header>
//   )
// }




import Logo from './Logo'
import NavigationRight from "./NavigationRight";
import NavigationLeftMobile from './NavigationLeftMobile';
import UserMenu from "@/app/_components/UserMenu";
import SearchBar from '@/app/_components/SearchBar';

export default function Header() {
  return (
    <header className="bg-(--color-accent-navy) h-30 md:h-40 shadow p-4 md:p-4 relative overflow-x-hidden overflow-y-hidden">

      {/* Logo */}
      <Logo />

      {/* Search Bar - Desktop */}
      <div className='hidden lg:block'>
        <SearchBar />
      </div>

      {/* Mobile Hamburger */}
      <div className="absolute left-4 top-8 lg:hidden">
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


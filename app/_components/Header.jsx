import Logo from './Logo'
import NavigationRight from "@/app/_components/NavigationRight";
import NavigationLeftMobile from './NavigationLeftMobile';
import UserMenu from "@/app/_components/UserMenu";
import SearchBar from '@/app/_components/SearchBar';


export default function Header() {
  return (
    <header className="bg-[var(--color-accent-navy)] h-30 shadow p-4  ">
       <Logo />
      
       
    
     
       
       {/* 👇 Left Navigation Area */}
    <div className="w-full flex items-center justify-between">
        <SearchBar />  
       <NavigationRight />
       <NavigationLeftMobile className="md:hidden" />      {/* Mobile */}
    </div>

    {/* 👇 Right-side icons area */}
    <div className="hidden items-center gap-4">
      <UserMenu />  {/* The collapsible right-side menu component */}
    </div>

      
    </header>
  )
}

import Logo from './Logo'
import NavigationRight from "@/app/_components/NavigationRight";
import NavigationLeftMobile from './NavigationLeftMobile';
import UserMenu from "@/app/_components/UserMenu";
import SearchBar from '@/app/_components/SearchBar';


export default function Header() {
  return (
    <header className="bg-[var(--color-accent-navy)] h-30 md:h-40 shadow  p-4 md:p-4  overflow-x-hidden ">
       <Logo />
      
      <div className='invisible md:visible'>
       <SearchBar /> 
       </div> 
       
      
       
    
     
       
       {/* 👇 Mobile Hambugger Area */}
    <div className="relative -top-45 left-4">
     <NavigationLeftMobile className="md:hidden" />      {/* Mobile */}
    </div>

    {/* 👇 Right-side icons area */}
    <div className="invisible md:visible items-center gap-4">
      <NavigationRight  />
    </div>

    <div className='invisible md:visible '>
      <UserMenu />  {/* The collapsible right-side menu component */}

    </div>

      
    </header>
  )
}

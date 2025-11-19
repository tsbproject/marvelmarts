import Logo from './Logo'
import NavigationRight from "../_components/NavigationRight";
import NavigationLeftMobile from './NavigationLeftMobile';
import UserMenu from "../_components/UserMenu";
import SearchBar from '../_components/SearchBar';
// import CategorySidebar from './_components/CategorySidebar';


export default function Header() {
  return (
    <header className="bg-(--color-accent-navy) h-30 md:h-40 shadow  p-4 md:p-4  overflow-x-hidden overflow-y-hidden ">
       <Logo />

        
      
      <div className='hidden lg:block'>
       <SearchBar /> 
       </div> 
       
      
       
    
     
       
       {/* 👇 Mobile Hambugger Area */}
    <div className="relative -top-35 left-4 lg:hidden">
     <NavigationLeftMobile  />     
    </div>

    {/* 👇 Right-side icons area */}
    <div className="hidden lg:block  ">
      <NavigationRight  />
    </div>

    <div className='hidden lg:block '>
      <UserMenu />  {/* The collapsible right-side menu component */}

    </div>

    
      
    </header>
  )
}

import Link from 'next/link'
import Logo from './Logo'
import NavigationLeft from "@/app/_components/NavigationLeft";

export default function Header() {
  return (
    <header className="bg-[var(--color-accent-navy)] h-30 shadow p-4 flex 
    justify-between items-center">
       <Logo />
       <NavigationLeft />
      
    </header>
  )
}

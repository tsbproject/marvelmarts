import HeroCarousel from '@/app/_components/HeroCarousel'
import EcommerceCarousel from './_components/EcommerceCarousel';
import CategorySidebar from '@/app/_components/CategorySidebar';
import FeaturedProducts from '@/app/_components/FeaturedProducts';

export default function HomePage() {
  return (
    <>
    <div className="relative top-o md:-top-5">
       <EcommerceCarousel />
      
      
      
       {/* <HeroCarousel /> */}
    </div>

    <div className='relative top-[42rem]'>
       <FeaturedProducts />
    </div>
    
    
    <div className='hidden md:block relative -top-[80rem] left-25'>
      <CategorySidebar />
    </div>
    
    </>


  )
}

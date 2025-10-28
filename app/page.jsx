import HeroCarousel from '@/app/_components/HeroCarousel';
import EcommerceCarousel from './_components/EcommerceCarousel';
import CategorySidebar from '@/app/_components/CategorySidebar';
import FeaturedProducts from '@/app/_components/FeaturedProducts';
import FlashSales from '@/app/_components/FlashSales';
import NewArrivals from '@/app/_components/NewArrival';


export default function HomePage() {
  return (
    <>
    <div className="relative top-o md:-top-5">
       <EcommerceCarousel />
       <div className='hidden md:block relative md:-top-[41rem]  left-27'>
      <CategorySidebar />
    </div>
      
      
      
       {/* <HeroCarousel /> */}
    </div>

    <div className='relative '>
       <FeaturedProducts />
         <FlashSales />
         <NewArrivals />
    </div>
  
    
    
    
    
    </>


  )
}

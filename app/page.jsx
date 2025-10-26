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
      
      
      
       {/* <HeroCarousel /> */}
    </div>

    <div className='relative top-[42rem]'>
       <FeaturedProducts />
         <FlashSales />
         <NewArrivals />
    </div>
  
    
    
    <div className='hidden md:block fixed top-37 left-25'>
      <CategorySidebar />
    </div>
    
    </>


  )
}

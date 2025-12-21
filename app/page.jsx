// import HeroCarousel from '@/app/_components/HeroCarousel';
import EcommerceCarousel from './_components/EcommerceCarousel';
import FeaturedProducts from './_components/FeaturedProducts';
import FlashSales from './_components/FlashSales';
import NewArrivals from './_components/NewArrival';


export default function HomePage() {
  return (
    <>
    <div className="relative top-0 md:-top-4">
       <EcommerceCarousel />
       {/* <div className='hidden md:block relative md:-top-164  left-27'>
      <CategorySidebar />
    </div> */}
      
      
      
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

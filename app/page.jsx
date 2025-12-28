// import HeroCarousel from '@/app/_components/HeroCarousel';
import EcommerceCarousel from './_components/EcommerceCarousel';
// import HeroCarousel from './_components/HeroCarousel';
import FeaturedProducts from './_components/FeaturedProducts';
import FlashSales from './_components/FlashSales';
import NewArrivals from './_components/NewArrival';


export default function HomePage() {
  return (
    <>
    <div className="relative top-0 md:-top-4">
       <EcommerceCarousel />
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

import { SerializedProduct } from "@/types/product";
import EcommerceCarousel from './_components/home/EcommerceCarousel';
import FlashSales from './_components/home/FlashSales';
import NewArrival from './_components/home/NewArrival';
import FeaturedProducts from './_components/home/FeaturedProducts';
import StoreHydrator from './_components/StoreHydrator';
import FeaturedCategoriesHome from './_components/home/FeaturedCategoriesHome';
import TrendingCarousel from './_components/home/TrendingCarousel';
import AboutSection from "./_components/home/AboutSection";
import { ProductService } from "@/app/lib/services/product.service";
import { CategoryService } from "@/app/lib/services/category.service";
import { SiteSettingsService } from "@/app/lib/services/site-settings.service";

// Helper function to serialize Prisma objects into plain JSON for Client Components
const serialize = (obj: any): any => {
  return JSON.parse(JSON.stringify(obj));
};

  export default async function HomePage() {
  const [
    dbSettings,
    flashRaw,
    newRaw,
    featuredRaw,
    trendingRaw,
    featuredCatsRaw,
  ] = await Promise.all([
    SiteSettingsService.getHomepageSettings(),
    ProductService.getFlashSaleProducts(),
    ProductService.getNewArrivalProducts(),
    ProductService.getFeaturedProducts(),
    ProductService.getTrendingProducts(),
    CategoryService.getFeaturedCategories(),
  ]);

  // 2. Fallback Settings
  const settings = dbSettings || {
    showEcommerceCarousel: true,
    showFlashSales: true,
    showFeaturedCategories: true,
    showTrendingProducts: true,
    showFeaturedProducts: true,
    showNewArrivals: true,
  };

  // Serialization with explicit Boost field handling
  const flashProducts: SerializedProduct[] = serialize(flashRaw);
  const newArrivalProducts: SerializedProduct[] = serialize(newRaw);
  const featuredProducts: SerializedProduct[] = serialize(featuredRaw);
  const trendingProducts: SerializedProduct[] = serialize(trendingRaw);
  const featuredCats = serialize(featuredCatsRaw);

  // Combine all products for the Redux Store
  const serializedAll: SerializedProduct[] = [
    ...flashProducts,
    ...newArrivalProducts,
    ...featuredProducts,
    ...trendingProducts,
  ];

  const flashSaleEndTime = new Date();
  flashSaleEndTime.setHours(flashSaleEndTime.getHours() + 24);

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <StoreHydrator products={serializedAll} />

      {settings.showEcommerceCarousel && (
        <div className="relative top-0 md:-top-4">
          <EcommerceCarousel />
        </div>
      )}
      
      <div className="max-w-[1400px] mx-auto space-y-1 px-2 md:px-10 pb-10">
        
        {settings.showFlashSales && flashProducts.length > 0 && (
          <section>
            <FlashSales products={flashProducts} endTime={flashSaleEndTime.toISOString()} />
          </section>
        )}

        {settings.showFeaturedCategories && featuredCats.length > 0 && (
          <section>
            <FeaturedCategoriesHome categories={featuredCats} />
          </section>
        )}

        {/* Trending Gatekeeper - Now Boost-Aware */}
        {settings.showTrendingProducts && trendingProducts.length > 0 && (
          <section>
            <TrendingCarousel initialData={trendingProducts} />
          </section>
        )}

        {settings.showFeaturedProducts && featuredProducts.length > 0 && (
          <section>
            <FeaturedProducts products={featuredProducts} />
          </section>
        )}

        {settings.showNewArrivals && newArrivalProducts.length > 0 && (
          <section>
            <NewArrival products={newArrivalProducts} />
          </section>
        )}

        <AboutSection />
      </div>
    </div>
  );
}
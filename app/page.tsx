import prisma from "@/app/lib/prisma";
import { SerializedProduct } from "@/types/product";
import EcommerceCarousel from './_components/EcommerceCarousel';
import FlashSales from './_components/FlashSales';
import NewArrival from './_components/NewArrival';
import FeaturedProducts from './_components/FeaturedProducts';
import StoreHydrator from './_components/StoreHydrator';
import FeaturedCategoriesHome from './_components/home/FeaturedCategoriesHome';
import TrendingCarousel from './_components/home/TrendingCarousel';
import AboutSection from "./_components/home/AboutSection";

// Helper function to serialize Prisma objects into plain JSON for Client Components
const serialize = (obj: any): any => {
  return JSON.parse(JSON.stringify(obj));
};

export default async function HomePage() {
  const now = new Date();

  // 1. Fetch Data in parallel
  const [
    dbSettings,
    flashRaw,
    newRaw,
    featuredRaw,
    trendingRaw,
    featuredCatsRaw
  ] = await Promise.all([
    prisma.siteSettings.findUnique({ where: { id: 1 } }),
    
    prisma.product.findMany({ 
      where: { isFlashSale: true, isPublished: true }, 
      take: 8,
      include: {
        images: true, 
        vendorProfile: true 
      }
    }),
    
    prisma.product.findMany({ 
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' }, 
      take: 8,
      include: {
        images: { select: { url: true } },
        vendorProfile: {
          select: { storeName: true, isVerified: true }
        }
      }
    }),

    prisma.product.findMany({ 
      where: { isFeatured: true, isPublished: true }, 
      take: 8,
      include: {
        images: { select: { url: true } },
        vendorProfile: {
          select: { storeName: true, isVerified: true }
        }
      }
    }),

    // --- UPDATED TRENDING QUERY FOR BOOSTING ---
    prisma.product.findMany({ 
      where: { 
        isPublished: true,
        OR: [
          { isTrending: true },
          { boostUntil: { gte: now } } // Include active boosts
        ]
      }, 
      orderBy: [
        { boostUntil: { sort: 'desc', nulls: 'last' } }, // Boosted first
        { salesCount: 'desc' }
      ],
      take: 12, // Increased slightly for better carousel variety
      include: {
        images: { select: { url: true } },
        vendorProfile: {
          select: { storeName: true, isVerified: true }
        }
      }
    }),
    
    prisma.category.findMany({ 
      where: { isFeatured: true }, 
      take: 6,
      include: {
        _count: { select: { products: true } }
      }
    })
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
      
      <div className="max-w-[1400px] mx-auto space-y-1 px-4 md:px-10 pb-20">
        
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
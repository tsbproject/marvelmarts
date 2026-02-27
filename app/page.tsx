// // app/(storefront)/page.tsx
// import prisma from "@/app/lib/prisma";
// import { SerializedProduct } from "@/types/product";
// import EcommerceCarousel from './_components/EcommerceCarousel';
// import FlashSales from './_components/FlashSales';
// import NewArrival from './_components/NewArrival';
// import FeaturedProducts from './_components/FeaturedProducts';
// import StoreHydrator from './_components/StoreHydrator';
// import FeaturedCategoriesHome from './_components/home/FeaturedCategoriesHome';
// import TrendingCarousel from './_components/home/TrendingCarousel';

// // Force Next.js to fetch fresh data from Prisma on every request
// export const revalidate = 0;

// export default async function HomePage() {
//   // 1. Fetch all tactical data in parallel
//   const [flashRaw, newRaw, featuredRaw, trendingRaw, featuredCatsRaw] = await Promise.all([
//     // FLASH SALES
//     prisma.product.findMany({
//       where: { status: "ACTIVE", isFlashSale: true },
//       include: { images: true, category: true },
//       take: 6,
//       orderBy: { updatedAt: 'desc' }
//     }),
    
//     // NEW ARRIVALS
//     prisma.product.findMany({
//       where: { 
//         status: "ACTIVE",
//         OR: [
//           { isNewArrival: true },
//           { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }
//         ]
//       },
//       include: { images: true, category: true },
//       orderBy: { createdAt: 'desc' },
//       take: 8,
//     }),
    
//     // FEATURED PRODUCTS
//     prisma.product.findMany({
//       where: { status: "ACTIVE", isFeatured: true },
//       include: { images: true, category: true },
//       take: 12,
//       orderBy: { updatedAt: 'desc' }
//     }),

//     // TRENDING PRODUCTS
//     prisma.product.findMany({
//       where: { status: "ACTIVE", isTrending: true },
//       include: { images: true, category: true },
//       take: 10,
//       orderBy: { updatedAt: 'desc' }
//     }),

//     // FEATURED CATEGORIES
//     prisma.category.findMany({
//       where: { isFeatured: true },
//       orderBy: { position: 'asc' },
//       take: 6,
//       select: {
//         id: true,
//         name: true,
//         slug: true,
//         imageUrl: true,
//         _count: { select: { products: true } }
//       }
//     })
//   ]);

//   // 2. Product Serialization Logic
//   const serializeProducts = (items: any[]): SerializedProduct[] => {
//     return items.map(item => ({
//       id: item.id,
//       slug: item.slug,
//       name: item.title || item.name || "",
//       title: item.name || item.title || "Untitled Gear",
//       description: item.description || "",
//       price: Number(item.price),
//       discountPrice: item.discountPrice ? Number(item.discountPrice) : null,
//       categoryName: item.category?.name || "General",
//       stock: item.stock || 0,
//       imageUrl: item.images?.[0]?.url || "https://placehold.co/600x400?text=No+Image",
//       images: item.images?.map((img: any) => ({ url: img.url })) || [],
//       isTrending: !!item.isTrending,
//       isPublished: item.isPublished ?? true, 
//       isVerified: item.isVerified ?? false,
      
//       // FIX: Add the missing vendorProfileId required by your interface
//       // Pulling from item.vendorProfileId or the nested vendor object
//       vendorProfileId: item.vendorProfileId || item.vendorId || item.vendor?.id || "",
//     }));
//   };
//   // 3. Category Serialization Logic
//   const featuredCats = featuredCatsRaw.map(cat => ({
//     id: cat.id,
//     name: cat.name,
//     slug: cat.slug,
//     imageUrl: cat.imageUrl && cat.imageUrl.length > 0 
//       ? cat.imageUrl 
//       : `https://placehold.co/600x400?text=${encodeURIComponent(cat.name)}`,
//     _count: {
//       products: cat._count.products
//     }
//   }));

//   // 4. Prepare Serialized Arrays
//   const flashProducts = serializeProducts(flashRaw);
//   const newArrivalProducts = serializeProducts(newRaw);
//   const featuredProducts = serializeProducts(featuredRaw);
//   const trendingProducts = serializeProducts(trendingRaw);
  
//   // Combine all for Redux Hydration
//   const serializedAll = [...flashProducts, ...newArrivalProducts, ...featuredProducts, ...trendingProducts];
  
//   const flashSaleEndTime = new Date();
//   flashSaleEndTime.setHours(flashSaleEndTime.getHours() + 24);

//   return (
//     <div className="bg-[#F8FAFC] min-h-screen">
//       {/* MarvelMarts Redux Bridge */}
//       <StoreHydrator products={serializedAll} />

//       <div className="relative top-0 md:-top-4">
//         <EcommerceCarousel />
//       </div>
      
//       <div className="max-w-[1400px] mx-auto space-y-24 px-4 md:px-10 pb-20">
        
//         {/* Item A: Flash Sales */}
//         {flashProducts.length > 0 && (
//           <section>
//             <FlashSales 
//               products={flashProducts} 
//               endTime={flashSaleEndTime.toISOString()} 
//             />
//           </section>
//         )}

//         {/* Item B: Featured Categories */}
//         {featuredCats.length > 0 && (
//           <section>
//             <FeaturedCategoriesHome categories={featuredCats} />
//           </section>
//         )}

//         {/* Item C: Trending Carousel */}
//         {trendingProducts.length > 0 && (
//           <section>
//             <TrendingCarousel initialData={trendingProducts} />
//           </section>
//         )}

//         {/* Item D: Featured Products Grid */}
//         {featuredProducts.length > 0 && (
//           <section>
//             <FeaturedProducts products={featuredProducts} />
//           </section>
//         )}

//         {/* Item E: New Arrivals */}
//         {newArrivalProducts.length > 0 && (
//           <section>
//             <NewArrival products={newArrivalProducts} />
//           </section>
//         )}

//       </div>
//     </div>
//   );
// }



import prisma from "@/app/lib/prisma";
import { SerializedProduct } from "@/types/product";
import EcommerceCarousel from './_components/EcommerceCarousel';
import FlashSales from './_components/FlashSales';
import NewArrival from './_components/NewArrival';
import FeaturedProducts from './_components/FeaturedProducts';
import StoreHydrator from './_components/StoreHydrator';
import FeaturedCategoriesHome from './_components/home/FeaturedCategoriesHome';
import TrendingCarousel from './_components/home/TrendingCarousel';

// Helper function to serialize Prisma objects into plain JSON for Client Components
const serialize = (obj: any): any => {
  return JSON.parse(JSON.stringify(obj));
};

export default async function HomePage() {
  // 1. Fetch Data in parallel
  // Note: I removed the extra .findFirst() at the end to match the destructuring array length.
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
    where: { isFlashSale: true }, 
    take: 8,
    include: {
      images: true, // MUST include this if images are in a separate table
      vendorProfile: true // For store name/verification
    }
  }),
    
    
    
        prisma.product.findMany({ 
        orderBy: { createdAt: 'desc' }, 
        take: 8,
        include: {
          images: {
            select: {
              url: true // Fetches the actual image URL from the related table
            }
          },
          vendorProfile: {
            select: {
              storeName: true,
              isVerified: true
            }
          }
        }
      }),


      prisma.product.findMany({ 
        where: { isFeatured: true }, 
        take: 8,
        include: {
          images: {
            select: {
              url: true
            }
          },
          vendorProfile: {
            select: {
              storeName: true,
              isVerified: true
            }
          }
        }
      }),

   
   prisma.product.findMany({ 
      where: { isTrending: true }, 
      take: 8,
      include: {
        images: {
          select: {
            url: true
          }
        },
        vendorProfile: {
          select: {
            storeName: true,
            isVerified: true
          }
        }
      }
    }),
   
   
    prisma.category.findMany({ 
      where: { isFeatured: true }, 
      take: 6,
      include: {
        _count: {
          select: { products: true }
        }
        // Note: If you have an image field in your Category model (e.g., imageUrl),
        // Prisma fetches it by default if it's a scalar. 
        // If it's a relation, add it here like:
        // images: true 
      }
    })
  ]); // Close the Promise.all() array

  
  
  
  // 2. Fallback Settings
  const settings = dbSettings || {
    showHeroCarousel: true,
    showFlashSales: true,
    showFeaturedCategories: true,
    showTrendingCarousel: true,
    showFeaturedProducts: true,
    showNewArrivals: true,
  };

   // Inside HomePage() after your Promise.all

const serializeProduct = (p: any): SerializedProduct => ({
  ...JSON.parse(JSON.stringify(p)),
  // Ensure imageUrl is at least an empty string if null, 
  // or a specific default if you want a global placeholder
  imageUrl: p.imageUrl || "/logo.png", 
  createdAt: p.createdAt.toISOString(),
  updatedAt: p.updatedAt.toISOString(),
});
  // Convert all Date objects to ISO strings to avoid the "red" type errors
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

  // Logic for Flash Sale timer (Defaulting to 24 hours from now if no specific date is in settings)
  const flashSaleEndTime = new Date();
  flashSaleEndTime.setHours(flashSaleEndTime.getHours() + 24);

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      {/* Redux Hydration - Passing plain serialized array */}
      <StoreHydrator products={serializedAll} />

      {/* Hero Carousel controlled by settings */}
      {settings.showHeroCarousel && (
        <div className="relative top-0 md:-top-4">
          <EcommerceCarousel />
        </div>
      )}
      
      <div className="max-w-[1400px] mx-auto space-y-24 px-4 md:px-10 pb-20">
        
        {/* Flash Sales Gatekeeper */}
        {settings.showFlashSales && flashProducts.length > 0 && (
          <section>
            <FlashSales products={flashProducts} endTime={flashSaleEndTime.toISOString()} />
          </section>
        )}

        {/* Featured Categories Gatekeeper */}
        {settings.showFeaturedCategories && featuredCats.length > 0 && (
          <section>
            <FeaturedCategoriesHome categories={featuredCats} />
          </section>
        )}

        {/* Trending Gatekeeper */}
        {settings.showTrendingCarousel && trendingProducts.length > 0 && (
          <section>
            <TrendingCarousel initialData={trendingProducts} />
          </section>
        )}

        {/* Featured Products Gatekeeper */}
        {settings.showFeaturedProducts && featuredProducts.length > 0 && (
          <section>
            <FeaturedProducts products={featuredProducts} />
          </section>
        )}

        {/* New Arrivals Gatekeeper */}
        {settings.showNewArrivals && newArrivalProducts.length > 0 && (
          <section>
            <NewArrival products={newArrivalProducts} />
          </section>
        )}
      </div>
    </div>
  );
}
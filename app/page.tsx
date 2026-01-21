import prisma from "@/app/lib/prisma";
import { SerializedProduct } from "@/types/product";
import EcommerceCarousel from './_components/EcommerceCarousel';
import FlashSales from './_components/FlashSales';
import NewArrival from './_components/NewArrival';
import FeaturedProducts from './_components/FeaturedProducts';

export default async function HomePage() {
  let flashProducts: any[] = [];
  let newArrivalProducts: any[] = [];
  let featuredProducts: any[] = [];

  try {
    const data = await Promise.all([
      // FLASH SALES
      prisma.product.findMany({
        where: { status: "ACTIVE", isFeatured: true, discountPrice: { gt: 0 } },
        include: { images: true, category: true },
        take: 4,
      }),
      // NEW ARRIVALS
      prisma.product.findMany({
        where: { status: "ACTIVE" },
        include: { images: true, category: true },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
      // FEATURED
      prisma.product.findMany({
        where: { status: "ACTIVE", isFeatured: true },
        include: { images: true, category: true },
        take: 12,
      })
    ]);

    // THE FIX: Assign the data from the Promise array back to your variables
    [flashProducts, newArrivalProducts, featuredProducts] = data;

  } catch (error) {
    console.error("Database Fetch Error:", error);
  }

  // Strictly typed serialization logic
  const serialize = (items: any[]): SerializedProduct[] => {
    return (items || []).map(item => {
      const primaryImage = item.images?.[0]?.url || 
        `https://placehold.co/600x400?text=${encodeURIComponent(item.title)}`;

      return {
        id: item.id,
        slug: item.slug,
        title: item.title,
        description: item.description || "",
        price: Number(item.price),
        discountPrice: item.discountPrice ? Number(item.discountPrice) : null,
        categoryName: item.category?.name || "General",
        stock: item.stock || 0,
        imageUrl: primaryImage,
        images: item.images?.map((img: any) => ({ url: img.url })) || [],
      };
    });
  };

  const flashSaleEndTime = new Date();
  flashSaleEndTime.setHours(flashSaleEndTime.getHours() + 24);

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <div className="relative top-0 md:-top-4">
        <EcommerceCarousel />
      </div>
      
      <div className="max-w-[1400px] mx-auto space-y-20 px-4 md:px-10 pb-20 mt-200">
        {/* 1. Flash Sales: Only shows if products exist with isFeatured AND discountPrice */}
        {flashProducts.length > 0 && (
          <FlashSales 
            products={serialize(flashProducts)} 
            endTime={flashSaleEndTime.toISOString()} 
          />
        )}

        {/* 2. Featured: Only shows if products have isFeatured checked */}
        {featuredProducts.length > 0 && (
          <FeaturedProducts products={serialize(featuredProducts)} />
        )}

        {/* 3. New Arrivals */}
        {newArrivalProducts.length > 0 && (
          <NewArrival products={serialize(newArrivalProducts)} />
        )}
      </div>
    </div>
  );
}
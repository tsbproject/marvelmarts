



// // app/shop/page.tsx
// import { prisma } from "@/app/lib/prisma";
// import ShopSidebar from "@/app/_components/ShopSidebar";
// import ShopContent from "@/app/shop/components/Shopcontent"; 

// export default async function ShopPage({
//   searchParams,
// }: {
//   searchParams: Promise<{ 
//     category?: string; 
//     subcategory?: string; 
//     brand?: string; 
//     minPrice?: string; 
//     maxPrice?: string 
//   }>;
// }) {
//   const filters = await searchParams;

//   // 1. Fetch real categories for the sidebar
//   const categories = await prisma.category.findMany({
//     where: { parentId: null },
//     include: { children: true },
//   });

//   // 2. Build the query
//   const where: any = {};
//   if (filters.category) where.category = { slug: filters.category };
//   if (filters.subcategory) where.category = { slug: filters.subcategory };
//   if (filters.brand) where.brand = filters.brand;
//   if (filters.minPrice || filters.maxPrice) {
//     where.price = {
//       gte: filters.minPrice ? parseFloat(filters.minPrice) : 0,
//       lte: filters.maxPrice ? parseFloat(filters.maxPrice) : 9999999,
//     };
//   }

//   const rawProducts = await prisma.product.findMany({
//     where,
//     include: { images: true, variants: true, category: true },
//     orderBy: { createdAt: 'desc' }
//   });


//   // 1. Map the products with explicit typing
// const serializedProducts: SerializedProduct[] = products.map((product: any) => {
//   return {
//     // Spread the existing properties (id, title, slug, price, stock, etc.)
//     ...product,
    
//     // Flatten the category object into a string
//     categoryName: product.category?.name || "Tactical Gear",
    
//     // Extract the first image URL into a single string
//     imageUrl: product.images?.[0]?.url || "/placeholder.png",
    
//     // Ensure the array of image objects is passed correctly
//     images: product.images || [{ url: "/placeholder.png" }],

//     // Ensure Dates are converted to ISO strings for the client component
//     createdAt: product.createdAt instanceof Date 
//       ? product.createdAt.toISOString() 
//       : new Date(product.createdAt).toISOString(),
//     updatedAt: product.updatedAt instanceof Date 
//       ? product.updatedAt.toISOString() 
//       : new Date(product.updatedAt).toISOString(),
    
//     // Ensure discountPrice is explicitly handled
//     discountPrice: product.discountPrice ?? null,
//   };
// });

// // 2. Pass the typed array to your component
// return (
//   <div className="container mx-auto">
//     <div className="flex flex-col lg:flex-row gap-8">
//       <ShopSidebar categories={categories} />
//       <ShopContent initialProducts={serializedProducts} />
//     </div>
//   </div>
// );

  


// //   const serializedProducts = products.map((product) => ({
// //   ...product,
// //   // Flatten the category name
// //   categoryName: (product as any).category?.name || "Tactical Gear",
// //   // Ensure we have a single string for imageUrl
// //   imageUrl: (product as any).images?.[0]?.url || "/placeholder.png",
// //   // Ensure dates are strings for Redux/Serialization
// //   createdAt: new Date(product.createdAt).toISOString(),
// //   updatedAt: new Date(product.updatedAt).toISOString(),
// // }));

//   // 3. SERIALIZE DATA: Convert Decimals and Dates to plain types
//   const products = rawProducts.map(p => ({
//     ...p,
//     price: Number(p.price || 0),
//     discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
//     createdAt: p.createdAt.toISOString(),
//     updatedAt: p.updatedAt.toISOString(),
//     variants: p.variants.map(v => ({ ...v, price: Number(v.price) })),
//   }));

//   return (
//     <div className="bg-neutral-white min-h-screen">
//       {/* Hero Section */}
//       <div className="bg-accent-navy py-16 px-4">
//         <div className="container mx-auto">
//           <p className="text-brand-primary font-black uppercase tracking-[0.4em] text-[10px] mb-4">
//             Elite Equipment Selection
//           </p>
//           <h1 className="text-5xl md:text-7xl font-black italic uppercase text-white tracking-tighter leading-none">
//             The <span className="text-brand-primary">Armory</span>
//           </h1>
//         </div>
//       </div>

//       <div className="container mx-auto px-4 py-12 flex flex-col lg:flex-row gap-12">
//         <ShopSidebar categories={categories} />
//         {/* Pass serialized products to the Client-side Grid */}
//         <ShopContent initialProducts={serializedProducts} />
//       </div>
//     </div>
//   );
// }




// app/shop/page.tsx
import { prisma } from "@/app/lib/prisma";
import ShopSidebar from "@/app/_components/ShopSidebar";
import ShopContent from "@/app/shop/components/Shopcontent"; 
import { SerializedProduct } from "@/types/product"; // Ensure this import path is correct

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ 
    category?: string; 
    subcategory?: string; 
    brand?: string; 
    minPrice?: string; 
    maxPrice?: string 
  }>;
}) {
  const filters = await searchParams;

  // 1. Fetch real categories for the sidebar
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    include: { children: true },
  });

  // 2. Build the query
  const where: any = {};
  if (filters.category) where.category = { slug: filters.category };
  if (filters.subcategory) where.category = { slug: filters.subcategory };
  if (filters.brand) where.brand = filters.brand;
  if (filters.minPrice || filters.maxPrice) {
    where.price = {
      gte: filters.minPrice ? parseFloat(filters.minPrice) : 0,
      lte: filters.maxPrice ? parseFloat(filters.maxPrice) : 9999999,
    };
  }

  const rawProducts = await prisma.product.findMany({
    where,
    include: { images: true, variants: true, category: true },
    orderBy: { createdAt: 'desc' }
  });

  // 3. SINGLE SOURCE OF TRUTH: Map raw DB data to SerializedProduct interface
  const serializedProducts: SerializedProduct[] = rawProducts.map((p: any) => ({
    // ID, title, slug, and other basic strings
    id: p.id,
    title: p.title,
    slug: p.slug,
    description: p.description || "",
    stock: p.stock || 0,
    
    // Numeric conversions for Decimals
    price: Number(p.price || 0),
    discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
    
    // UI-specific flattened fields
    categoryName: p.category?.name || "Tactical Gear",
    imageUrl: p.images?.[0]?.url || "/placeholder.png",
    
    // Array properties
    images: p.images && p.images.length > 0 ? p.images : [{ url: "/placeholder.png" }],
    variants: p.variants ? p.variants.map((v: any) => ({
      ...v,
      price: Number(v.price)
    })) : [],

    // Date to String serialization
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : new Date(p.createdAt).toISOString(),
    updatedAt: p.updatedAt instanceof Date ? p.updatedAt.toISOString() : new Date(p.updatedAt).toISOString(),
    
    // Additional optional fields
    brand: p.brand || null,
    vendorId: p.vendorId || null,
  }));

  return (
    <div className="bg-neutral-white min-h-screen">
      {/* Hero Section */}
      <div className="bg-accent-navy py-16 px-4">
        <div className="container mx-auto">
          <p className="text-brand-primary font-black uppercase tracking-[0.4em] text-[10px] mb-4">
            Elite Equipment Selection
          </p>
          <h1 className="text-5xl md:text-7xl font-black italic uppercase text-white tracking-tighter leading-none">
            The <span className="text-brand-primary">Armory</span>
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 flex flex-col lg:flex-row gap-12">
        <ShopSidebar categories={categories} />
        {/* Pass the fully serialized array to the Client component */}
        <ShopContent initialProducts={serializedProducts} />
      </div>
    </div>
  );
}
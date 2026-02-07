import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";
import WishlistClient from "./WishlistClient";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function WishlistPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/sign-in");
  }

  const wishlistData = await prisma.wishlist.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        include: {
          images: {
            orderBy: { order: 'asc' }, // Get images in the correct order
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const sanitizedItems = wishlistData.map((item: any) => {
    const p = item.product;

    // Fix 1: Use p.title (from your schema)
    // Fix 2: Look into the images relation for the .url
    const productImages = p.images; // This is now an array of ProductImage objects
    const hasImages = Array.isArray(productImages) && productImages.length > 0;
    
    // We grab the .url property from the first ProductImage object
    const finalImage = hasImages ? productImages[0].url : "/logo.png";

    return {
      id: item.id,
      productId: p.id,
      name: p.title || "MarvelMarts Product",
      price: Number(p.price),
      image: (finalImage && finalImage.trim() !== "") ? finalImage : "/logo.png",
      slug: p.slug,
    };
  });

  return (
    <main className="min-h-screen bg-neutral-light/30">
      <WishlistClient initialItems={sanitizedItems} />
    </main>
  );
}
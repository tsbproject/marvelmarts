import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import WishlistClient from "./WishlistClient";
import { WishlistService } from "@/app/lib/services/wishlist.service";

export default async function WishlistPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/sign-in");
  }

    const wishlist =
      await WishlistService.getCustomerWishlist(
        session.user.id
      );

  const initialItems = wishlist.map((item) => ({
    id: item.id,
    productId: item.productId,
    name: item.product?.title || item.product?.title || "Product",
    price: Number(item.product?.discountPrice ?? item.product?.price ?? 0),
    image: item.product?.images?.[0]?.url || "/placeholder-image.png",
    slug: item.product?.slug || "",
    product: item.product
      ? {
          name: item.product.title || item.product.title,
          price: Number(item.product.discountPrice ?? item.product.price ?? 0),
          images: item.product.images.map((img) => ({ url: img.url })),
          slug: item.product.slug,
        }
      : undefined,
  }));

  return <WishlistClient initialItems={initialItems} />;
}
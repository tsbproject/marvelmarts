


"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingCart, ShieldCheck, Truck, RefreshCcw, Plus, Minus,
  ChevronLeft, Star, Store, CheckCircle2, Facebook, Mail,
  MessageCircle, Share2, UserPlus, UserCheck, PackageCheck, 
  ThumbsUp, AlertTriangle
} from "lucide-react";

// Redux & Context
import { useDispatch } from "react-redux";
import { addToCart } from "@/store/cartSlice";
import { setReviews } from "@/store/reviewsSlice"; 
import { useNotification } from "@/app/_context/NotificationContext";
import { useLoadingOverlay } from "@/app/_context/LoadingOverlayContext";

// Components & Utils
import ProductTabs from "@/app/_components/ProductTabs";
import ProductGallery from "@/app/_components/PhotoGallery"; 
import VariantSelector from "@/app/_components/VariantSelector"; 
import ReviewList from "@/app/_components/ReviewList";
import AddReview from "@/app/_components/AddReview";
import ChatWithVendor from "./_components/ChatWithVendor";
import { formatNaira } from "@/app/lib/FormatNaira";
import { ProductWithRelations } from "./page";
import { SerializedProduct } from "@/types/product";
import Image from "next/image";
import Link from "next/link";

interface ProductDetailsProps {
  product: ProductWithRelations;
  similarItems: {
    id: string;
    title: string;
    slug: string;
    price: number;
    discountPrice: number | null;
    imageUrl: string;
  }[];
}


export interface VendorProfile {
  id: string;
  storeName: string;
  isVerified: boolean;
  followerCount: number;
  shippingScore: number;
  qualityScore: number;
  avgRating: number;
  cancellationRate: number;
  store?: {
    slug: string;
  };
}

export default function ProductDetails({ product, similarItems }: ProductDetailsProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { notifySuccess, notifyError } = useNotification();
  const { setLoading } = useLoadingOverlay();

  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);

  // Sync loading state
  useEffect(() => {
    setLoading(false);
  }, [product.id, setLoading]);

  // Sync reviews with Redux Store
  useEffect(() => {
    if (product && Array.isArray(product.reviews)) {
      const serializedReviews = product.reviews.map((review: any) => ({
        ...review,
        createdAt: review.createdAt instanceof Date ? review.createdAt.toISOString() : review.createdAt,
        updatedAt: review.updatedAt instanceof Date ? review.updatedAt.toISOString() : review.updatedAt,
      }));
      dispatch(setReviews(serializedReviews));
    }
  }, [product, dispatch]);

  const hasVariants = product.variants && product.variants.length > 0;
  const currentPrice = selectedVariant?.price ? Number(selectedVariant.price) : (product.discountPrice ?? product.price);
  const currentMaxStock = selectedVariant ? selectedVariant.stock : product.stock;

  const navigateWithLoading = (path: string) => {
    setLoading(true);
    router.push(path);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (hasVariants && !selectedVariant) {
      notifyError("Please select a variant first!");
      return;
    }
    const reduxProduct: SerializedProduct = {
      id: product.id,
      name: product.title,
      title: selectedVariant ? `${product.title} (${selectedVariant.name})` : product.title,
      slug: product.slug,
      price: Number(currentPrice),
      imageUrl: product.images?.[0]?.url || "/logo.png",
      categoryName: product.category?.name || "Tactical Gear",
      description: product.description || "",
      discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
      images: product.images && product.images.length > 0 ? product.images.map((img: any) => ({ url: img.url })) : [{ url: "/logo.png" }],
      stock: currentMaxStock,
      createdAt: product.createdAt ? new Date(product.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: product.updatedAt ? new Date(product.updatedAt).toISOString() : new Date().toISOString(),
      variantId: selectedVariant?.id || "", 
      isPublished: product.isPublished,
      vendorProfileId: product.vendorProfileId,
      vendorProfile: product.vendorProfile ? {
        storeName: product.vendorProfile.storeName,
        isVerified: product.vendorProfile.isVerified,
        store: product.vendorProfile.store ? { slug: product.vendorProfile.store.slug } : undefined
      } : undefined
    };
    dispatch(addToCart({ product: reduxProduct, quantity }));
    notifySuccess(`${reduxProduct.title} added to your stash!`);
  };


  // Logic for Categories and Tags (Restored exactly from original)
  const productTags = Array.isArray((product as any).tags) 
    ? (product as any).tags 
    : typeof (product as any).tags === "string" 
      ? (product as any).tags.split(",").map((tag: string) => tag.trim()).filter(Boolean) 
      : [];

  const productCategories = [
    product.category?.name, 
    ...(Array.isArray((product as any).categories) 
      ? (product as any).categories.map((cat: any) => typeof cat === "string" ? cat : cat?.name) 
      : []) // Parenthesis was misplaced here
  ].filter(Boolean);

  const uniqueCategories = [...new Set(productCategories)];
  const uniqueTags = [...new Set(productTags)];

  // Sharing Logic (Restored exactly from original)
  const productUrl = typeof window !== "undefined" ? window.location.href : `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/products/${product.slug}`;
  const shareText = `Check out this product on MarvelMarts: ${product.title}`;
  const encodedUrl = encodeURIComponent(productUrl);
  const encodedText = encodeURIComponent(shareText);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${productUrl}`)}`,
    email: `mailto:?subject=${encodeURIComponent(product.title)}&body=${encodeURIComponent(`${shareText}\n\n${productUrl}`)}`,
  };

  const openShareWindow = (url: string) => {
    if (typeof window === "undefined") return;
    window.open(url, "_blank", "noopener,noreferrer,width=700,height=600");
  };


const [followerCount, setFollowerCount] = useState(product.vendorProfile?.followerCount ?? 0);
const [vendorStats, setVendorStats] = useState({
  shippingScore: product.vendorProfile?.shippingScore ?? 100,
  qualityScore: product.vendorProfile?.qualityScore ?? 100,
  avgRating: product.vendorProfile?.avgRating ?? 5,
  cancellationRate: product.vendorProfile?.cancellationRate ?? 0,
});

const vendorMetrics = [
  {
    icon: <Truck size={12} />,
    label: "Shipping",
    val: `${vendorStats.shippingScore}%`,
    color: "text-green-500",
  },
  {
    icon: <PackageCheck size={12} />,
    label: "Quality",
    val: `${vendorStats.qualityScore}%`,
    color: "text-[#F7931E]",
  },
  {
    icon: <ThumbsUp size={12} />,
    label: "Rating",
    val: Number(vendorStats.avgRating).toFixed(1),
    color: "text-blue-500",
  },
  {
    icon: <AlertTriangle size={12} />,
    label: "Cancel",
    val: `${vendorStats.cancellationRate}%`,
    color: "text-red-500",
  },
];





const [isVendorLoading, setIsVendorLoading] = useState(false);


 const fetchVendorLiveData = async () => {
  if (!product.vendorProfileId) return;

  try {
    setIsVendorLoading(true);

    const res = await fetch(`/api/vendors/${product.vendorProfileId}/live-stats`, {
      method: "GET",
      cache: "no-store",
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      console.error("Vendor live data fetch failed:", {
        status: res.status,
        statusText: res.statusText,
        data,
        vendorProfileId: product.vendorProfileId,
      });
      return;
    }

    setFollowerCount(data?.followerCount ?? 0);
    setIsFollowing(Boolean(data?.isFollowing));
    setVendorStats({
      shippingScore: data?.shippingScore ?? 100,
      qualityScore: data?.qualityScore ?? 100,
      avgRating: data?.avgRating ?? 5,
      cancellationRate: data?.cancellationRate ?? 0,
    });
  } catch (error) {
    console.error("Vendor live data error:", error);
  } finally {
    setIsVendorLoading(false);
  }
};


      useEffect(() => {
        fetchVendorLiveData();
      }, [product.vendorProfileId]);

  
      const handleFollowToggle = async () => {
        if (!product.vendorProfileId) return;

        const previousFollowing = isFollowing;
        const previousCount = followerCount;

        const becomingFollower = !previousFollowing;

        setIsFollowing(becomingFollower);
        setFollowerCount((prev) => Math.max(0, becomingFollower ? prev + 1 : prev - 1));

        try {
          const res = await fetch(`/api/vendors/${product.vendorProfileId}/follow`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              action: becomingFollower ? "follow" : "unfollow",
            }),
          });

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data?.error || "Failed to update follow status");
          }

          setIsFollowing(Boolean(data.isFollowing));
          setFollowerCount(data.followerCount ?? 0);

          notifySuccess(data.isFollowing ? "Store added to your favorites" : "Unfollowed");
        } catch (error: any) {
          setIsFollowing(previousFollowing);
          setFollowerCount(previousCount);
          notifyError(error?.message || "Action failed. Try again.");
        }
      };





  return (
    <div className="bg-[#F8F8F8] min-h-screen pb-20">
      <div className="container mx-auto px-4 py-8">
        <button onClick={() => navigateWithLoading("/shop")} className="inline-flex items-center gap-2 text-[#4B4B4B] hover:text-[#F7931E] font-black uppercase text-[10px] tracking-[0.3em] mb-10 transition-colors group">
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to the Products Armory
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-24 mb-20">
          <ProductGallery images={product.images && product.images.length > 0 ? product.images : [{ url: "/logo.png" }]} title={product.title} />

          <div className="flex flex-col">
            <div className="mb-8">
              <p className="text-[#F7931E] font-black uppercase tracking-[0.4em] text-[10px] mb-4">{product.category?.name || "Tactical Asset"}</p>
              <h1 className="text-lg md:text-xl xl:text-2xl 2xl:text-4xl font-black italic uppercase tracking-tighter text-[#002B5B] leading-[0.9] mb-6">{product.title}</h1>
              <div className="flex items-center gap-6">
                <div className="flex items-center bg-[#002B5B] text-white px-3 py-1.5 rounded-xl gap-1.5">
                  <Star size={14} className="fill-[#F7931E] text-[#F7931E]" />
                  <span className="text-sm font-black italic">{product.rating > 0 ? product.rating.toFixed(1) : "5.0"}</span>
                </div>
                <button onClick={() => document.getElementById('field-reports')?.scrollIntoView({ behavior: 'smooth' })} className="text-[#4B4B4B] hover:text-[#F7931E] transition-colors font-bold text-[10px] uppercase tracking-widest border-l border-gray-200 pl-6 flex items-center gap-2">
                  {product.reviews.length} {product.reviews.length === 1 ? "Product Rating" : "Product Ratings"}
                </button>
              </div>
            </div>

            {/* CATEGORIES AND TAGS */}
            {(uniqueCategories.length > 0 || uniqueTags.length > 0) && (
              <div className="mb-8 flex flex-col gap-4">
                {uniqueCategories.length > 0 && (
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#F7931E] mb-2">Categories</p>
                    <div className="flex flex-wrap gap-2">
                      {uniqueCategories.map((category, index) => (
                        <span key={`${category}-${index}`} className="px-4 py-2 rounded-full bg-white border border-gray-100 text-[#002B5B] text-[10px] font-black uppercase tracking-wider shadow-sm">{category}</span>
                      ))}
                    </div>
                  </div>
                )}
                {uniqueTags.length > 0 && (
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#F7931E] mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {uniqueTags.map((tag, index) => (
                        <span key={`${tag}-${index}`} className="px-4 py-2 rounded-full bg-[#002B5B]/5 border border-[#002B5B]/10 text-[#4B4B4B] text-[10px] font-black uppercase tracking-wider">#{String(tag)}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SOCIAL MEDIA SHARE */}
            <div className="mb-8">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#F7931E] mb-3 flex items-center gap-2"><Share2 size={12} /> Share Product</p>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => openShareWindow(shareLinks.facebook)} className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white border border-gray-100 text-[#002B5B] text-[10px] font-black uppercase tracking-wider shadow-sm hover:border-[#F7931E] hover:text-[#F7931E] transition-all"><Facebook size={14} /> Facebook</button>
                <button type="button" onClick={() => openShareWindow(shareLinks.twitter)} className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white border border-gray-100 text-[#002B5B] text-[10px] font-black uppercase tracking-wider shadow-sm hover:border-[#F7931E] hover:text-[#F7931E] transition-all"><span className="text-[11px] font-black">X</span> Twitter</button>
                <button type="button" onClick={() => openShareWindow(shareLinks.whatsapp)} className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white border border-gray-100 text-[#002B5B] text-[10px] font-black uppercase tracking-wider shadow-sm hover:border-[#F7931E] hover:text-[#F7931E] transition-all"><MessageCircle size={14} /> WhatsApp</button>
                <a href={shareLinks.email} className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white border border-gray-100 text-[#002B5B] text-[10px] font-black uppercase tracking-wider shadow-sm hover:border-[#F7931E] hover:text-[#F7931E] transition-all"><Mail size={14} /> Email</a>
              </div>
            </div>

            {/* VENDOR BRANDING & PERFORMANCE */}
            {product.vendorProfile && (
              <div className="bg-white p-6 rounded-[2rem] border border-gray-100 mb-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-[#002B5B] p-3 rounded-2xl">
                      <Store className="text-white" size={24} />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] lg:text-[9px] font-black uppercase tracking-[0.2em] text-[#F7931E]">
                          Distributed by
                        </span>
                        {/* Displaying the dynamic Follower Count */}
                        <span className="text-[9px] font-bold bg-gray-100 px-2 py-0.5 rounded-full text-[#4B4B4B]">
                          {followerCount.toLocaleString()} Followers
                        </span>
                      </div>
                      <Link 
                        href={`/store/${product.vendorProfile.store?.slug || product.vendorProfileId}`} 
                        className="flex items-center gap-1.5"
                      >
                        <span className="font-black italic uppercase text-xs lg:text-lg text-[#002B5B] hover:text-[#F7931E] transition-colors">
                          {product.vendorProfile.storeName}
                        </span>
                        {product.vendorProfile.isVerified && (
                          <CheckCircle2 size={16} className="text-blue-500 fill-blue-50" />
                        )}
                      </Link>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleFollowToggle}
                    className={`flex items-center gap-2 px-3 lg:px-5 py-3 lg:py-3 rounded-xl font-black uppercase text-[8px] lg:text-[10px] tracking-widest transition-all ${
                      isFollowing ? "bg-gray-100 text-[#4B4B4B]" : "bg-[#002B5B] text-white"
                    }`}
                  >
                    {isFollowing ? <UserCheck size={14} /> : <UserPlus size={14} />}
                    {isFollowing ? "Following" : "Follow"}
                  </button>
                </div>

                {/* Dynamic Performance Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-50">
                  {vendorMetrics.map((metric, idx) => (
                    <Metric 
                      key={idx}
                      icon={metric.icon} 
                      label={metric.label} 
                      val={metric.val} 
                      color={metric.color} 
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Price & Inventory Badge */}
            <div className="mb-10 p-8 bg-white rounded-[2.5rem] border border-gray-100 relative overflow-hidden">
              <div className="flex items-baseline gap-4 mb-2">
                <span className="text-xl font-black text-[#F7931E] italic">{formatNaira(currentPrice)}</span>
                {product.discountPrice && !selectedVariant && (
                  <span className="text-2xl text-[#4B4B4B] line-through font-bold italic opacity-50">{formatNaira(product.price)}</span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className={`h-2 w-2 rounded-full animate-pulse ${currentMaxStock > 5 ? 'bg-green-500' : 'bg-[#F7931E]'}`} />
                <p className="text-[#4B4B4B] text-[10px] font-black uppercase tracking-widest">{currentMaxStock > 0 ? `In Stock: ${currentMaxStock} Units Available` : "Out of Stock"}</p>
              </div>
            </div>

            {hasVariants && <VariantSelector variants={product.variants as any} selectedVariant={selectedVariant} onSelect={(v: any) => { setSelectedVariant(v); setQuantity(1); }} />}

            <div className="space-y-4 mb-12">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center justify-between bg-white rounded-2xl p-2 border border-gray-100 sm:w-44 shadow-sm">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 flex items-center justify-center text-[#002B5B] hover:bg-[#F8F8F8] rounded-xl transition-all"><Minus size={20} /></button>
                  <span className="font-black text-lg text-[#002B5B] italic px-4">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(currentMaxStock, quantity + 1))} className="w-12 h-12 flex items-center justify-center text-[#002B5B] hover:bg-[#F8F8F8] rounded-xl transition-all"><Plus size={20} /></button>
                </div>
                <button onClick={handleAddToCart} disabled={currentMaxStock <= 0} className="flex-1 bg-[#F7931E] text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:bg-[#002B5B] transition-all shadow-2xl shadow-[#F7931E]/30 flex items-center justify-center gap-3 disabled:bg-[#4B4B4B] group">
                  <ShoppingCart size={20} className="group-hover:rotate-12 transition-transform" /> {currentMaxStock > 0 ? "Add to Cart" : "Sold Out"}
                </button>
              </div>
              <ChatWithVendor vendorProfileId={product.vendorProfileId} productName={product.title} productId={product.id} productPrice={formatNaira(currentPrice)} productImage={product.images?.[0]?.url || "/logo.png"} />
            </div>

            <div className="grid grid-cols-3 gap-4 py-10 border-t border-gray-100">
              <Badge icon={<ShieldCheck size={28} />} title="Authentic" subtitle="Gear" />
              <Badge icon={<Truck size={28} />} title="Quantum" subtitle="Delivery" />
              <Badge icon={<RefreshCcw size={28} />} title="30-Day" subtitle="Return" />
            </div>
          </div>
        </div>

        <ProductTabs product={product} />

        {/* FIELD REPORTS (REVIEWS) SECTION */}
        <div id="field-reports" className="mt-32 border-t border-gray-100 pt-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div className="lg:col-span-2"><ReviewList /></div>
            <div className="lg:col-span-1"><div className="sticky top-24"><AddReview productId={product.id} /></div></div>
          </div>
        </div>
        
        {/* RELATED PRODUCTS SECTION */}
        <div className="mt-32">
          <h2 className="text-xl xl:text-2xl 2xl:text-4xl font-black italic uppercase text-[#002B5B] tracking-tighter mb-12">Related <span className="text-[#F7931E]">Product</span></h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {similarItems.map((item) => (
              <div key={item.id} onClick={() => navigateWithLoading(`/products/${item.slug}`)} className="group cursor-pointer">
                <div className="relative aspect-[4/5] bg-white rounded-[2.5rem] overflow-hidden mb-4 border border-gray-100 transition-all group-hover:-translate-y-2 group-hover:shadow-xl">
                  <Image src={item.imageUrl || "/placeholder.png"} alt={item.title} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-contain p-8" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest text-[#002B5B] mb-1 truncate px-2 group-hover:text-[#F7931E] transition-colors">{item.title}</h3>
                <p className="text-sm font-black italic text-[#F7931E] px-2">{formatNaira(item.price)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

//UI COMPONENTS
function Metric({ icon, label, val, color }: any) {
  return (
    <div className="flex flex-col items-center p-3 bg-gray-50 rounded-2xl border border-gray-100">
      <div className={`mb-1 ${color}`}>{icon}</div>
      <span className="text-[12px] font-black text-[#002B5B]">{val}</span>
      <span className="text-[7px] font-black uppercase text-neutral-gray tracking-tighter">{label}</span>
    </div>
  );
}

function Badge({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center md:items-start gap-2">
      <div className="text-[#F7931E]">{icon}</div>
      <span className="text-[9px] font-black uppercase text-[#002B5B] tracking-tighter leading-tight">{title}<br />{subtitle}</span>
    </div>
  );
}
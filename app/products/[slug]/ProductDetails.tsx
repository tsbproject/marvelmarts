"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingCart, ShieldCheck, Truck, 
  RefreshCcw, Plus, Minus, ChevronLeft, Star
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
import { formatNaira } from "@/app/lib/FormatNaira";
import { ProductWithRelations } from "./page";
import { SerializedProduct } from "@/types/product";
import Image from "next/image";

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

export default function ProductDetails({ product, similarItems }: ProductDetailsProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { notifySuccess, notifyError } = useNotification();
  const { setLoading } = useLoadingOverlay();

  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);

  // Sync loading state
  useEffect(() => {
    setLoading(false);
  }, [product.id, setLoading]);

  // Sync reviews with Redux Store for real-time updates
  useEffect(() => {
  if (product && Array.isArray(product.reviews)) {
    dispatch(setReviews(product.reviews as any));
  }
}, [product, dispatch]);
  const hasVariants = product.variants && product.variants.length > 0;
  const currentPrice = selectedVariant?.price 
    ? Number(selectedVariant.price) 
    : (product.discountPrice ?? product.price);
  const currentMaxStock = selectedVariant ? selectedVariant.stock : product.stock;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (hasVariants && !selectedVariant) {
      notifyError("Please select a variant first!");
      return;
    }

    const reduxProduct: SerializedProduct = {
      id: product.id,
      title: selectedVariant 
        ? `${product.title} (${selectedVariant.name})` 
        : product.title,
      slug: product.slug,
      price: Number(currentPrice),
      imageUrl: product.images?.[0]?.url || "/logo.png",
      categoryName: product.category?.name || "Tactical Gear",
      description: product.description || "",
      discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
      images: product.images || [{ url: "/logo.png" }],
      stock: currentMaxStock,
      createdAt: product.createdAt ? new Date(product.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: product.updatedAt ? new Date(product.updatedAt).toISOString() : new Date().toISOString(),
      variantId: selectedVariant?.id || "", 
    };
    
    dispatch(addToCart({ product: reduxProduct, quantity }));
    notifySuccess(`${reduxProduct.title} added to your stash!`);
  };

  const navigateWithLoading = (path: string) => {
    setLoading(true);
    router.push(path);
  };

  return (
    <div className="bg-[#F8F8F8] min-h-screen pb-20">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <button
          onClick={() => navigateWithLoading("/shop")}
          className="inline-flex items-center gap-2 text-[#4B4B4B] hover:text-[#F7931E] font-black uppercase text-[10px] tracking-[0.3em] mb-10 transition-colors group"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to the Armory
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-24 mb-20">
          
          {/* LEFT: Product Gallery */}
          <ProductGallery 
            images={product.images && product.images.length > 0 ? product.images : [{ url: "/logo.png" }]} 
            title={product.title} 
          />

          {/* RIGHT: Product Intel */}
          <div className="flex flex-col">
            <div className="mb-8">
              <p className="text-[#F7931E] font-black uppercase tracking-[0.4em] text-[10px] mb-4">
                {product.category?.name || "Tactical Asset"}
              </p>
              <h1 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter text-[#002B5B] leading-[0.9] mb-6">
                {product.title}
              </h1>
              
              <div className="flex items-center gap-6">
                <div className="flex items-center bg-[#002B5B] text-white px-3 py-1.5 rounded-xl gap-1.5">
                  <Star size={14} className="fill-[#F7931E] text-[#F7931E]" />
                  <span className="text-sm font-black italic">
                    {product.rating > 0 ? product.rating.toFixed(1) : "5.0"}
                  </span>
                </div>
                <button 
                  onClick={() => document.getElementById('field-reports')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-[#4B4B4B] hover:text-[#F7931E] transition-colors font-bold text-[10px] uppercase tracking-widest border-l border-gray-200 pl-6 flex items-center gap-2"
                >
                  {product.reviews.length} {product.reviews.length === 1 ? "Tactical Report" : "Tactical Reports"}
                </button>
              </div>
            </div>

            {/* Price & Inventory Badge */}
            <div className="mb-10 p-8 bg-white rounded-[2.5rem] border border-gray-100 relative overflow-hidden">
              <div className="flex items-baseline gap-4 mb-2">
                <span className="text-5xl font-black text-[#F7931E] italic">{formatNaira(currentPrice)}</span>
                {product.discountPrice && !selectedVariant && (
                  <span className="text-2xl text-[#4B4B4B] line-through font-bold italic opacity-50">{formatNaira(product.price)}</span>
                )}
              </div>
              
              <div className="flex items-center gap-2 mt-2">
                <div className={`h-2 w-2 rounded-full animate-pulse ${currentMaxStock > 5 ? 'bg-green-500' : 'bg-[#F7931E]'}`} />
                <p className="text-[#4B4B4B] text-[10px] font-black uppercase tracking-widest">
                  {currentMaxStock > 0 ? `In Stock: ${currentMaxStock} Units Secure` : "Out of Stock"}
                </p>
              </div>
            </div>

            {/* Variant Picker Component */}
            {hasVariants && (
              <VariantSelector 
                variants={product.variants} 
                selectedVariant={selectedVariant} 
                onSelect={(v) => { setSelectedVariant(v); setQuantity(1); }} 
              />
            )}

            {/* Quantity & CTA */}
            <div className="space-y-4 mb-12">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center justify-between bg-white rounded-2xl p-2 border border-gray-100 sm:w-44 shadow-sm">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 flex items-center justify-center text-[#002B5B] hover:bg-[#F8F8F8] rounded-xl transition-all">
                    <Minus size={20} />
                  </button>
                  <span className="font-black text-2xl text-[#002B5B] italic px-4">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(currentMaxStock, quantity + 1))} className="w-12 h-12 flex items-center justify-center text-[#002B5B] hover:bg-[#F8F8F8] rounded-xl transition-all">
                    <Plus size={20} />
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={currentMaxStock <= 0}
                  className="flex-1 bg-[#F7931E] text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:bg-[#002B5B] transition-all shadow-2xl shadow-[#F7931E]/30 flex items-center justify-center gap-3 active:scale-[0.98] disabled:bg-[#4B4B4B] group"
                >
                  <ShoppingCart size={20} className="group-hover:rotate-12 transition-transform" /> 
                  {currentMaxStock > 0 ? "Add to Loot Stash" : "Sold Out"}
                </button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 py-10 border-t border-gray-100">
              <Badge icon={<ShieldCheck size={28} />} title="Authentic" subtitle="Gear" />
              <Badge icon={<Truck size={28} />} title="Quantum" subtitle="Delivery" />
              <Badge icon={<RefreshCcw size={28} />} title="30-Day" subtitle="Return" />
            </div>
          </div>
        </div>

        {/* Technical Tabs (Description, Specifications, etc) */}
        <ProductTabs product={product} />

        
        {/* Field Reports (Reviews) Section */}
        <div id="field-reports" className="mt-32 border-t border-gray-100 pt-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div className="lg:col-span-2">
              <ReviewList reviews={product.reviews} />
            </div>
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <AddReview productId={product.id} />
              </div>
            </div>
          </div>
        </div>
        
        {/* Related Section */}
        <div className="mt-32">
          <h2 className="text-4xl font-black italic uppercase text-[#002B5B] tracking-tighter mb-12">
            Related <span className="text-[#F7931E]">Product</span>
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {similarItems.map((item) => (
              <div key={item.id} onClick={() => navigateWithLoading(`/products/${item.slug}`)} className="group cursor-pointer">
                <div className="relative aspect-[4/5] bg-white rounded-[2.5rem] overflow-hidden mb-4 border border-gray-100 transition-all group-hover:-translate-y-2 group-hover:shadow-xl">
                  <Image 
                    src={item.imageUrl || "/placeholder.png"} 
                    alt={item.title} 
                    fill 
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-contain p-8" 
                  />
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

function Badge({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center md:items-start gap-2">
      <div className="text-[#F7931E]">{icon}</div>
      <span className="text-[9px] font-black uppercase text-[#002B5B] tracking-tighter leading-tight">
        {title}<br />{subtitle}
      </span>
    </div>
  );
}





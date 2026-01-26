// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import Image from "next/image";
// import Link from "next/link";
// import { 
//   ShoppingCart, Star, ShieldCheck, Truck, 
//   RefreshCcw, Plus, Minus, ChevronLeft,
//   Share2, Heart, Eye, ChevronRight
// } from "lucide-react";

// // Redux & Context Imports
// import { useDispatch } from "react-redux";
// import { addToCart } from "@/store/cartSlice";
// import { useNotification } from "@/app/_context/NotificationContext";
// import { useLoadingOverlay } from "@/app/_context/LoadingOverlayContext"; 
// import ProductTabs from "@/app/_components/ProductTabs";
// import { formatNaira } from "@/app/lib/FormatNaira";
// import { ProductWithRelations } from "./page";

// interface ProductDetailsProps {
//   product: ProductWithRelations;
//   similarItems: {
//     id: string;
//     title: string;
//     slug: string;
//     price: number;
//     discountPrice: number | null;
//     imageUrl: string;
//   }[];
// }

// export default function ProductDetails({ product, similarItems }: ProductDetailsProps) {
//   const router = useRouter();
//   const dispatch = useDispatch();
//   const { notifySuccess } = useNotification(); 
//   const { setLoading } = useLoadingOverlay(); // Access the global loading state
  
//   const [quantity, setQuantity] = useState(1);
//   const [activeImage, setActiveImage] = useState(0);

//   const handleAddToCart = () => {
//     if (!product) return;
//     dispatch(addToCart({ 
//       product: {
//         id: product.id,
//         slug: product.slug,
//         title: product.title,
//         price: product.discountPrice ?? product.price,
//         imageUrl: product.images?.[0]?.url || "/placeholder.png"
//       }, 
//       quantity 
//     }));
//     notifySuccess(`${product.title} added to your stash!`);
//   };

//   // Helper for mobile production navigation
//   const navigateWithLoading = (path: string) => {
//     setLoading(true);
//     router.push(path);
//   };

//   const images = product.images?.length > 0 
//     ? product.images 
//     : [{ url: "/placeholder.png" }];

//   return (
//     <div className="bg-neutral-white min-h-screen pb-20">
//       <div className="container mx-auto px-4 py-8">
//         {/* Navigation - Button used for loading state control */}
//         <button 
//           onClick={() => navigateWithLoading("/shop")}
//           className="inline-flex items-center gap-2 text-neutral-gray hover:text-brand-primary font-black uppercase text-[10px] tracking-[0.3em] mb-10 transition-colors group"
//         >
//           <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
//           Back to the Armory
//         </button>

//         {/* Main Product Section */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-24 mb-20">
//           <div className="space-y-6">
//             <div className="relative aspect-square bg-neutral-light rounded-[3.5rem] overflow-hidden border border-neutral-light shadow-inner">
//               <Image 
//                 src={product.images[0]?.url || "/placeholder.png"} 
//                 alt={product.title}
//                 fill
//                 priority={true}          
//                 fetchPriority="high"     
//                 loading="eager"           
//                 sizes="(max-width: 768px) 100vw, 50vw"
//                 className="object-contain"
//               />
                
              
//             </div>
//             {images.length > 1 && (
//               <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
//                 {images.map((img: any, idx: number) => (
//                   <button 
//                     key={idx} 
//                     onClick={() => setActiveImage(idx)} 
//                     className={`relative w-24 h-24 shrink-0 rounded-[1.5rem] overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-brand-primary scale-95 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
//                   >
//                     <Image src={img.url} alt={`View ${idx}`} fill className="object-cover" />
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>

//           <div className="flex flex-col">
//             <div className="mb-8">
//               <div className="flex items-center justify-between mb-4">
//                 <p className="text-brand-primary font-black uppercase tracking-[0.4em] text-[10px]">
//                   {product.category?.name || "Tactical Asset"}
//                 </p>
//                 <div className="flex gap-2">
//                    <button className="p-2 text-neutral-gray hover:text-brand-primary transition-colors"><Share2 size={18}/></button>
//                    <button className="p-2 text-neutral-gray hover:text-red-500 transition-colors"><Heart size={18}/></button>
//                 </div>
//               </div>

//               <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-accent-navy leading-[0.9] mb-6">
//                 {product.title}
//               </h1>

//               <div className="flex items-center gap-6">
//                 <div className="flex items-center bg-accent-navy text-neutral-white px-3 py-1.5 rounded-xl gap-1.5">
//                   <Star size={14} className="fill-brand-primary text-brand-primary" />
//                   <span className="text-sm font-black italic">4.9</span>
//                 </div>
//                 <span className="text-neutral-gray font-bold text-[10px] uppercase tracking-widest border-l border-neutral-light pl-6">
//                   2,450 Verified Looters
//                 </span>
//               </div>
//             </div>

//             <div className="mb-10 p-8 bg-neutral-light rounded-[2.5rem] border border-neutral-light/50 relative overflow-hidden bg-gradient-to-br from-neutral-light to-brand-light/20">
//               <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
//               <div className="flex items-baseline gap-4 mb-2">
//                 <span className="text-5xl font-black text-brand-primary italic">
//                   {formatNaira(product.discountPrice ?? product.price)}
//                 </span>
//                 {product.discountPrice && (
//                   <span className="text-2xl text-neutral-gray line-through font-bold italic opacity-50">
//                     {formatNaira(product.price)}
//                   </span>
//                 )}
//               </div>
//               <p className="text-neutral-gray text-[10px] font-black uppercase tracking-widest">Free Shipping for Academy members</p>
//             </div>

//             <div className="space-y-4 mb-12">
//                <h3 className="text-[10px] font-black uppercase tracking-widest text-accent-navy ml-1">Deploy Quantity</h3>
//                <div className="flex flex-col sm:flex-row gap-4">
//                 <div className="flex items-center justify-between bg-neutral-light rounded-2xl p-2 border border-neutral-light sm:w-44">
//                   <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 flex items-center justify-center text-accent-navy hover:bg-neutral-white rounded-xl transition-all">
//                     <Minus size={20} />
//                   </button>
//                   <span className="font-black text-2xl text-accent-navy italic px-4">{quantity}</span>
//                   <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-12 flex items-center justify-center text-accent-navy hover:bg-neutral-white rounded-xl transition-all">
//                     <Plus size={20} />
//                   </button>
//                 </div>
//                 <button 
//                   onClick={handleAddToCart} 
//                   className="flex-1 bg-brand-primary text-neutral-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:bg-accent-navy transition-all shadow-2xl shadow-brand-primary/30 flex items-center justify-center gap-3 active:scale-[0.98] group"
//                 >
//                   <ShoppingCart size={20} className="group-hover:rotate-12 transition-transform" /> Add to Loot Stash
//                 </button>
//               </div>
//             </div>

//             <div className="grid grid-cols-3 gap-4 py-10 border-t border-neutral-light">
//                <Badge icon={<ShieldCheck size={28}/>} title="Authentic" subtitle="Gear" />
//                <Badge icon={<Truck size={28}/>} title="Quantum" subtitle="Delivery" />
//                <Badge icon={<RefreshCcw size={28}/>} title="30-Day" subtitle="Return" />
//             </div>
//           </div>
//         </div>

//         <ProductTabs product={product} />

//         {/* Related Products Grid */}
//         <div className="mt-32">
//           <div className="flex items-end justify-between mb-12">
//             <div>
//               <p className="text-brand-primary font-black uppercase tracking-[0.4em] text-[10px] mb-2">You might also like</p>
//               <h2 className="text-4xl font-black italic uppercase text-accent-navy tracking-tighter">Related <span className="text-brand-primary">Loot</span></h2>
//             </div>
//             <button 
//               onClick={() => navigateWithLoading("/shop")}
//               className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border-b-2 border-brand-primary pb-1 hover:text-brand-primary transition-all"
//             >
//               View All Armory <ChevronRight size={14} />
//             </button>
//           </div>

//           <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
//             {similarItems.length > 0 ? (
//               similarItems.map((item) => (
//                 <div 
//                   key={item.id} 
//                   onClick={() => navigateWithLoading(`/products/${item.slug}`)} 
//                   className="group cursor-pointer"
//                 >
//                   <div className="relative aspect-[4/5] bg-neutral-light rounded-[2.5rem] overflow-hidden mb-4 border border-neutral-light transition-all group-hover:shadow-2xl group-hover:shadow-brand-primary/10 group-hover:-translate-y-2">
//                     <Image 
//                       src={item.imageUrl || "/placeholder.png"} 
//                       alt={item.title} 
//                       fill 
//                       className="object-contain p-8 transition-transform duration-500 group-hover:scale-110" 
//                     />
//                     <div className="absolute inset-0 bg-accent-navy/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
//                       <div className="bg-neutral-white p-4 rounded-2xl text-accent-navy shadow-xl"><Eye size={20} /></div>
//                     </div>
//                   </div>
//                   <h3 className="text-xs font-black uppercase tracking-widest text-accent-navy mb-1 group-hover:text-brand-primary transition-colors truncate">{item.title}</h3>
//                   <p className="text-sm font-black italic text-brand-primary">{formatNaira(item.price)}</p>
//                 </div>
//               ))
//             ) : (
//               [1, 2, 3, 4].map((i) => (
//                 <div key={i} className="aspect-[4/5] bg-neutral-light rounded-[2.5rem] animate-pulse" />
//               ))
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function Badge({ icon, title, subtitle }: { icon: React.ReactNode, title: string, subtitle: string }) {
//   return (
//     <div className="flex flex-col items-center md:items-start gap-2">
//       <div className="text-brand-primary">{icon}</div>
//       <span className="text-[9px] font-black uppercase text-accent-navy tracking-tighter leading-tight">
//         {title}<br/>{subtitle}
//       </span>
//     </div>
//   );
// }



"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ShoppingCart,
  Star,
  ShieldCheck,
  Truck,
  RefreshCcw,
  Plus,
  Minus,
  ChevronLeft,
  Share2,
  Heart,
  Eye,
  ChevronRight,
} from "lucide-react";

// Redux & Context
import { useDispatch } from "react-redux";
import { addToCart } from "@/store/cartSlice";
import { useNotification } from "@/app/_context/NotificationContext";
import { useLoadingOverlay } from "@/app/_context/LoadingOverlayContext";

// Components & Utils
import ProductTabs from "@/app/_components/ProductTabs";
import { formatNaira } from "@/app/lib/FormatNaira";
import { ProductWithRelations } from "./page";

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

export default function ProductDetails({
  product,
  similarItems,
}: ProductDetailsProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { notifySuccess } = useNotification();
  const { setLoading } = useLoadingOverlay();

  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  /* --------------------------------------------
   Image Safety (no hydration tricks needed)
  --------------------------------------------- */
  const displayImages =
    product.images && product.images.length > 0
      ? product.images
      : [{ url: "/placeholder.png" }];

  useEffect(() => {
    if (activeImage >= displayImages.length) {
      setActiveImage(0);
    }
  }, [activeImage, displayImages.length]);

  /* --------------------------------------------
   Actions
  --------------------------------------------- */
  const handleAddToCart = () => {
    dispatch(
      addToCart({
        product: {
          id: product.id,
          slug: product.slug,
          title: product.title,
          price: product.discountPrice ?? product.price,
          imageUrl: product.images?.[0]?.url || "/placeholder.png",
        },
        quantity,
      })
    );

    notifySuccess(`${product.title} added to your stash!`);
  };

  const navigateWithLoading = (path: string) => {
    setLoading(true);
    router.push(path);
  };

  return (
    <div className="bg-neutral-white min-h-screen pb-20">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <button
          onClick={() => navigateWithLoading("/shop")}
          className="inline-flex items-center gap-2 text-neutral-gray hover:text-brand-primary font-black uppercase text-[10px] tracking-[0.3em] mb-10 transition-colors group"
        >
          <ChevronLeft
            size={16}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Back to the Armory
        </button>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-24 mb-20">
          {/* Images */}
          <div className="space-y-6">
            <div className="relative aspect-square bg-neutral-light rounded-[3.5rem] overflow-hidden border border-neutral-light shadow-inner">
              <Image
                src={displayImages[activeImage].url}
                alt={product.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain p-8"
              />
            </div>

            {displayImages.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                {displayImages.map((img, idx) => (
                  <button
                    key={img.url ?? idx}
                    onClick={() => setActiveImage(idx)}
                    className={`relative w-24 h-24 shrink-0 rounded-[1.5rem] overflow-hidden border-2 transition-all ${
                      activeImage === idx
                        ? "border-brand-primary scale-95 shadow-lg"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={`View ${idx}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <p className="text-brand-primary font-black uppercase tracking-[0.4em] text-[10px]">
                  {product.category?.name || "Tactical Asset"}
                </p>
                <div className="flex gap-2">
                  <button className="p-2 text-neutral-gray hover:text-brand-primary transition-colors">
                    <Share2 size={18} />
                  </button>
                  <button className="p-2 text-neutral-gray hover:text-red-500 transition-colors">
                    <Heart size={18} />
                  </button>
                </div>
              </div>

              <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-accent-navy leading-[0.9] mb-6">
                {product.title}
              </h1>

              <div className="flex items-center gap-6">
                <div className="flex items-center bg-accent-navy text-neutral-white px-3 py-1.5 rounded-xl gap-1.5">
                  <Star
                    size={14}
                    className="fill-brand-primary text-brand-primary"
                  />
                  <span className="text-sm font-black italic">4.9</span>
                </div>
                <span className="text-neutral-gray font-bold text-[10px] uppercase tracking-widest border-l border-neutral-light pl-6">
                  2,450 Verified Looters
                </span>
              </div>
            </div>

            {/* Pricing */}
            <div className="mb-10 p-8 bg-neutral-light rounded-[2.5rem] border border-neutral-light/50 relative overflow-hidden bg-gradient-to-br from-neutral-light to-brand-light/20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
              <div className="flex items-baseline gap-4 mb-2">
                <span className="text-5xl font-black text-brand-primary italic">
                  {formatNaira(product.discountPrice ?? product.price)}
                </span>
                {product.discountPrice && (
                  <span className="text-2xl text-neutral-gray line-through font-bold italic opacity-50">
                    {formatNaira(product.price)}
                  </span>
                )}
              </div>
              <p className="text-neutral-gray text-[10px] font-black uppercase tracking-widest">
                Free Shipping for Academy members
              </p>
            </div>

            {/* Quantity + Cart */}
            <div className="space-y-4 mb-12">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-accent-navy ml-1">
                Deploy Quantity
              </h3>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center justify-between bg-neutral-light rounded-2xl p-2 border border-neutral-light sm:w-44">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 flex items-center justify-center text-accent-navy hover:bg-neutral-white rounded-xl transition-all"
                  >
                    <Minus size={20} />
                  </button>

                  <span className="font-black text-2xl text-accent-navy italic px-4">
                    {quantity}
                  </span>

                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 flex items-center justify-center text-accent-navy hover:bg-neutral-white rounded-xl transition-all"
                  >
                    <Plus size={20} />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-brand-primary text-neutral-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:bg-accent-navy transition-all shadow-2xl shadow-brand-primary/30 flex items-center justify-center gap-3 active:scale-[0.98] group"
                >
                  <ShoppingCart
                    size={20}
                    className="group-hover:rotate-12 transition-transform"
                  />
                  Add to Loot Stash
                </button>
              </div>
            </div>

            {/* Badges */}
            <div className="grid grid-cols-3 gap-4 py-10 border-t border-neutral-light">
              <Badge icon={<ShieldCheck size={28} />} title="Authentic" subtitle="Gear" />
              <Badge icon={<Truck size={28} />} title="Quantum" subtitle="Delivery" />
              <Badge icon={<RefreshCcw size={28} />} title="30-Day" subtitle="Return" />
            </div>
          </div>
        </div>

        <ProductTabs product={product} />

        {/* Related Products */}
        <div className="mt-32">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-brand-primary font-black uppercase tracking-[0.4em] text-[10px] mb-2">
                You might also like
              </p>
              <h2 className="text-4xl font-black italic uppercase text-accent-navy tracking-tighter">
                Related <span className="text-brand-primary">Loot</span>
              </h2>
            </div>

            <button
              onClick={() => navigateWithLoading("/shop")}
              className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border-b-2 border-brand-primary pb-1 hover:text-brand-primary transition-all"
            >
              View All Products <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {similarItems.length > 0
              ? similarItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() =>
                      navigateWithLoading(`/products/${item.slug}`)
                    }
                    className="group cursor-pointer"
                  >
                    <div className="relative aspect-[4/5] bg-neutral-light rounded-[2.5rem] overflow-hidden mb-4 border border-neutral-light transition-all group-hover:shadow-2xl group-hover:shadow-brand-primary/10 group-hover:-translate-y-2">
                      <Image
                        src={item.imageUrl || "/placeholder.png"}
                        alt={item.title}
                        fill
                        className="object-contain p-8 transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-accent-navy/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="bg-neutral-white p-4 rounded-2xl text-accent-navy shadow-xl">
                          <Eye size={20} />
                        </div>
                      </div>
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-accent-navy mb-1 group-hover:text-brand-primary transition-colors truncate px-2">
                      {item.title}
                    </h3>
                    <p className="text-sm font-black italic text-brand-primary px-2">
                      {formatNaira(item.price)}
                    </p>
                  </div>
                ))
              : [1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="aspect-[4/5] bg-neutral-light rounded-[2.5rem] animate-pulse"
                  />
                ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------
 Badge Component
--------------------------------------------- */
function Badge({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex flex-col items-center md:items-start gap-2">
      <div className="text-brand-primary">{icon}</div>
      <span className="text-[9px] font-black uppercase text-accent-navy tracking-tighter leading-tight">
        {title}
        <br />
        {subtitle}
      </span>
    </div>
  );
}

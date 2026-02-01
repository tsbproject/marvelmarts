// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import Image from "next/image";
// import {
//   ShoppingCart, Star, ShieldCheck, Truck, 
//   RefreshCcw, Plus, Minus, ChevronLeft,
//   Share2, Heart, Eye, ChevronRight
// } from "lucide-react";

// // Redux & Context
// import { useDispatch } from "react-redux";
// import { addToCart } from "@/store/cartSlice";
// import { useNotification } from "@/app/_context/NotificationContext";
// import { useLoadingOverlay } from "@/app/_context/LoadingOverlayContext";

// // Components & Utils
// import ProductTabs from "@/app/_components/ProductTabs";
// import { formatNaira } from "@/app/lib/FormatNaira";
// import { ProductWithRelations } from "./page";
// import { SerializedProduct } from "@/types/product";

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
//   const { notifySuccess, notifyError } = useNotification();
//   const { setLoading } = useLoadingOverlay();

//   useEffect(() => {
//     setLoading(false);
//   }, [product.id, setLoading]);

//   const [quantity, setQuantity] = useState(1);
//   const [activeImage, setActiveImage] = useState(0);
//   const [selectedVariant, setSelectedVariant] = useState<any>(null);

//   // Derived State
//   const hasVariants = product.variants && product.variants.length > 0;
//   const currentPrice = selectedVariant?.price 
//     ? Number(selectedVariant.price) 
//     : (product.discountPrice ?? product.price);
//   const currentMaxStock = selectedVariant ? selectedVariant.stock : product.stock;

//   const displayImages = product.images && product.images.length > 0
//       ? product.images
//       : [{ url: "/placeholder.png" }];

//   const handleAddToCart = (e: React.MouseEvent) => {
//     e.preventDefault();

//     if (hasVariants && !selectedVariant) {
//       notifyError("Please select a variant first!");
//       return;
//     }

//     // Construct the full SerializedProduct object to satisfy TypeScript
//     const reduxProduct: SerializedProduct = {
//       id: product.id,
//       title: selectedVariant 
//         ? `${product.title} (${selectedVariant.name})` 
//         : product.title,
//       slug: product.slug,
//       price: currentPrice,
//       imageUrl: displayImages[0]?.url || "/logo.png",
//       categoryName: product.category?.name || "Tactical Gear",
//       // Adding missing required fields for SerializedProduct type
//       description: product.description || "",
//       discountPrice: product.discountPrice || null,
//       images: product.images || [{ url: "/logo.png" }],
//       stock: currentMaxStock,
//       createdAt: product.createdAt ? new Date(product.createdAt) : new Date(),
//       updatedAt: product.updatedAt ? new Date(product.updatedAt) : new Date(),
//       // Adding variant specific data if applicable
//       variantId: selectedVariant?.id || null,
//       variantName: selectedVariant?.name || undefined,
//     };

//     dispatch(addToCart({ 
//       product: reduxProduct, 
//       quantity: quantity 
//     }));

//     notifySuccess(`${reduxProduct.title} added to your stash!`);

//     // Background sync
//     fetch("/api/cart", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         productId: product.id,
//         variantId: selectedVariant?.id || null,
//         qty: quantity,
//       }),
//     }).catch(err => console.error("Sync error:", err));
//   };

//   const navigateWithLoading = (path: string) => {
//     setLoading(true);
//     router.push(path);
//   };

//   return (
//     <div className="bg-neutral-white min-h-screen pb-20">
//       <div className="container mx-auto px-4 py-8">
//         <button
//           onClick={() => navigateWithLoading("/shop")}
//           className="inline-flex items-center gap-2 text-neutral-gray hover:text-brand-primary font-black uppercase text-[10px] tracking-[0.3em] mb-10 transition-colors group"
//         >
//           <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
//           Back to the Armory
//         </button>

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-24 mb-20">
//           {/* Left: Images */}
//           <div className="space-y-6">
//             <div className="relative aspect-square bg-neutral-light rounded-[3.5rem] overflow-hidden border border-neutral-light shadow-inner">
//               <Image
//                 src={displayImages[activeImage].url}
//                 alt={product.title}
//                 fill
//                 priority
//                 sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
//                 className="object-contain p-8"
//               />
//             </div>
//             {displayImages.length > 1 && (
//               <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
//                 {displayImages.map((img, idx) => (
//                   <button
//                     key={idx}
//                     onClick={() => setActiveImage(idx)}
//                     className={`relative w-24 h-24 shrink-0 rounded-[1.5rem] overflow-hidden border-2 transition-all ${
//                       activeImage === idx ? "border-brand-primary scale-95 shadow-lg" : "border-transparent opacity-60 hover:opacity-100"
//                     }`}
//                   >
//                     <Image src={img.url} alt={`View ${idx}`} fill className="object-cover" />
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Right: Info */}
//           <div className="flex flex-col">
//             <div className="mb-8">
//               <p className="text-brand-primary font-black uppercase tracking-[0.4em] text-[10px] mb-4">
//                 {product.category?.name || "Tactical Asset"}
//               </p>
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
//               <div className="flex items-baseline gap-4 mb-2">
//                 <span className="text-5xl font-black text-brand-primary italic">
//                   {formatNaira(currentPrice)}
//                 </span>
//                 {product.discountPrice && !selectedVariant && (
//                   <span className="text-2xl text-neutral-gray line-through font-bold italic opacity-50">
//                     {formatNaira(product.price)}
//                   </span>
//                 )}
//               </div>
//               <p className="text-neutral-gray text-[10px] font-black uppercase tracking-widest">
//                 {currentMaxStock > 0 ? `In Stock: ${currentMaxStock} units available` : "Out of Stock"}
//               </p>
//             </div>

//             {/* Variant Picker */}
//             {hasVariants && (
//               <div className="mb-8 space-y-4">
//                 <h3 className="text-[10px] font-black uppercase tracking-widest text-accent-navy ml-1">Choose Loadout</h3>
//                 <div className="flex flex-wrap gap-3">
//                   {product.variants.map((variant) => (
//                     <button
//                       key={variant.id}
//                       disabled={variant.stock <= 0}
//                       onClick={() => {
//                         setSelectedVariant(variant);
//                         setQuantity(1);
//                       }}
//                       className={`px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all border-2 
//                         ${selectedVariant?.id === variant.id 
//                           ? "bg-accent-navy text-neutral-white border-accent-navy scale-95 shadow-lg" 
//                           : "bg-neutral-white text-accent-navy border-neutral-light hover:border-brand-primary"}
//                         ${variant.stock <= 0 ? "opacity-30 cursor-not-allowed grayscale" : ""}`}
//                     >
//                       {variant.name}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Quantity & CTA */}
//             <div className="space-y-4 mb-12">
//               <h3 className="text-[10px] font-black uppercase tracking-widest text-accent-navy ml-1">Deploy Quantity</h3>
//               <div className="flex flex-col sm:flex-row gap-4">
//                 <div className="flex items-center justify-between bg-neutral-light rounded-2xl p-2 border border-neutral-light sm:w-44">
//                   <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 flex items-center justify-center text-accent-navy hover:bg-neutral-white rounded-xl transition-all">
//                     <Minus size={20} />
//                   </button>
//                   <span className="font-black text-2xl text-accent-navy italic px-4">{quantity}</span>
//                   <button 
//                     onClick={() => setQuantity(Math.min(currentMaxStock, quantity + 1))} 
//                     className="w-12 h-12 flex items-center justify-center text-accent-navy hover:bg-neutral-white rounded-xl transition-all"
//                     disabled={quantity >= currentMaxStock}
//                   >
//                     <Plus size={20} />
//                   </button>
//                 </div>
//                 <button
//                   onClick={handleAddToCart}
//                   disabled={currentMaxStock <= 0}
//                   className="flex-1 bg-brand-primary text-neutral-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:bg-accent-navy transition-all shadow-2xl shadow-brand-primary/30 flex items-center justify-center gap-3 active:scale-[0.98] disabled:bg-neutral-gray disabled:shadow-none group"
//                 >
//                   <ShoppingCart size={20} className="group-hover:rotate-12 transition-transform" /> 
//                   {currentMaxStock > 0 ? "Add to Loot Stash" : "Sold Out"}
//                 </button>
//               </div>
//             </div>

//             {/* Badges */}
//             <div className="grid grid-cols-3 gap-4 py-10 border-t border-neutral-light">
//               <Badge icon={<ShieldCheck size={28} />} title="Authentic" subtitle="Gear" />
//               <Badge icon={<Truck size={28} />} title="Quantum" subtitle="Delivery" />
//               <Badge icon={<RefreshCcw size={28} />} title="30-Day" subtitle="Return" />
//             </div>
//           </div>
//         </div>

//         <ProductTabs product={product} />
        
//         {/* Related Products */}
//         <div className="mt-32">
//           <div className="flex items-end justify-between mb-12">
//             <div>
//               <p className="text-brand-primary font-black uppercase tracking-[0.4em] text-[10px] mb-2">You might also like</p>
//               <h2 className="text-4xl font-black italic uppercase text-accent-navy tracking-tighter">
//                 Related <span className="text-brand-primary">Loot</span>
//               </h2>
//             </div>
//             <button
//               onClick={() => navigateWithLoading("/shop")}
//               className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border-b-2 border-brand-primary pb-1 hover:text-brand-primary transition-all"
//             >
//               View All Products <ChevronRight size={14} />
//             </button>
//           </div>

//           <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
//             {similarItems.map((item) => (
//               <div
//                 key={item.id}
//                 onClick={() => navigateWithLoading(`/products/${item.slug}`)}
//                 className="group cursor-pointer"
//               >
//                 <div className="relative aspect-[4/5] bg-neutral-light rounded-[2.5rem] overflow-hidden mb-4 border border-neutral-light transition-all group-hover:shadow-2xl group-hover:shadow-brand-primary/10 group-hover:-translate-y-2">
//                   <Image
//                     src={item.imageUrl || "/placeholder.png"}
//                     alt={item.title}
//                     fill
//                     className="object-contain p-8 transition-transform duration-500 group-hover:scale-110"
//                   />
//                   <div className="absolute inset-0 bg-accent-navy/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
//                     <div className="bg-neutral-white p-4 rounded-2xl text-accent-navy shadow-xl">
//                       <Eye size={20} />
//                     </div>
//                   </div>
//                 </div>
//                 <h3 className="text-xs font-black uppercase tracking-widest text-accent-navy mb-1 group-hover:text-brand-primary transition-colors truncate px-2">
//                   {item.title}
//                 </h3>
//                 <p className="text-sm font-black italic text-brand-primary px-2">
//                   {formatNaira(item.price)}
//                 </p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function Badge({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
//   return (
//     <div className="flex flex-col items-center md:items-start gap-2">
//       <div className="text-brand-primary">{icon}</div>
//       <span className="text-[9px] font-black uppercase text-accent-navy tracking-tighter leading-tight">
//         {title}<br />{subtitle}
//       </span>
//     </div>
//   );
// }






"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ShoppingCart, Star, ShieldCheck, Truck, 
  RefreshCcw, Plus, Minus, ChevronLeft,
  Share2, Heart, Eye, ChevronRight
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
import { SerializedProduct } from "@/types/product";

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

  // Zoom Logic State
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, [product.id, setLoading]);

  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);

  const hasVariants = product.variants && product.variants.length > 0;
  const currentPrice = selectedVariant?.price 
    ? Number(selectedVariant.price) 
    : (product.discountPrice ?? product.price);
  const currentMaxStock = selectedVariant ? selectedVariant.stock : product.stock;

  const displayImages = product.images && product.images.length > 0
      ? product.images
      : [{ url: "/placeholder.png" }];

  // --- Zoom Handler ---
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    
    // Calculate percentage position of mouse within the container
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    
    setMousePos({ x, y });
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (hasVariants && !selectedVariant) {
      notifyError("Please select a variant first!");
      return;
    }

    const reduxProduct: SerializedProduct = {
      id: product.id,
      title: selectedVariant ? `${product.title} (${selectedVariant.name})` : product.title,
      slug: product.slug,
      price: currentPrice,
      imageUrl: displayImages[0]?.url || "/logo.png",
      categoryName: product.category?.name || "Tactical Gear",
      description: product.description || "",
      discountPrice: product.discountPrice || null,
      images: product.images || [{ url: "/logo.png" }],
      stock: currentMaxStock,
      createdAt: product.createdAt ? new Date(product.createdAt) : new Date(),
      updatedAt: product.updatedAt ? new Date(product.updatedAt) : new Date(),
      variantId: selectedVariant?.id || null,
    };

    dispatch(addToCart({ product: reduxProduct, quantity }));
    notifySuccess(`${reduxProduct.title} added to your stash!`);
  };

  const navigateWithLoading = (path: string) => {
    setLoading(true);
    router.push(path);
  };

  return (
    <div className="bg-neutral-white min-h-screen pb-20">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigateWithLoading("/shop")}
          className="inline-flex items-center gap-2 text-neutral-gray hover:text-brand-primary font-black uppercase text-[10px] tracking-[0.3em] mb-10 transition-colors group"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to the Armory
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-24 mb-20">
          {/* Left: Interactive Image Stash */}
          <div className="space-y-6">
            <div 
              ref={containerRef}
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              className="relative aspect-square bg-neutral-light rounded-[3.5rem] overflow-hidden border border-neutral-light shadow-inner cursor-zoom-in"
            >
              <div 
                className="relative w-full h-full transition-transform duration-200 ease-out"
                style={{
                  transform: isHovering ? "scale(2)" : "scale(1)",
                  transformOrigin: `${mousePos.x}% ${mousePos.y}%`
                }}
              >
                <Image
                  src={displayImages[activeImage].url}
                  alt={product.title}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain p-8"
                />
              </div>
            </div>

            {/* Thumbnails */}
            {displayImages.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                {displayImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`relative w-24 h-24 shrink-0 rounded-[1.5rem] overflow-hidden border-2 transition-all ${
                      activeImage === idx ? "border-brand-primary scale-95 shadow-lg" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image src={img.url} alt={`View ${idx}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Intel & Actions */}
          <div className="flex flex-col">
            <div className="mb-8">
              <p className="text-brand-primary font-black uppercase tracking-[0.4em] text-[10px] mb-4">
                {product.category?.name || "Tactical Asset"}
              </p>
              <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-accent-navy leading-[0.9] mb-6">
                {product.title}
              </h1>
              <div className="flex items-center gap-6">
                <div className="flex items-center bg-accent-navy text-neutral-white px-3 py-1.5 rounded-xl gap-1.5">
                  <Star size={14} className="fill-brand-primary text-brand-primary" />
                  <span className="text-sm font-black italic">4.9</span>
                </div>
                <span className="text-neutral-gray font-bold text-[10px] uppercase tracking-widest border-l border-neutral-light pl-6">
                  2,450 Verified Looters
                </span>
              </div>
            </div>

            <div className="mb-10 p-8 bg-neutral-light rounded-[2.5rem] border border-neutral-light/50 relative overflow-hidden bg-gradient-to-br from-neutral-light to-brand-light/20">
              <div className="flex items-baseline gap-4 mb-2">
                <span className="text-5xl font-black text-brand-primary italic">{formatNaira(currentPrice)}</span>
                {product.discountPrice && !selectedVariant && (
                  <span className="text-2xl text-neutral-gray line-through font-bold italic opacity-50">{formatNaira(product.price)}</span>
                )}
              </div>
              <p className="text-neutral-gray text-[10px] font-black uppercase tracking-widest">
                {currentMaxStock > 0 ? `In Stock: ${currentMaxStock} units available` : "Out of Stock"}
              </p>
            </div>

            {/* Variant Picker */}
            {hasVariants && (
              <div className="mb-8 space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-accent-navy ml-1">Choose Loadout</h3>
                <div className="flex flex-wrap gap-3">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      disabled={variant.stock <= 0}
                      onClick={() => { setSelectedVariant(variant); setQuantity(1); }}
                      className={`px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all border-2 
                        ${selectedVariant?.id === variant.id ? "bg-accent-navy text-neutral-white border-accent-navy scale-95 shadow-lg" : "bg-neutral-white text-accent-navy border-neutral-light hover:border-brand-primary"}
                        ${variant.stock <= 0 ? "opacity-30 cursor-not-allowed grayscale" : ""}`}
                    >
                      {variant.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & CTA */}
            <div className="space-y-4 mb-12">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center justify-between bg-neutral-light rounded-2xl p-2 border border-neutral-light sm:w-44">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 flex items-center justify-center text-accent-navy hover:bg-neutral-white rounded-xl transition-all">
                    <Minus size={20} />
                  </button>
                  <span className="font-black text-2xl text-accent-navy italic px-4">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(currentMaxStock, quantity + 1))} className="w-12 h-12 flex items-center justify-center text-accent-navy hover:bg-neutral-white rounded-xl transition-all">
                    <Plus size={20} />
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={currentMaxStock <= 0}
                  className="flex-1 bg-brand-primary text-neutral-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:bg-accent-navy transition-all shadow-2xl shadow-brand-primary/30 flex items-center justify-center gap-3 active:scale-[0.98] disabled:bg-neutral-gray group"
                >
                  <ShoppingCart size={20} className="group-hover:rotate-12 transition-transform" /> 
                  {currentMaxStock > 0 ? "Add to Loot Stash" : "Sold Out"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 py-10 border-t border-neutral-light">
              <Badge icon={<ShieldCheck size={28} />} title="Authentic" subtitle="Gear" />
              <Badge icon={<Truck size={28} />} title="Quantum" subtitle="Delivery" />
              <Badge icon={<RefreshCcw size={28} />} title="30-Day" subtitle="Return" />
            </div>
          </div>
        </div>

        <ProductTabs product={product} />
        
        {/* Related Section */}
        <div className="mt-32">
          <h2 className="text-4xl font-black italic uppercase text-accent-navy tracking-tighter mb-12">
            Related <span className="text-brand-primary">Loot</span>
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {similarItems.map((item) => (
              <div key={item.id} onClick={() => navigateWithLoading(`/products/${item.slug}`)} className="group cursor-pointer">
                <div className="relative aspect-[4/5] bg-neutral-light rounded-[2.5rem] overflow-hidden mb-4 border border-neutral-light transition-all group-hover:-translate-y-2">
                  <Image src={item.imageUrl || "/placeholder.png"} alt={item.title} fill className="object-contain p-8" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest text-accent-navy mb-1 truncate px-2">{item.title}</h3>
                <p className="text-sm font-black italic text-brand-primary px-2">{formatNaira(item.price)}</p>
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
      <div className="text-brand-primary">{icon}</div>
      <span className="text-[9px] font-black uppercase text-accent-navy tracking-tighter leading-tight">
        {title}<br />{subtitle}
      </span>
    </div>
  );
}




// "use client";

// import { useState, useEffect } from "react";
// import { useParams, useRouter } from "next/navigation";
// import Image from "next/image";
// import Link from "next/link";
// import { 
//   ShoppingCart, Star, ShieldCheck, Truck, 
//   RefreshCcw, Plus, Minus, Loader2, ChevronLeft,
//   Share2, Heart
// } from "lucide-react";

// // Redux & Context Imports
// import { useDispatch } from "react-redux";
// import { addToCart } from "@/store/cartSlice";
// import { useNotification } from "@/app/_context/NotificationContext";

// export default function PublicProductPage() {
//   const { slug } = useParams();
//   const router = useRouter();
//   const dispatch = useDispatch();
  
//   // Directly using the specific notifySuccess method from your context
//   const { notifySuccess } = useNotification(); 
  
//   const [product, setProduct] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [quantity, setQuantity] = useState(1);
//   const [activeImage, setActiveImage] = useState(0);
  
//   // Tab State Management
//   const [activeTab, setActiveTab] = useState("DESCRIPTION");

//   useEffect(() => {
//     const fetchProduct = async () => {
//       try {
//         setLoading(true);
//         const res = await fetch(`/api/products/${slug}`);
//         const data = await res.json();

//         if (data.success) {
//           setProduct(data.product);
//         } else {
//           router.push("/shop");
//         }
//       } catch (err) {
//         console.error("Fetch error:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (slug) fetchProduct();
//   }, [slug, router]);

//   const handleAddToCart = () => {
//     if (!product) return;

//     dispatch(addToCart({ 
//       product: {
//         id: product.id,
//         slug: product.slug,
//         title: product.title,
//         price: product.price,
//         imageUrl: product.imageUrl || product.images?.[0]?.url 
//       }, 
//       quantity 
//     }));
    
//     // Correctly triggering the notifySuccess method
//     notifySuccess(`${product.title} added to your stash!`);
//   };

//   if (loading) return (
//     <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-white">
//       <Loader2 className="w-12 h-12 text-brand-primary animate-spin mb-4" />
//       <p className="text-accent-navy font-black uppercase tracking-widest text-[10px]">Accessing Database...</p>
//     </div>
//   );

//   if (!product) return null;

//   const images = product.images?.length > 0 
//     ? product.images 
//     : [{ url: product.imageUrl || "/images/placeholder.jpg" }];

//   // Tab definitions matching your screenshot
//   const tabs = [
//     "DESCRIPTION", "BRAND", "REVIEWS (0)", "SHIPPING & DELIVERY", 
//     "MORE OFFERS", "STORE POLICIES", "INQUIRIES"
//   ];

//   return (
//     <div className="bg-neutral-white min-h-screen pb-20">
//       <div className="container mx-auto px-4 py-8">
//         <Link href="/shop" className="inline-flex items-center gap-2 text-neutral-gray hover:text-brand-primary font-black uppercase text-[10px] tracking-widest mb-10 transition-colors group">
//           <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
//           Back to the Armory
//         </Link>

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-24 mb-20">
//           {/* LEFT: Image Gallery */}
//           <div className="space-y-6">
//             <div className="relative aspect-square bg-neutral-light rounded-[3rem] overflow-hidden border border-neutral-light shadow-inner">
//               <Image 
//                 src={images[activeImage]?.url} 
//                 alt={product.title} 
//                 fill 
//                 className="object-cover transition-transform duration-700 hover:scale-110" 
//                 priority
//               />
//             </div>
//             {images.length > 1 && (
//               <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
//                 {images.map((img: any, idx: number) => (
//                   <button 
//                     key={idx} 
//                     onClick={() => setActiveImage(idx)}
//                     className={`relative w-24 h-24 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-brand-primary scale-95 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
//                   >
//                     <Image src={img.url} alt={`View ${idx}`} fill className="object-cover" />
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* RIGHT: Product Info */}
//           <div className="flex flex-col">
//             <div className="mb-8">
//               <div className="flex items-center justify-between mb-4">
//                 <p className="text-brand-primary font-black uppercase tracking-[0.4em] text-[10px]">
//                   {product.category?.name || "Official Marvel Marts Gear"}
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

//             <div className="mb-10 p-8 bg-neutral-light rounded-[2.5rem] border border-neutral-light/50 relative overflow-hidden">
//                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
//               <div className="flex items-baseline gap-4 mb-2">
//                 <span className="text-5xl font-black text-brand-primary italic">₦{product.price.toLocaleString()}</span>
//                 {product.discountPrice && (
//                     <span className="text-2xl text-neutral-gray line-through font-bold italic opacity-50">₦{product.discountPrice.toLocaleString()}</span>
//                 )}
//               </div>
//               <p className="text-neutral-gray text-[10px] font-black uppercase tracking-widest">Free Shipping for Avengers Academy members</p>
//             </div>

//             <div className="space-y-4 mb-12">
//                <h3 className="text-[10px] font-black uppercase tracking-widest text-accent-navy ml-1">Select Quantity</h3>
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
//                   className="flex-1 bg-brand-primary text-neutral-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:bg-brand-light transition-all shadow-2xl shadow-brand-primary/30 flex items-center justify-center gap-3 active:scale-[0.98] group"
//                 >
//                   <ShoppingCart size={20} className="group-hover:rotate-12 transition-transform" /> Add to Loot Stash
//                 </button>
//               </div>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-10 border-t border-neutral-light">
//               <div className="flex flex-col items-center md:items-start gap-2">
//                 <ShieldCheck className="text-brand-primary" size={28} />
//                 <span className="text-[9px] font-black uppercase text-accent-navy tracking-tighter leading-tight">Authenticity<br/>Guaranteed</span>
//               </div>
//               <div className="flex flex-col items-center md:items-start gap-2 border-y md:border-y-0 md:border-x border-neutral-light py-4 md:py-0 md:px-6">
//                 <Truck className="text-brand-primary" size={28} />
//                 <span className="text-[9px] font-black uppercase text-accent-navy tracking-tighter leading-tight">Quantum<br/>Delivery</span>
//               </div>
//               <div className="flex flex-col items-center md:items-start gap-2">
//                 <RefreshCcw className="text-brand-primary" size={28} />
//                 <span className="text-[9px] font-black uppercase text-accent-navy tracking-tighter leading-tight">30-Day Multi-<br/>Verse Return</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* --- TABS SYSTEM --- */}
//         <div className="mt-16 border-t border-neutral-light">
//           <div className="flex flex-wrap gap-8 py-6 mb-8 overflow-x-auto no-scrollbar border-b border-neutral-light">
//             {tabs.map((tab) => (
//               <button
//                 key={tab}
//                 onClick={() => setActiveTab(tab)}
//                 className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap relative pb-2 ${
//                   activeTab === tab ? "text-brand-primary" : "text-neutral-gray hover:text-accent-navy"
//                 }`}
//               >
//                 {tab}
//                 {activeTab === tab && (
//                   <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-primary" />
//                 )}
//               </button>
//             ))}
//           </div>

//           <div className="max-w-6xl transition-all duration-300">
//             {activeTab === "DESCRIPTION" && (
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
//                 <div>
//                   <h4 className="flex items-center gap-2 text-accent-navy font-black text-xs uppercase tracking-widest mb-6">
//                     <span className="w-2 h-2 bg-brand-primary rounded-full"></span> Key Specifications
//                   </h4>
//                   <div className="space-y-3">
//                     {/* These items follow the layout in your provided image */}
//                     <p className="text-[10px] font-bold uppercase text-neutral-gray flex items-start gap-3">
//                       <span className="text-brand-primary">•</span> Hardware & Performance
//                     </p>
//                     <p className="text-[10px] font-bold uppercase text-neutral-gray flex items-start gap-3 pl-4">
//                       <span className="text-brand-primary">•</span> Processor: MediaTek Dimensity G300 (6nm)
//                     </p>
//                     <p className="text-[10px] font-bold uppercase text-neutral-gray flex items-start gap-3 pl-4">
//                       <span className="text-brand-primary">•</span> CPU: Octa-core (2x2.4 GHz Cortex-A76 & 6x2.0 GHz Cortex-A55)
//                     </p>
//                     <p className="text-[10px] font-bold uppercase text-neutral-gray flex items-start gap-3 pl-4">
//                       <span className="text-brand-primary">•</span> RAM: 8GB LPDDR4X
//                     </p>
//                     <p className="text-[10px] font-bold uppercase text-neutral-gray flex items-start gap-3 pl-4">
//                       <span className="text-brand-primary">•</span> Storage: 256GB eMMC 5.1
//                     </p>
//                   </div>
//                 </div>
//                 <div className="prose prose-neutral text-neutral-gray font-bold text-xs leading-loose uppercase tracking-wide">
//                   {product.description || "Specifications for this high-tier Marvel asset are strictly confidential."}
//                 </div>
//               </div>
//             )}
//             {activeTab !== "DESCRIPTION" && (
//               <div className="py-10 text-neutral-gray font-black uppercase text-[10px] tracking-widest italic animate-pulse">
//                 Accessing {activeTab} Data from Secure Servers...
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }




"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  ShoppingCart, Star, ShieldCheck, Truck, 
  RefreshCcw, Plus, Minus, Loader2, ChevronLeft,
  Share2, Heart, Eye
} from "lucide-react";

// Redux & Context Imports
import { useDispatch } from "react-redux";
import { addToCart } from "@/store/cartSlice";
import { useNotification } from "@/app/_context/NotificationContext";
import ProductTabs from "@/app/_components/ProductTabs"; // Ensure path is correct

export default function PublicProductPage() {
  const { slug } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { notifySuccess } = useNotification(); 
  
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/products/${slug}`);
        const data = await res.json();

        if (data.success) {
          setProduct(data.product);
          // Assuming your API returns related products or you fetch them here
          // For now, using a placeholder fetch or logic
          const relatedRes = await fetch(`/api/products?category=${data.product.category?.id}&limit=4`);
          const relatedData = await relatedRes.json();
          setRelatedProducts(relatedData.products?.filter((p: any) => p.slug !== slug) || []);
        } else {
          router.push("/shop");
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchProductData();
  }, [slug, router]);

  const handleAddToCart = () => {
    if (!product) return;
    dispatch(addToCart({ 
      product: {
        id: product.id,
        slug: product.slug,
        title: product.title,
        price: product.price,
        imageUrl: product.imageUrl || product.images?.[0]?.url 
      }, 
      quantity 
    }));
    notifySuccess(`${product.title} added to your stash!`);
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-white">
      <Loader2 className="w-12 h-12 text-brand-primary animate-spin mb-4" />
      <p className="text-accent-navy font-black uppercase tracking-widest text-[10px]">Accessing Database...</p>
    </div>
  );

  if (!product) return null;

  const images = product.images?.length > 0 
    ? product.images 
    : [{ url: product.imageUrl || "/images/placeholder.jpg" }];

  return (
    <div className="bg-neutral-white min-h-screen pb-20">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <Link href="/shop" className="inline-flex items-center gap-2 text-neutral-gray hover:text-brand-primary font-black uppercase text-[10px] tracking-widest mb-10 transition-colors group">
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          Back to the Armory
        </Link>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-24 mb-20">
          <div className="space-y-6">
            <div className="relative aspect-square bg-neutral-light rounded-[3rem] overflow-hidden border border-neutral-light shadow-inner">
              <Image 
                src={images[activeImage]?.url} 
                alt={product.title} 
                fill 
                className="object-cover transition-transform duration-700 hover:scale-110" 
                priority
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                {images.map((img: any, idx: number) => (
                  <button key={idx} onClick={() => setActiveImage(idx)} className={`relative w-24 h-24 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-brand-primary scale-95 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                    <Image src={img.url} alt={`View ${idx}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <p className="text-brand-primary font-black uppercase tracking-[0.4em] text-[10px]">{product.category?.name || "Official Gear"}</p>
                <div className="flex gap-2">
                   <button className="p-2 text-neutral-gray hover:text-brand-primary transition-colors"><Share2 size={18}/></button>
                   <button className="p-2 text-neutral-gray hover:text-red-500 transition-colors"><Heart size={18}/></button>
                </div>
              </div>
              <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-accent-navy leading-[0.9] mb-6">{product.title}</h1>
              <div className="flex items-center gap-6">
                <div className="flex items-center bg-accent-navy text-neutral-white px-3 py-1.5 rounded-xl gap-1.5">
                  <Star size={14} className="fill-brand-primary text-brand-primary" />
                  <span className="text-sm font-black italic">4.9</span>
                </div>
                <span className="text-neutral-gray font-bold text-[10px] uppercase tracking-widest border-l border-neutral-light pl-6">2,450 Verified Looters</span>
              </div>
            </div>

            <div className="mb-10 p-8 bg-neutral-light rounded-[2.5rem] border border-neutral-light/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
              <div className="flex items-baseline gap-4 mb-2">
                <span className="text-5xl font-black text-brand-primary italic">₦{product.price.toLocaleString()}</span>
                {product.discountPrice && <span className="text-2xl text-neutral-gray line-through font-bold italic opacity-50">₦{product.discountPrice.toLocaleString()}</span>}
              </div>
              <p className="text-neutral-gray text-[10px] font-black uppercase tracking-widest">Free Shipping for Academy members</p>
            </div>

            <div className="space-y-4 mb-12">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-accent-navy ml-1">Select Quantity</h3>
               <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center justify-between bg-neutral-light rounded-2xl p-2 border border-neutral-light sm:w-44">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 flex items-center justify-center text-accent-navy hover:bg-neutral-white rounded-xl transition-all"><Minus size={20} /></button>
                  <span className="font-black text-2xl text-accent-navy italic px-4">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-12 flex items-center justify-center text-accent-navy hover:bg-neutral-white rounded-xl transition-all"><Plus size={20} /></button>
                </div>
                <button onClick={handleAddToCart} className="flex-1 bg-brand-primary text-neutral-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:bg-brand-light transition-all shadow-2xl shadow-brand-primary/30 flex items-center justify-center gap-3 active:scale-[0.98] group">
                  <ShoppingCart size={20} className="group-hover:rotate-12 transition-transform" /> Add to Loot Stash
                </button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-10 border-t border-neutral-light">
               {/* ... (Keep existing ShieldCheck, Truck, Refresh Badges) ... */}
            </div>
          </div>
        </div>

        {/* Tabs System */}
        <ProductTabs product={product} />

        {/* Related Products Section */}
        <div className="mt-32">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-brand-primary font-black uppercase tracking-[0.4em] text-[10px] mb-2">You might also like</p>
              <h2 className="text-4xl font-black italic uppercase text-accent-navy tracking-tighter">Related <span className="text-brand-primary">Loot</span></h2>
            </div>
            <Link href="/shop" className="hidden md:block text-[10px] font-black uppercase tracking-widest border-b-2 border-brand-primary pb-1 hover:text-brand-primary transition-colors">
              View All Armory
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {relatedProducts.length > 0 ? (
              relatedProducts.map((item: any) => (
                <Link key={item.id} href={`/shop/${item.slug}`} className="group">
                  <div className="relative aspect-[4/5] bg-neutral-light rounded-[2rem] overflow-hidden mb-4 border border-neutral-light transition-all group-hover:shadow-2xl group-hover:shadow-brand-primary/10 group-hover:-translate-y-2">
                    <Image 
                      src={item.imageUrl || item.images?.[0]?.url || "/images/placeholder.jpg"} 
                      alt={item.title} 
                      fill 
                      className="object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-accent-navy/0 group-hover:bg-accent-navy/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="bg-neutral-white p-4 rounded-2xl text-accent-navy shadow-xl">
                        <Eye size={20} />
                      </div>
                    </div>
                    {item.discountPrice && (
                      <div className="absolute top-4 left-4 bg-brand-primary text-neutral-white text-[8px] font-black uppercase px-3 py-1 rounded-full tracking-widest">
                        Sale
                      </div>
                    )}
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-accent-navy mb-1 group-hover:text-brand-primary transition-colors truncate">{item.title}</h3>
                  <p className="text-sm font-black italic text-brand-primary">₦{item.price.toLocaleString()}</p>
                </Link>
              ))
            ) : (
              // Empty State skeletons
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-[4/5] bg-neutral-light rounded-[2rem] animate-pulse" />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
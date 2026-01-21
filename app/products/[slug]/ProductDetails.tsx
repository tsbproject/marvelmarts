// "use client";

// import React, { useState, useEffect } from "react";
// import Link from "next/link";
// import { 
//   ChevronRight, Truck, RotateCcw, ShieldCheck, 
//   Star, Heart, Minus, Plus, ShoppingCart 
// } from "lucide-react";
// import { formatNaira } from "@/app/lib/FormatNaira";
// import { ProductWithRelations } from "./page";

// interface SimilarItem {
//   id: string;
//   title: string;
//   slug: string;
//   price: number;
//   discountPrice: number | null;
//   imageUrl: string;
// }

// interface ProductDetailsProps {
//   product: ProductWithRelations;
//   similarItems: SimilarItem[];
// }

// export default function ProductDetails({ product, similarItems }: ProductDetailsProps) {
//   const [selectedImg, setSelectedImg] = useState<string>(product.images[0]?.url || "/placeholder.png");
//   const [quantity, setQuantity] = useState<number>(1);
//   const [activeTab, setActiveTab] = useState<string>("overview");
//   const [showStickyBar, setShowStickyBar] = useState(false);

//   const currentPrice = Number(product.discountPrice || product.price);
//   const hasDiscount = !!product.discountPrice;

//   // Scroll logic to show/hide the floating bar
//   useEffect(() => {
//     const handleScroll = () => {
//       // Show the bar after scrolling 400px down
//       if (window.scrollY > 400) {
//         setShowStickyBar(true);
//       } else {
//         setShowStickyBar(false);
//       }
//     };

//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   return (
//     <div className="bg-[#F2F2F2] min-h-screen pb-20 lg:pb-12">
//       {/* 1. Breadcrumbs */}
//       <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-2 text-[11px] text-gray-500 uppercase tracking-wider">
//         <Link href="/" className="hover:text-pink-600 transition-colors">Home</Link>
//         <ChevronRight size={10} />
//         <Link href={`/category/${product.category?.slug}`} className="hover:text-pink-600 transition-colors">
//           {product.category?.name}
//         </Link>
//         <ChevronRight size={10} />
//         <span className="text-gray-900 font-bold truncate">{product.title}</span>
//       </nav>

//       <main className="max-w-8xl md:w-9xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
//         {/* LEFT: Image Gallery */}
//         <div className="lg:col-span-8 bg-white rounded-sm p-6 shadow-sm flex flex-col md:flex-row gap-6">
//           <div className="flex md:flex-col gap-3 order-2 md:order-1 overflow-x-auto md:overflow-visible">
//             {product.images.map((img) => (
//               <button 
//                 key={img.id}
//                 onMouseEnter={() => setSelectedImg(img.url)}
//                 className={`w-16 h-16 shrink-0 border-2 rounded-md overflow-hidden transition-all ${
//                   selectedImg === img.url ? 'border-orange-500 shadow-md' : 'border-gray-100'
//                 }`}
//               >
//                 <img src={img.url} alt="thumbnail" className="w-full h-full object-cover" />
//               </button>
//             ))}
//           </div>
//           <div className="flex-1 order-1 md:order-2 flex items-center justify-center bg-white min-h-[400px]">
//             <img src={selectedImg} alt={product.title} className="max-w-full max-h-[500px] object-contain" />
//           </div>
//         </div>

//         {/* RIGHT: Price & Actions */}
//         <div className="lg:col-span-4 space-y-4">
//           <section className="bg-white rounded-sm p-5 shadow-sm">
//             <h1 className="text-xl font-bold text-gray-800 leading-tight">{product.title}</h1>
//             <div className="flex items-center gap-4 mt-2 text-[11px] text-gray-400">
//               <span>PRODUCT CODE: {product.id.slice(-6).toUpperCase()}</span>
//               <div className="flex items-center text-orange-400">
//                 <Star size={12} fill="currentColor" /> <Star size={12} fill="currentColor" /> <Star size={12} fill="currentColor" />
//                 <span className="ml-1 text-blue-500 hover:underline cursor-pointer">(12 Reviews)</span>
//               </div>
//             </div>

//             <hr className="my-4 opacity-50" />

//             <div className="py-2">
//               <p className="text-3xl font-black text-gray-900">{formatNaira(currentPrice)}</p>
//               {hasDiscount && (
//                 <div className="flex items-center gap-2 mt-1">
//                   <span className="text-gray-400 line-through text-sm">{formatNaira(Number(product.price))}</span>
//                   <span className="text-green-600 text-xs font-bold">-{Math.round(((Number(product.price) - currentPrice) / Number(product.price)) * 100)}%</span>
//                 </div>
//               )}
//             </div>

//             {/* Quantity Selector */}
//             <div className="mt-6 flex items-center gap-4 border-t pt-4">
//               <span className="text-xs font-bold text-gray-500 uppercase">Quantity:</span>
//               <div className="flex items-center border rounded">
//                 <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:bg-gray-100"><Minus size={14}/></button>
//                 <span className="px-4 text-sm font-bold w-10 text-center">{quantity}</span>
//                 <button onClick={() => setQuantity(quantity + 1)} className="p-2 hover:bg-gray-100"><Plus size={14}/></button>
//               </div>
//             </div>

//             <div className="mt-6 space-y-3">
//               <button className="w-full bg-[#00b57a] hover:bg-[#009665] text-white py-4 rounded-md font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98]">
//                 <ShoppingCart size={18} /> Add To Cart
//               </button>
//             </div>
//           </section>

//           {/* Delivery Info */}
//           <aside className="bg-white rounded-sm p-5 shadow-sm space-y-5">
//             <h3 className="text-xs font-bold text-gray-800 uppercase border-b pb-2 tracking-tighter">Delivery & Returns</h3>
//             <div className="flex gap-4">
//               <Truck size={20} className="text-pink-600 shrink-0" />
//               <p className="text-[10px] text-gray-500 leading-tight">Standard delivery within 1-5 business days.</p>
//             </div>
//           </aside>
//         </div>
//       </main>

//       {/* TABS SECTION */}
//       <div className="max-w-7xl mx-auto px-4 mt-6">
//         <div className="bg-white rounded-sm shadow-sm overflow-hidden">
//           <div className="flex border-b text-[11px] font-bold text-gray-500 uppercase tracking-widest">
//             {['overview', 'description', 'reviews'].map((tab) => (
//               <button 
//                 key={tab}
//                 onClick={() => setActiveTab(tab)}
//                 className={`px-8 py-4 ${activeTab === tab ? 'border-b-4 border-pink-600 text-pink-600 bg-gray-50' : 'hover:text-gray-800'}`}
//               >
//                 {tab}
//               </button>
//             ))}
//           </div>
//           <div className="p-8">
//              {activeTab === 'overview' && <div className="prose prose-sm max-w-none text-gray-600" dangerouslySetInnerHTML={{ __html: product.description }} />}
//              {activeTab !== 'overview' && <p className="text-sm text-gray-400">Section details coming soon.</p>}
//           </div>
//         </div>
//       </div>

//       {/* SIMILAR ITEMS */}
//       <div className="max-w-7xl mx-auto px-4 mt-10">
//         <div className="bg-white rounded-sm shadow-sm p-6">
//           <h2 className="text-sm font-bold text-gray-800 uppercase tracking-tighter mb-6 border-b pb-2">Similar Items</h2>
//           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
//             {similarItems.map((item) => (
//               <Link href={`/products/${item.slug}`} key={item.id} className="group">
//                 <div className="aspect-square bg-gray-50 rounded-md overflow-hidden mb-2 border border-gray-100">
//                   <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
//                 </div>
//                 <h3 className="text-[11px] text-gray-600 line-clamp-2 h-8">{item.title}</h3>
//                 <p className="mt-1 text-sm font-bold">{formatNaira(item.price)}</p>
//               </Link>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* --- FLOATING MOBILE BUY BAR --- */}
//       <div 
//         className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 z-50 transition-transform duration-300 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] lg:hidden ${
//           showStickyBar ? "translate-y-0" : "translate-y-full"
//         }`}
//       >
//         <div className="flex items-center gap-3">
//           <div className="flex-1 min-w-0">
//             <p className="text-xs font-bold text-gray-900 truncate">{product.title}</p>
//             <p className="text-sm font-black text-pink-600">{formatNaira(currentPrice)}</p>
//           </div>
//           <button className="bg-[#00b57a] text-white px-6 py-3 rounded-md font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg active:scale-95 transition-all">
//             <ShoppingCart size={16} /> Add
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }








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




// "use client";

// import { useState, useEffect } from "react";
// import { useParams, useRouter } from "next/navigation";
// import Image from "next/image";
// import Link from "next/link";
// import { 
//   ShoppingCart, Star, ShieldCheck, Truck, 
//   RefreshCcw, Plus, Minus, Loader2, ChevronLeft,
//   Share2, Heart, Eye
// } from "lucide-react";

// // Redux & Context Imports
// import { useDispatch } from "react-redux";
// import { addToCart } from "@/store/cartSlice";
// import { useNotification } from "@/app/_context/NotificationContext";
// import ProductTabs from "@/app/_components/ProductTabs"; // Ensure path is correct

// export default function PublicProductPage() {
//   const { slug } = useParams();
//   const router = useRouter();
//   const dispatch = useDispatch();
//   const { notifySuccess } = useNotification(); 
  
//   const [product, setProduct] = useState<any>(null);
//   const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [quantity, setQuantity] = useState(1);
//   const [activeImage, setActiveImage] = useState(0);

//   useEffect(() => {
//     const fetchProductData = async () => {
//       try {
//         setLoading(true);
//         const res = await fetch(`/api/products/${slug}`);
//         const data = await res.json();

//         if (data.success) {
//           setProduct(data.product);
//           // Assuming your API returns related products or you fetch them here
//           // For now, using a placeholder fetch or logic
//           const relatedRes = await fetch(`/api/products?category=${data.product.category?.id}&limit=4`);
//           const relatedData = await relatedRes.json();
//           setRelatedProducts(relatedData.products?.filter((p: any) => p.slug !== slug) || []);
//         } else {
//           router.push("/shop");
//         }
//       } catch (err) {
//         console.error("Fetch error:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (slug) fetchProductData();
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

//   return (
//     <div className="bg-neutral-white min-h-screen pb-20">
//       <div className="container mx-auto px-4 py-8">
//         {/* Navigation */}
//         <Link href="/shop" className="inline-flex items-center gap-2 text-neutral-gray hover:text-brand-primary font-black uppercase text-[10px] tracking-widest mb-10 transition-colors group">
//           <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
//           Back to the Armory
//         </Link>

//         {/* Main Product Section */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-24 mb-20">
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
//                   <button key={idx} onClick={() => setActiveImage(idx)} className={`relative w-24 h-24 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-brand-primary scale-95 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}>
//                     <Image src={img.url} alt={`View ${idx}`} fill className="object-cover" />
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>

//           <div className="flex flex-col">
//             <div className="mb-8">
//               <div className="flex items-center justify-between mb-4">
//                 <p className="text-brand-primary font-black uppercase tracking-[0.4em] text-[10px]">{product.category?.name || "Official Gear"}</p>
//                 <div className="flex gap-2">
//                    <button className="p-2 text-neutral-gray hover:text-brand-primary transition-colors"><Share2 size={18}/></button>
//                    <button className="p-2 text-neutral-gray hover:text-red-500 transition-colors"><Heart size={18}/></button>
//                 </div>
//               </div>
//               <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-accent-navy leading-[0.9] mb-6">{product.title}</h1>
//               <div className="flex items-center gap-6">
//                 <div className="flex items-center bg-accent-navy text-neutral-white px-3 py-1.5 rounded-xl gap-1.5">
//                   <Star size={14} className="fill-brand-primary text-brand-primary" />
//                   <span className="text-sm font-black italic">4.9</span>
//                 </div>
//                 <span className="text-neutral-gray font-bold text-[10px] uppercase tracking-widest border-l border-neutral-light pl-6">2,450 Verified Looters</span>
//               </div>
//             </div>

//             <div className="mb-10 p-8 bg-neutral-light rounded-[2.5rem] border border-neutral-light/50 relative overflow-hidden">
//               <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
//               <div className="flex items-baseline gap-4 mb-2">
//                 <span className="text-5xl font-black text-brand-primary italic">₦{product.price.toLocaleString()}</span>
//                 {product.discountPrice && <span className="text-2xl text-neutral-gray line-through font-bold italic opacity-50">₦{product.discountPrice.toLocaleString()}</span>}
//               </div>
//               <p className="text-neutral-gray text-[10px] font-black uppercase tracking-widest">Free Shipping for Academy members</p>
//             </div>

//             <div className="space-y-4 mb-12">
//                <h3 className="text-[10px] font-black uppercase tracking-widest text-accent-navy ml-1">Select Quantity</h3>
//                <div className="flex flex-col sm:flex-row gap-4">
//                 <div className="flex items-center justify-between bg-neutral-light rounded-2xl p-2 border border-neutral-light sm:w-44">
//                   <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 flex items-center justify-center text-accent-navy hover:bg-neutral-white rounded-xl transition-all"><Minus size={20} /></button>
//                   <span className="font-black text-2xl text-accent-navy italic px-4">{quantity}</span>
//                   <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-12 flex items-center justify-center text-accent-navy hover:bg-neutral-white rounded-xl transition-all"><Plus size={20} /></button>
//                 </div>
//                 <button onClick={handleAddToCart} className="flex-1 bg-brand-primary text-neutral-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:bg-brand-light transition-all shadow-2xl shadow-brand-primary/30 flex items-center justify-center gap-3 active:scale-[0.98] group">
//                   <ShoppingCart size={20} className="group-hover:rotate-12 transition-transform" /> Add to Loot Stash
//                 </button>
//               </div>
//             </div>

//             {/* Trust Badges */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-10 border-t border-neutral-light">
//                {/* ... (Keep existing ShieldCheck, Truck, Refresh Badges) ... */}
//             </div>
//           </div>
//         </div>

//         {/* Tabs System */}
//         <ProductTabs product={product} />

//         {/* Related Products Section */}
//         <div className="mt-32">
//           <div className="flex items-end justify-between mb-12">
//             <div>
//               <p className="text-brand-primary font-black uppercase tracking-[0.4em] text-[10px] mb-2">You might also like</p>
//               <h2 className="text-4xl font-black italic uppercase text-accent-navy tracking-tighter">Related <span className="text-brand-primary">Loot</span></h2>
//             </div>
//             <Link href="/shop" className="hidden md:block text-[10px] font-black uppercase tracking-widest border-b-2 border-brand-primary pb-1 hover:text-brand-primary transition-colors">
//               View All Armory
//             </Link>
//           </div>

//           <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
//             {relatedProducts.length > 0 ? (
//               relatedProducts.map((item: any) => (
//                 <Link key={item.id} href={`/shop/${item.slug}`} className="group">
//                   <div className="relative aspect-[4/5] bg-neutral-light rounded-[2rem] overflow-hidden mb-4 border border-neutral-light transition-all group-hover:shadow-2xl group-hover:shadow-brand-primary/10 group-hover:-translate-y-2">
//                     <Image 
//                       src={item.imageUrl || item.images?.[0]?.url || "/images/placeholder.jpg"} 
//                       alt={item.title} 
//                       fill 
//                       className="object-cover transition-transform duration-500 group-hover:scale-110" 
//                     />
//                     <div className="absolute inset-0 bg-accent-navy/0 group-hover:bg-accent-navy/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
//                       <div className="bg-neutral-white p-4 rounded-2xl text-accent-navy shadow-xl">
//                         <Eye size={20} />
//                       </div>
//                     </div>
//                     {item.discountPrice && (
//                       <div className="absolute top-4 left-4 bg-brand-primary text-neutral-white text-[8px] font-black uppercase px-3 py-1 rounded-full tracking-widest">
//                         Sale
//                       </div>
//                     )}
//                   </div>
//                   <h3 className="text-xs font-black uppercase tracking-widest text-accent-navy mb-1 group-hover:text-brand-primary transition-colors truncate">{item.title}</h3>
//                   <p className="text-sm font-black italic text-brand-primary">₦{item.price.toLocaleString()}</p>
//                 </Link>
//               ))
//             ) : (
//               // Empty State skeletons
//               [1, 2, 3, 4].map((i) => (
//                 <div key={i} className="aspect-[4/5] bg-neutral-light rounded-[2rem] animate-pulse" />
//               ))
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
  Share2, Heart, Eye, ChevronRight
} from "lucide-react";

// Redux & Context Imports
import { useDispatch } from "react-redux";
import { addToCart } from "@/store/cartSlice";
import { useNotification } from "@/app/_context/NotificationContext";
import ProductTabs from "@/app/_components/ProductTabs";
import { formatNaira } from "@/app/lib/FormatNaira";
import { ProductWithRelations } from "./page";

export default function ProductDetails() {
  const { slug } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { notifySuccess } = useNotification(); 
  
  const [product, setProduct] = useState<ProductWithRelations | null>(null);
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
          // Fetching related loot based on category
          const relatedRes = await fetch(`/api/products?category=${data.product.categoryId}&limit=5`);
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
        price: product.discountPrice ?? product.price,
        imageUrl: product.images?.[0]?.url || "/placeholder.png"
      }, 
      quantity 
    }));
    notifySuccess(`${product.title} added to your stash!`);
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-white">
      <Loader2 className="w-12 h-12 text-brand-primary animate-spin mb-4" />
      <p className="text-accent-navy font-black uppercase tracking-widest text-[10px]">Accessing Secure Database...</p>
    </div>
  );

  if (!product) return null;

  const images = product.images?.length > 0 
    ? product.images 
    : [{ url: "/placeholder.png" }];

  return (
    <div className="bg-neutral-white min-h-screen pb-20">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <Link href="/shop" className="inline-flex items-center gap-2 text-neutral-gray hover:text-brand-primary font-black uppercase text-[10px] tracking-[0.3em] mb-10 transition-colors group">
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          Back to the Armory
        </Link>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-24 mb-20">
          {/* Gallery - Maintaining rounded-3rem style */}
          <div className="space-y-6">
            <div className="relative aspect-square bg-neutral-light rounded-[3.5rem] overflow-hidden border border-neutral-light shadow-inner">
              <Image 
                src={images[activeImage]?.url} 
                alt={product.title} 
                fill 
                className="object-contain p-12 transition-transform duration-700 hover:scale-105" 
                priority
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                {images.map((img: any, idx: number) => (
                  <button 
                    key={idx} 
                    onClick={() => setActiveImage(idx)} 
                    className={`relative w-24 h-24 shrink-0 rounded-[1.5rem] overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-brand-primary scale-95 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <Image src={img.url} alt={`View ${idx}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details Info */}
          <div className="flex flex-col">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <p className="text-brand-primary font-black uppercase tracking-[0.4em] text-[10px]">
                  {product.category?.name || "Tactical Asset"}
                </p>
                <div className="flex gap-2">
                   <button className="p-2 text-neutral-gray hover:text-brand-primary transition-colors"><Share2 size={18}/></button>
                   <button className="p-2 text-neutral-gray hover:text-red-500 transition-colors"><Heart size={18}/></button>
                </div>
              </div>

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

            {/* Price Card with Brand-Light Blend */}
            <div className="mb-10 p-8 bg-neutral-light rounded-[2.5rem] border border-neutral-light/50 relative overflow-hidden bg-gradient-to-br from-neutral-light to-brand-light/20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
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
              <p className="text-neutral-gray text-[10px] font-black uppercase tracking-widest">Free Shipping for Academy members</p>
            </div>

            {/* Quantity and CTA */}
            <div className="space-y-4 mb-12">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-accent-navy ml-1">Deploy Quantity</h3>
               <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center justify-between bg-neutral-light rounded-2xl p-2 border border-neutral-light sm:w-44">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 flex items-center justify-center text-accent-navy hover:bg-neutral-white rounded-xl transition-all">
                    <Minus size={20} />
                  </button>
                  <span className="font-black text-2xl text-accent-navy italic px-4">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-12 flex items-center justify-center text-accent-navy hover:bg-neutral-white rounded-xl transition-all">
                    <Plus size={20} />
                  </button>
                </div>
                <button 
                  onClick={handleAddToCart} 
                  className="flex-1 bg-brand-primary text-neutral-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:bg-accent-navy transition-all shadow-2xl shadow-brand-primary/30 flex items-center justify-center gap-3 active:scale-[0.98] group"
                >
                  <ShoppingCart size={20} className="group-hover:rotate-12 transition-transform" /> Add to Loot Stash
                </button>
              </div>
            </div>

            {/* Trust Badges Section */}
            <div className="grid grid-cols-3 gap-4 py-10 border-t border-neutral-light">
               <Badge icon={<ShieldCheck size={28}/>} title="Authentic" subtitle="Gear" />
               <Badge icon={<Truck size={28}/>} title="Quantum" subtitle="Delivery" />
               <Badge icon={<RefreshCcw size={28}/>} title="30-Day" subtitle="Return" />
            </div>
          </div>
        </div>

        {/* Tabs Content */}
        <ProductTabs product={product} />

        {/* Related Products Grid */}
        <div className="mt-32">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-brand-primary font-black uppercase tracking-[0.4em] text-[10px] mb-2">You might also like</p>
              <h2 className="text-4xl font-black italic uppercase text-accent-navy tracking-tighter">Related <span className="text-brand-primary">Loot</span></h2>
            </div>
            <Link href="/shop" className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border-b-2 border-brand-primary pb-1 hover:text-brand-primary transition-all">
              View All Armory <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {relatedProducts.length > 0 ? (
              relatedProducts.map((item: any) => (
                <Link key={item.id} href={`/shop/${item.slug}`} className="group">
                  <div className="relative aspect-[4/5] bg-neutral-light rounded-[2.5rem] overflow-hidden mb-4 border border-neutral-light transition-all group-hover:shadow-2xl group-hover:shadow-brand-primary/10 group-hover:-translate-y-2">
                    <Image 
                      src={item.imageUrl || item.images?.[0]?.url || "/placeholder.png"} 
                      alt={item.title} 
                      fill 
                      className="object-contain p-8 transition-transform duration-500 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-accent-navy/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="bg-neutral-white p-4 rounded-2xl text-accent-navy shadow-xl"><Eye size={20} /></div>
                    </div>
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-accent-navy mb-1 group-hover:text-brand-primary transition-colors truncate">{item.title}</h3>
                  <p className="text-sm font-black italic text-brand-primary">{formatNaira(item.price)}</p>
                </Link>
              ))
            ) : (
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-[4/5] bg-neutral-light rounded-[2.5rem] animate-pulse" />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-component for clean badges
function Badge({ icon, title, subtitle }: { icon: React.ReactNode, title: string, subtitle: string }) {
  return (
    <div className="flex flex-col items-center md:items-start gap-2">
      <div className="text-brand-primary">{icon}</div>
      <span className="text-[9px] font-black uppercase text-accent-navy tracking-tighter leading-tight">
        {title}<br/>{subtitle}
      </span>
    </div>
  );
}
// "use client";

// import { useNotification } from "@/app/_context/NotificationContext";
// import { updateSiteSettings } from "@/app/lib/actions/settings";
// import { Save, Loader2, Palette, Type, Globe, ShieldAlert, Phone, LayoutPanelTop, Move } from "lucide-react";
// import { useFormStatus } from "react-dom";
// import { useState, useMemo } from "react";

// /**
//  * Enterprise Toggle Switch Component
//  */
// function Toggle({ name, label, defaultChecked }: { name: string, label: string, defaultChecked: boolean }) {
//   const [enabled, setEnabled] = useState(defaultChecked);

//   return (
//     <div className="flex items-center justify-between p-6 bg-[#F8F8F8] rounded-3xl border-2 border-transparent hover:border-gray-200 transition-all group">
//       <div className="space-y-1">
//         <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block group-hover:text-[var(--brand-primary)] transition-colors">{label}</span>
//         <span className="text-sm font-bold text-[var(--accent-navy)]">{enabled ? "Enabled" : "Disabled"}</span>
//       </div>
      
//       <input type="hidden" name={name} value={enabled ? "true" : "false"} />
      
//       <button
//         type="button"
//         onClick={() => setEnabled(!enabled)}
//         className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none shadow-inner ${
//           enabled ? "bg-[var(--brand-primary)]" : "bg-gray-300"
//         }`}
//       >
//         <span
//           className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-md ${
//             enabled ? "translate-x-7" : "translate-x-1"
//           }`}
//         />
//       </button>
//     </div>
//   );
// }

// /**
//  * Color Input Group with Hex/Picker Sync
//  */
// function ColorInput({ label, name, defaultValue }: { label: string, name: string, defaultValue: string }) {
//   const [color, setColor] = useState(defaultValue || "#000000");

//   return (
//     <div className="space-y-3 group">
//       <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">{label}</label>
//       <div className="flex items-center bg-[#F8F8F8] p-3 rounded-2xl border-2 border-transparent group-hover:border-gray-200 transition-all shadow-sm">
//         <input 
//           type="color" 
//           value={color} 
//           onChange={(e) => setColor(e.target.value)}
//           className="w-12 h-12 rounded-xl cursor-pointer border-none bg-transparent" 
//         />
//         <input 
//           name={name}
//           value={color}
//           onChange={(e) => setColor(e.target.value)}
//           className="w-full bg-transparent text-xs font-mono font-black text-center uppercase outline-none text-gray-600" 
//         />
//       </div>
//     </div>
//   );
// }

// function SubmitButton() {
//   const { pending } = useFormStatus();
//   return (
//     <button 
//       type="submit" 
//       disabled={pending}
//       className="bg-[var(--accent-navy)] text-white px-12 py-6 rounded-3xl font-black uppercase tracking-widest text-sm hover:bg-[var(--brand-primary)] hover:text-white transition-all flex items-center gap-4 active:scale-95 disabled:opacity-70 shadow-2xl shadow-blue-900/30"
//     >
//       {pending ? <Loader2 className="animate-spin" size={22} /> : <Save size={22} />}
//       {pending ? "Updating System..." : "Save Design System"}
//     </button>
//   );
// }

// export default function SettingsForm({ settings }: { settings: any }) {
//   const { notifySuccess, notifyError } = useNotification();
  
//   // Layout & Root States
//   const [fontSize, setFontSize] = useState(settings?.baseFontSize || 16);
//   const [layoutScale, setLayoutScale] = useState(settings?.layoutScale || 1.0);
  
//   // Typography Multipliers
//   const [headingScale, setHeadingScale] = useState(settings?.headingFontSize || 1.0);
//   const [bodyScale, setBodyScale] = useState(settings?.bodyFontSize || 1.0);

//   // Zone Scales
//   const [headerScale, setHeaderScale] = useState(settings?.headerFontScale || 1.0);
//   const [footerScale, setFooterScale] = useState(settings?.footerFontScale || 1.0);
//   const [carouselScale, setCarouselScale] = useState(settings?.carouselFontScale || 1.0);

//   // --- THE ISOLATION ENGINE ---
//   // This forces the Admin Form to ignore the Global CSS variables 
//   // currently applied to the HTML/Body tags.
//   const isolationStyles = useMemo(() => ({
//     "--base-font-size": "16px",
//     "--layout-scale": "1.0",
//     "--heading-font-size": "1.0",
//     "--body-font-size": "1.0",
//     "--header-font-scale": "1.0",
//     "--footer-font-scale": "1.0",
//     "--carousel-font-scale": "1.0",
//     "fontSize": "16px", // Hard baseline reset
//     "lineHeight": "1.5",
//   } as React.CSSProperties), []);

//   async function clientAction(formData: FormData) {
//     const result = await updateSiteSettings(formData);
//     if (result.success) {
//       notifySuccess(result.message);
//     } else {
//       notifyError(result.message);
//     }
//   }

//   async function handleHardReset() {
//     if (!confirm("Reset to original 16px proportions?")) return;

//     setFontSize(16); 
//     setLayoutScale(1.0);
//     setHeadingScale(1.0);
//     setBodyScale(1.0);
//     setHeaderScale(1.0);
//     setFooterScale(1.0);
//     setCarouselScale(1.0);

//     const resetData = new FormData();
//     resetData.append("baseFontSize", "16");
//     resetData.append("layoutScale", "1.0");
//     resetData.append("headingFontSize", "1.0");
//     resetData.append("bodyFontSize", "1.0");
//     resetData.append("headerFontScale", "1.0");
//     resetData.append("footerFontScale", "1.0");
//     resetData.append("carouselFontScale", "1.0");
//     resetData.append("siteName", settings?.siteName || "MarvelMarts");

//     const result = await updateSiteSettings(resetData);
//     if (result.success) notifySuccess("System Restored to 16px Baseline");
//   }

//   return (
//     <div 
//       className="admin-settings-container isolation-layer" 
//       style={isolationStyles}
//     >
//       <form action={clientAction} className="space-y-10 pb-20">
        
//         {/* SECTION 1: BRAND IDENTITY */}
//         <section className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-xl border border-gray-100">
//           <header className="flex items-center gap-4 mb-10">
//             <div className="p-4 bg-blue-50 text-[var(--accent-navy)] rounded-2xl"><Globe size={28} /></div>
//             <div>
//               <h2 className="text-2xl font-black uppercase tracking-tighter">Brand <span className="text-[var(--brand-primary)]">Identity</span></h2>
//               <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Global Assets & Naming</p>
//             </div>
//           </header>
          
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//             <div className="space-y-3">
//               <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Site Name</label>
//               <input name="siteName" defaultValue={settings?.siteName} className="w-full bg-[#F8F8F8] rounded-2xl p-6 border-2 border-transparent focus:border-[var(--brand-primary)] outline-none font-bold text-lg" />
//             </div>
//             <div className="space-y-3">
//               <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Logo URL</label>
//               <input name="siteLogo" defaultValue={settings?.siteLogo} placeholder="https://..." className="w-full bg-[#F8F8F8] rounded-2xl p-6 border-2 border-transparent focus:border-[var(--brand-primary)] outline-none font-bold text-lg" />
//             </div>
//             <div className="space-y-3">
//               <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Favicon URL</label>
//               <input name="siteFavicon" defaultValue={settings?.siteFavicon} placeholder="https://..." className="w-full bg-[#F8F8F8] rounded-2xl p-6 border-2 border-transparent focus:border-[var(--brand-primary)] outline-none font-bold text-lg" />
//             </div>
//           </div>
//         </section>

//         {/* SECTION 2: GLOBAL ARCHITECTURE (Scales the whole site, but not this form) */}
//         <section className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-xl border border-gray-100">
//           <header className="flex items-center gap-4 mb-10">
//             <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl"><Move size={28} /></div>
//             <div className="flex-1">
//               <h2 className="text-2xl font-black uppercase tracking-tighter">Global <span className="text-indigo-600">Architecture</span></h2>
//               <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Root Scaling & Spacing Control</p>
//             </div>
//             <button 
//               type="button"
//               onClick={handleHardReset}
//               className="px-6 py-3 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all border border-red-100"
//             >
//               Hard Reset
//             </button>
//           </header>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
//             <div className="space-y-6">
//               <div className="flex justify-between items-center px-2">
//                   <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Base Root (Scaling Factor)</label>
//                   <span className="bg-[var(--accent-navy)] text-white px-4 py-2 rounded-xl text-sm font-black">{fontSize}px</span>
//               </div>
//               <input 
//                   type="range" name="baseFontSize" min="10" max="20" 
//                   value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))}
//                   className="w-full h-3 bg-gray-100 rounded-xl appearance-none cursor-pointer accent-[var(--brand-primary)]" 
//               />
//             </div>

//             <div className="space-y-6">
//               <div className="flex justify-between items-center px-2">
//                   <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Layout Density (Spacing)</label>
//                   <span className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-black">{Math.round(layoutScale * 100)}%</span>
//               </div>
//               <input 
//                   type="range" name="layoutScale" min="0.7" max="1.3" step="0.05"
//                   value={layoutScale} onChange={(e) => setLayoutScale(parseFloat(e.target.value))}
//                   className="w-full h-3 bg-gray-100 rounded-xl appearance-none cursor-pointer accent-indigo-600" 
//               />
//             </div>
//           </div>
//         </section>

//         {/* SECTION 3: TYPOGRAPHY ENGINE */}
//         <section className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-xl border border-gray-100">
//           <header className="flex items-center gap-4 mb-10">
//             <div className="p-4 bg-orange-50 text-[var(--brand-primary)] rounded-2xl"><Type size={28} /></div>
//             <div>
//               <h2 className="text-2xl font-black uppercase tracking-tighter">Typography <span className="text-[var(--accent-navy)]">Engine</span></h2>
//               <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Calibrated Font Multipliers</p>
//             </div>
//           </header>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
//             <div className="space-y-6">
//               <div className="flex justify-between items-center px-2">
//                   <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Heading Scale Multiplier</label>
//                   <span className="bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-black">{headingScale}x</span>
//               </div>
//               <input 
//                   type="range" name="headingFontSize" min="0.5" max="2.0" step="0.05"
//                   value={headingScale} onChange={(e) => setHeadingScale(parseFloat(e.target.value))}
//                   className="w-full h-3 bg-gray-100 rounded-xl appearance-none cursor-pointer accent-orange-600" 
//               />
//             </div>

//             <div className="space-y-6">
//               <div className="flex justify-between items-center px-2">
//                   <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Body Text Scale Multiplier</label>
//                   <span className="bg-gray-800 text-white px-4 py-2 rounded-xl text-sm font-black">{bodyScale}x</span>
//               </div>
//               <input 
//                   type="range" name="bodyFontSize" min="0.5" max="1.5" step="0.05"
//                   value={bodyScale} onChange={(e) => setBodyScale(parseFloat(e.target.value))}
//                   className="w-full h-3 bg-gray-100 rounded-xl appearance-none cursor-pointer accent-gray-800" 
//               />
//             </div>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//             <div className="space-y-3">
//               <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Main Body Font</label>
//               <select name="fontFamily" defaultValue={settings?.fontFamily} className="w-full bg-[#F8F8F8] rounded-2xl p-6 outline-none font-bold appearance-none cursor-pointer border-2 border-transparent focus:border-[var(--brand-primary)]">
//                 <option value="Inter">Inter (Modern Clean)</option>
//                 <option value="Outfit">Outfit (Tech Enterprise)</option>
//                 <option value="Montserrat">Montserrat (Classic Bold)</option>
//               </select>
//             </div>
//             <div className="space-y-3">
//               <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Heading Font</label>
//               <select name="headingFont" defaultValue={settings?.headingFont} className="w-full bg-[#F8F8F8] rounded-2xl p-6 outline-none font-bold appearance-none cursor-pointer border-2 border-transparent focus:border-[var(--brand-primary)]">
//                 <option value="Outfit">Outfit (Default Heading)</option>
//                 <option value="Inter">Inter</option>
//                 <option value="Playfair Display">Playfair (Elegant)</option>
//               </select>
//             </div>
//           </div>
//         </section>

//         {/* SECTION 4: COLOR SYSTEM */}
//         <section className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-xl border border-gray-100">
//           <header className="flex items-center gap-4 mb-10">
//             <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl"><Palette size={28} /></div>
//             <div>
//               <h2 className="text-2xl font-black uppercase tracking-tighter">Color <span className="text-purple-600">Palettes</span></h2>
//               <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Enterprise Branding System</p>
//             </div>
//           </header>

//           <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
//             <ColorInput label="Primary (Navy)" name="primaryColor" defaultValue={settings?.primaryColor} />
//             <ColorInput label="Secondary (Orange)" name="secondaryColor" defaultValue={settings?.secondaryColor} />
//             <ColorInput label="Accent" name="accentColor" defaultValue={settings?.accentColor} />
//             <ColorInput label="Body BG" name="bodyBg" defaultValue={settings?.bodyBg} />
//             <ColorInput label="Card BG" name="cardBg" defaultValue={settings?.cardBg} />
//             <ColorInput label="Sidebar BG" name="sidebarBg" defaultValue={settings?.sidebarBg} />
//             <ColorInput label="Success" name="successColor" defaultValue={settings?.successColor} />
//             <ColorInput label="Error" name="errorColor" defaultValue={settings?.errorColor} />
//             <ColorInput label="Warning" name="warningColor" defaultValue={settings?.warningColor} />
//             <ColorInput label="Info" name="infoColor" defaultValue={settings?.infoColor} />
//             <ColorInput label="Border" name="borderDefault" defaultValue={settings?.borderDefault} />
//             <ColorInput label="Text Primary" name="textPrimary" defaultValue={settings?.textPrimary} />
//             <ColorInput label="Text Secondary" name="textSecondary" defaultValue={settings?.textSecondary} />
//           </div>
//         </section>

//         {/* SECTION 5: SYSTEM CONTROL */}
//         <section className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-xl border border-gray-100">
//           <header className="flex items-center gap-4 mb-10">
//             <div className="p-4 bg-red-50 text-red-600 rounded-2xl"><ShieldAlert size={28} /></div>
//             <div>
//               <h2 className="text-2xl font-black uppercase tracking-tighter">System <span className="text-red-600">Control</span></h2>
//               <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Feature Toggles & Safety</p>
//             </div>
//           </header>
          
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <Toggle name="flashSaleActive" label="Global Flash Sale Module" defaultChecked={settings?.flashSaleActive} />
//             <Toggle name="maintenanceMode" label="Maintenance Mode (Public Lock)" defaultChecked={settings?.maintenanceMode} />
//           </div>
//         </section>

//         {/* SECTION 6: CONTACT & FOOTER */}
//         <section className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-xl border border-gray-100">
//           <header className="flex items-center gap-4 mb-10">
//             <div className="p-4 bg-green-50 text-green-600 rounded-2xl"><Phone size={28} /></div>
//             <div>
//               <h2 className="text-2xl font-black uppercase tracking-tighter">Contact <span className="text-green-600">Infrastructure</span></h2>
//               <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Public Facing Support Info</p>
//             </div>
//           </header>
          
//           <div className="space-y-8">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                   <input name="supportPhone" placeholder="Customer Support Phone" defaultValue={settings?.supportPhone} className="bg-[#F8F8F8] rounded-2xl p-6 outline-none font-bold text-lg border-2 border-transparent focus:border-[var(--brand-primary)]" />
//                   <input name="supportEmail" placeholder="Support Email" defaultValue={settings?.supportEmail} className="bg-[#F8F8F8] rounded-2xl p-6 outline-none font-bold text-lg border-2 border-transparent focus:border-[var(--brand-primary)]" />
//               </div>
//               <textarea name="footerDesc" defaultValue={settings?.footerDesc} placeholder="Footer description text..." className="w-full bg-[#F8F8F8] rounded-2xl p-6 min-h-[120px] outline-none font-medium text-lg border-2 border-transparent focus:border-[var(--brand-primary)]" />
//           </div>
//         </section>

//         {/* SECTION 7: HOME PAGE LAYOUT */}
//         <section className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-xl border border-gray-100">
//           <header className="flex items-center gap-4 mb-10">
//             <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl"><Globe size={28} /></div>
//             <div>
//               <h2 className="text-2xl font-black uppercase tracking-tighter">Front Page <span className="text-indigo-600">Layout</span></h2>
//               <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Enable/Disable Storefront Sections</p>
//             </div>
//           </header>
          
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             <Toggle name="showHeroCarousel" label="Hero Banner Carousel" defaultChecked={settings?.showHeroCarousel} />
//             <Toggle name="showFlashSales" label="Flash Sales Section" defaultChecked={settings?.showFlashSales} />
//             <Toggle name="showFeaturedCategories" label="Category Highlights" defaultChecked={settings?.showFeaturedCategories} />
//             <Toggle name="showTrendingCarousel" label="Trending Products" defaultChecked={settings?.showTrendingCarousel} />
//             <Toggle name="showFeaturedProducts" label="Featured Grid" defaultChecked={settings?.showFeaturedProducts} />
//             <Toggle name="showNewArrivals" label="New Arrivals Section" defaultChecked={settings?.showNewArrivals} />
//           </div>
//         </section>

//         {/* SECTION 8: HEADER ARCHITECTURE */}
//         <section className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-xl border border-gray-100">
//           <header className="flex items-center gap-4 mb-10">
//             <div className="p-4 bg-teal-50 text-teal-600 rounded-2xl"><LayoutPanelTop size={28} /></div>
//             <div>
//               <h2 className="text-2xl font-black uppercase tracking-tighter">Header <span className="text-teal-600">Architecture</span></h2>
//               <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Sticky Behavior & Component Visibility</p>
//             </div>
//           </header>
          
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             <Toggle name="stickyHeader" label="Sticky Header (Float)" defaultChecked={settings?.stickyHeader} />
//             <Toggle name="showCategoryMenu" label="Show Category Menu" defaultChecked={settings?.showCategoryMenu} />
//             <Toggle name="showSearchBar" label="Enable Global Search" defaultChecked={settings?.showSearchBar} />
//             <Toggle name="showHelpMenu" label="Mobile Help Icon" defaultChecked={settings?.showHelpMenu} />
//             <Toggle name="showCartDrawer" label="Mobile Cart Icon" defaultChecked={settings?.showCartDrawer} />
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10 border-t pt-10">
//             <div className="space-y-3">
//               <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Header Height (Desktop - px)</label>
//               <input 
//                 type="number" 
//                 name="headerHeightDesktop" 
//                 defaultValue={settings?.headerHeightDesktop || 55} 
//                 className="w-full bg-[#F8F8F8] rounded-2xl p-6 border-2 border-transparent focus:border-teal-600 outline-none font-bold text-lg" 
//               />
//             </div>
//             <div className="space-y-3">
//               <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Header Height (Mobile - px)</label>
//               <input 
//                 type="number" 
//                 name="headerHeightMobile" 
//                 defaultValue={settings?.headerHeightMobile || 35} 
//                 className="w-full bg-[#F8F8F8] rounded-2xl p-6 border-2 border-transparent focus:border-teal-600 outline-none font-bold text-lg" 
//               />
//             </div>
//           </div>
//         </section>

//         {/* SECTION 9: ZONE SCALES */}
//         <section className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-xl border border-gray-100">
//           <header className="flex items-center gap-4 mb-10">
//             <div className="p-4 bg-teal-50 text-teal-600 rounded-2xl"><LayoutPanelTop size={28} /></div>
//             <div>
//               <h2 className="text-2xl font-black uppercase tracking-tighter">Zone <span className="text-teal-600">Scales</span></h2>
//               <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Standalone Typography Control</p>
//             </div>
//           </header>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
//             <div className="space-y-4">
//               <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Header Nav Scale</label>
//               <div className="flex items-center gap-4">
//                 <input type="range" name="headerFontScale" min="0.8" max="1.5" step="0.05" 
//                       value={headerScale} onChange={(e) => setHeaderScale(parseFloat(e.target.value))}
//                       className="w-full accent-teal-600" />
//                 <span className="font-bold text-sm">{headerScale}x</span>
//               </div>
//             </div>

//             <div className="space-y-4">
//               <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Footer Text Scale</label>
//               <div className="flex items-center gap-4">
//                 <input type="range" name="footerFontScale" min="0.8" max="1.5" step="0.05" 
//                       value={footerScale} onChange={(e) => setFooterScale(parseFloat(e.target.value))}
//                       className="w-full accent-gray-600" />
//                 <span className="font-bold text-sm">{footerScale}x</span>
//               </div>
//             </div>

//             <div className="space-y-4">
//               <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Carousel Hero Scale</label>
//               <div className="flex items-center gap-4">
//                 <input type="range" name="carouselFontScale" min="0.8" max="2.0" step="0.1" 
//                       value={carouselScale} onChange={(e) => setCarouselScale(parseFloat(e.target.value))}
//                       className="w-full accent-orange-600" />
//                 <span className="font-bold text-sm">{carouselScale}x</span>
//               </div>
//             </div>
//           </div>
//         </section>

//         <div className="flex justify-center pt-10 sticky bottom-10 z-50">
//           <SubmitButton />
//         </div>

//       </form>
//     </div>
//   );
// }



"use client";

import { useState } from "react";
import { Slider } from "@/app/_components/ui/Slider";
import { Switch } from "@/app/_components/ui/Switch";
import { GlobalSettings } from "@/app/lib/actions/settings";

export default function SettingsPage() {
  const [settings, setSettings] = useState<GlobalSettings>({
    headerFontScale: 1.0,
    footerFontScale: 1.0,
    bodyFontScale: 1.0,
    headingFontScale: 1.0,
    carouselFontScale: 1.0,
    frontpageScale: 1.0,
    dashboardScale: 1.0,
    showEcommerceCarousel: true,
    showFeaturedProducts: true,
    showNewArrivals: true,
    showTrendingProducts: true,
    showFeaturedCategories: true,
    showFlashSales: true,
  });

  const updateSetting = (key: keyof GlobalSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    // TODO: persist to DB via API call
  };

  const saveSettings = async () => {
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    alert("Settings saved!");
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-10" data-admin-panel="true">
      <h1 className="text-3xl font-black text-[#002B5B] uppercase">
        Global Settings
      </h1>
      <p className="text-gray-600">
        Control fonts, layout, and frontpage visibility.
      </p>

      {/* Font Scales */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold">Font Scales</h2>
        <Slider
          label="Header Font Scale"
          min={0.8}
          max={1.5}
          step={0.05}
          value={settings.headerFontScale}
          onChange={(val) => updateSetting("headerFontScale", val)}
        />
        <Slider
          label="Footer Font Scale"
          min={0.8}
          max={1.5}
          step={0.05}
          value={settings.footerFontScale}
          onChange={(val) => updateSetting("footerFontScale", val)}
        />
        <Slider
          label="Body Font Scale"
          min={0.8}
          max={1.5}
          step={0.05}
          value={settings.bodyFontScale}
          onChange={(val) => updateSetting("bodyFontScale", val)}
        />
        <Slider
          label="Heading Font Scale"
          min={0.8}
          max={1.5}
          step={0.05}
          value={settings.headingFontScale}
          onChange={(val) => updateSetting("headingFontScale", val)}
        />
        <Slider
          label="Ecommerce Carousel Font Scale"
          min={0.8}
          max={1.5}
          step={0.05}
          value={settings.carouselFontScale}
          onChange={(val) => updateSetting("carouselFontScale", val)}
        />
      </section>

      {/* Frontpage Visibility */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold">Frontpage Components</h2>
        <Switch
          label="Show Ecommerce Carousel"
          checked={settings.showEcommerceCarousel}
          onChange={(val) => updateSetting("showEcommerceCarousel", val)}
        />
        <Switch
          label="Show Featured Products"
          checked={settings.showFeaturedProducts}
          onChange={(val) => updateSetting("showFeaturedProducts", val)}
        />
        <Switch
          label="Show New Arrivals"
          checked={settings.showNewArrivals}
          onChange={(val) => updateSetting("showNewArrivals", val)}
        />
        <Switch
          label="Show Trending Products"
          checked={settings.showTrendingProducts}
          onChange={(val) => updateSetting("showTrendingProducts", val)}
        />
        <Switch
          label="Show Featured Categories"
          checked={settings.showFeaturedCategories}
          onChange={(val) => updateSetting("showFeaturedCategories", val)}
        />
        <Switch
          label="Show Flash Sales"
          checked={settings.showFlashSales}
          onChange={(val) => updateSetting("showFlashSales", val)}
        />
      </section>

      {/* Save Button */}
      <button
        className="px-6 py-3 bg-brand-primary text-white rounded-lg font-bold"
        onClick={saveSettings}
      >
        Save Settings
      </button>
    </div>
  );
}

"use client";

import { useNotification } from "@/app/_context/NotificationContext";
import { updateSiteSettings } from "@/app/lib/actions/settings";
import { Save, Loader2, Palette, Type, Globe, ShieldAlert, Phone, LayoutPanelTop } from "lucide-react";
import { useFormStatus } from "react-dom";
import { useState } from "react";

/**
 * Enterprise Toggle Switch Component
 */
function Toggle({ name, label, defaultChecked }: { name: string, label: string, defaultChecked: boolean }) {
  const [enabled, setEnabled] = useState(defaultChecked);

  return (
    <div className="flex items-center justify-between p-6 bg-[#F8F8F8] rounded-3xl border-2 border-transparent hover:border-gray-200 transition-all group">
      <div className="space-y-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block group-hover:text-[var(--brand-primary)] transition-colors">{label}</span>
        <span className="text-sm font-bold text-[var(--accent-navy)]">{enabled ? "Enabled" : "Disabled"}</span>
      </div>
      
      <input type="hidden" name={name} value={enabled ? "true" : "false"} />
      
      <button
        type="button"
        onClick={() => setEnabled(!enabled)}
        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none shadow-inner ${
          enabled ? "bg-[var(--brand-primary)]" : "bg-gray-300"
        }`}
      >
        <span
          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-md ${
            enabled ? "translate-x-7" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

/**
 * Color Input Group with Hex/Picker Sync
 */
function ColorInput({ label, name, defaultValue }: { label: string, name: string, defaultValue: string }) {
  const [color, setColor] = useState(defaultValue || "#000000");

  return (
    <div className="space-y-3 group">
      <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">{label}</label>
      <div className="flex items-center bg-[#F8F8F8] p-3 rounded-2xl border-2 border-transparent group-hover:border-gray-200 transition-all shadow-sm">
        <input 
          type="color" 
          value={color} 
          onChange={(e) => setColor(e.target.value)}
          className="w-12 h-12 rounded-xl cursor-pointer border-none bg-transparent" 
        />
        <input 
          name={name}
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-full bg-transparent text-xs font-mono font-black text-center uppercase outline-none text-gray-600" 
        />
      </div>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button 
      type="submit" 
      disabled={pending}
      className="bg-[var(--accent-navy)] text-white px-12 py-6 rounded-3xl font-black uppercase tracking-widest text-sm hover:bg-[var(--brand-primary)] hover:text-white transition-all flex items-center gap-4 active:scale-95 disabled:opacity-70 shadow-2xl shadow-blue-900/30"
    >
      {pending ? <Loader2 className="animate-spin" size={22} /> : <Save size={22} />}
      {pending ? "Updating System..." : "Save Design System"}
    </button>
  );
}

export default function SettingsForm({ settings }: { settings: any }) {
  const { notifySuccess, notifyError } = useNotification();
  
  // Decoupled Typography State - CALIBRATED FOR 16PX ROOT
  const [fontSize, setFontSize] = useState(settings?.baseFontSize || 16);
  const [headingScale, setHeadingScale] = useState(settings?.headingFontSize || 1.0);
  const [bodyScale, setBodyScale] = useState(settings?.bodyFontSize || 1.0);


  // Header, Footer and Carousel:
const [headerScale, setHeaderScale] = useState(settings?.headerFontScale || 1.0);
const [footerScale, setFooterScale] = useState(settings?.footerFontScale || 1.0);
const [carouselScale, setCarouselScale] = useState(settings?.carouselFontScale || 1.0);



  async function clientAction(formData: FormData) {
    const result = await updateSiteSettings(formData);
    if (result.success) {
      notifySuccess(result.message);
    } else {
      notifyError(result.message);
    }
  }

async function handleHardReset() {
    if (!confirm("Reset to original 10px proportions?")) return;

    // 1. Reset Local State to your "Normal" (10px)
    setFontSize(10); 
    setHeadingScale(1.0);
    setBodyScale(1.0);
    setHeaderScale(1.0);
    setFooterScale(1.0);
    setCarouselScale(1.0);

    // 2. Prepare Default FormData with 10px baseline
    const resetData = new FormData();
    resetData.append("baseFontSize", "10");
    resetData.append("headingFontSize", "1.0");
    resetData.append("bodyFontSize", "1.0");
    resetData.append("headerFontScale", "1.0");
    resetData.append("footerFontScale", "1.0");
    resetData.append("carouselFontScale", "1.0");
    
    // Preserve current brand identity
    resetData.append("siteName", settings?.siteName || "MarvelMarts");

    const result = await updateSiteSettings(resetData);
    
    if (result.success) {
      notifySuccess("System Restored to 10px Baseline");
    } else {
      notifyError("Reset failed. Database sync required.");
    }
  }

  return (
    /* The design-system-isolated class ensures this form stays at 16px/1.0 scale 
       even when the admin is testing extreme storefront scales. */
    <div className="design-system-isolated">
      <form action={clientAction} className="space-y-10 pb-20">
        
        {/* SECTION 1: BRAND IDENTITY */}
        <section className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-xl border border-gray-100">
          <header className="flex items-center gap-4 mb-10">
            <div className="p-4 bg-blue-50 text-[var(--accent-navy)] rounded-2xl"><Globe size={28} /></div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter">Brand <span className="text-[var(--brand-primary)]">Identity</span></h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Global Assets & Naming</p>
            </div>
          </header>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Site Name</label>
              <input name="siteName" defaultValue={settings?.siteName} className="w-full bg-[#F8F8F8] rounded-2xl p-6 border-2 border-transparent focus:border-[var(--brand-primary)] outline-none font-bold text-lg" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Logo URL</label>
              <input name="siteLogo" defaultValue={settings?.siteLogo} placeholder="https://..." className="w-full bg-[#F8F8F8] rounded-2xl p-6 border-2 border-transparent focus:border-[var(--brand-primary)] outline-none font-bold text-lg" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Favicon URL</label>
              <input name="siteFavicon" defaultValue={settings?.siteFavicon} placeholder="https://..." className="w-full bg-[#F8F8F8] rounded-2xl p-6 border-2 border-transparent focus:border-[var(--brand-primary)] outline-none font-bold text-lg" />
            </div>
          </div>
        </section>

        {/* SECTION 2: DECOUPLED TYPOGRAPHY ENGINE */}
        <section className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-xl border border-gray-100">
          <header className="flex items-center gap-4 mb-10">
            <div className="p-4 bg-orange-50 text-[var(--brand-primary)] rounded-2xl"><Type size={28} /></div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter">Typography <span className="text-[var(--accent-navy)]">Engine</span></h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">16px Stabilized Root Control</p>
            </div>
            {/* THE RESET BUTTON */}
          <button 
            type="button"
            onClick={handleHardReset}
            className="px-6 py-3 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all border border-red-100"
          >
            Reset to Default
          </button>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-12">
            {/* Base Root Size - Layout Stability */}
            <div className="space-y-6">
              <div className="flex justify-between items-center px-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Base Root (Layout Scale)</label>
                  <span className="bg-[var(--accent-navy)] text-white px-4 py-2 rounded-xl text-sm font-black shadow-lg shadow-blue-900/20">{fontSize}px</span>
              </div>
              <input 
                  type="range" name="baseFontSize" min="10" max="20" 
                  value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="w-full h-3 bg-gray-100 rounded-xl appearance-none cursor-pointer accent-[var(--brand-primary)]" 
              />
              <p className="text-[9px] text-gray-400 font-bold px-2 italic">Standard is 16px. Adjusting this scales spacing & layout.</p>
            </div>

            {/* Heading Scale Slider */}
            <div className="space-y-6">
              <div className="flex justify-between items-center px-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Heading Scale Multiplier</label>
                  <span className="bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-black shadow-lg shadow-orange-900/20">{headingScale}x</span>
              </div>
              <input 
                  type="range" name="headingFontSize" min="0.5" max="2.0" step="0.05"
                  value={headingScale} onChange={(e) => setHeadingScale(parseFloat(e.target.value))}
                  className="w-full h-3 bg-gray-100 rounded-xl appearance-none cursor-pointer accent-orange-600" 
              />
            </div>

            {/* Body Scale Slider */}
            <div className="space-y-6">
              <div className="flex justify-between items-center px-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Body Text Scale Multiplier</label>
                  <span className="bg-gray-800 text-white px-4 py-2 rounded-xl text-sm font-black shadow-lg shadow-gray-900/20">{bodyScale}x</span>
              </div>
              <input 
                  type="range" name="bodyFontSize" min="0.5" max="1.5" step="0.05"
                  value={bodyScale} onChange={(e) => setBodyScale(parseFloat(e.target.value))}
                  className="w-full h-3 bg-gray-100 rounded-xl appearance-none cursor-pointer accent-gray-800" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Main Body Font</label>
              <select name="fontFamily" defaultValue={settings?.fontFamily} className="w-full bg-[#F8F8F8] rounded-2xl p-6 outline-none font-bold appearance-none cursor-pointer border-2 border-transparent focus:border-[var(--brand-primary)]">
                <option value="Inter">Inter (Modern Clean)</option>
                <option value="Outfit">Outfit (Tech Enterprise)</option>
                <option value="Montserrat">Montserrat (Classic Bold)</option>
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Heading Font</label>
              <select name="headingFont" defaultValue={settings?.headingFont} className="w-full bg-[#F8F8F8] rounded-2xl p-6 outline-none font-bold appearance-none cursor-pointer border-2 border-transparent focus:border-[var(--brand-primary)]">
                <option value="Outfit">Outfit (Default Heading)</option>
                <option value="Inter">Inter</option>
                <option value="Playfair Display">Playfair (Elegant)</option>
              </select>
            </div>
          </div>
        </section>

        {/* SECTION 3: COLOR SYSTEM */}
        <section className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-xl border border-gray-100">
          <header className="flex items-center gap-4 mb-10">
            <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl"><Palette size={28} /></div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter">Color <span className="text-purple-600">Palettes</span></h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Enterprise Branding System</p>
            </div>
          </header>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <ColorInput label="Primary (Navy)" name="primaryColor" defaultValue={settings?.primaryColor} />
            <ColorInput label="Secondary (Orange)" name="secondaryColor" defaultValue={settings?.secondaryColor} />
            <ColorInput label="Accent" name="accentColor" defaultValue={settings?.accentColor} />
            <ColorInput label="Body BG" name="bodyBg" defaultValue={settings?.bodyBg} />
            <ColorInput label="Card BG" name="cardBg" defaultValue={settings?.cardBg} />
            <ColorInput label="Sidebar BG" name="sidebarBg" defaultValue={settings?.sidebarBg} />
            <ColorInput label="Success" name="successColor" defaultValue={settings?.successColor} />
            <ColorInput label="Error" name="errorColor" defaultValue={settings?.errorColor} />
            <ColorInput label="Warning" name="warningColor" defaultValue={settings?.warningColor} />
            <ColorInput label="Info" name="infoColor" defaultValue={settings?.infoColor} />
            <ColorInput label="Border" name="borderDefault" defaultValue={settings?.borderDefault} />
            <ColorInput label="Text Primary" name="textPrimary" defaultValue={settings?.textPrimary} />
            <ColorInput label="Text Secondary" name="textSecondary" defaultValue={settings?.textSecondary} />
          </div>
        </section>

        {/* SECTION 4: SYSTEM CONTROL */}
        <section className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-xl border border-gray-100">
          <header className="flex items-center gap-4 mb-10">
            <div className="p-4 bg-red-50 text-red-600 rounded-2xl"><ShieldAlert size={28} /></div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter">System <span className="text-red-600">Control</span></h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Feature Toggles & Safety</p>
            </div>
          </header>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Toggle name="flashSaleActive" label="Global Flash Sale Module" defaultChecked={settings?.flashSaleActive} />
            <Toggle name="maintenanceMode" label="Maintenance Mode (Public Lock)" defaultChecked={settings?.maintenanceMode} />
          </div>
        </section>

        {/* SECTION 5: CONTACT & FOOTER */}
        <section className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-xl border border-gray-100">
          <header className="flex items-center gap-4 mb-10">
            <div className="p-4 bg-green-50 text-green-600 rounded-2xl"><Phone size={28} /></div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter">Contact <span className="text-green-600">Infrastructure</span></h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Public Facing Support Info</p>
            </div>
          </header>
          
          <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <input name="supportPhone" placeholder="Customer Support Phone" defaultValue={settings?.supportPhone} className="bg-[#F8F8F8] rounded-2xl p-6 outline-none font-bold text-lg border-2 border-transparent focus:border-[var(--brand-primary)]" />
                  <input name="supportEmail" placeholder="Support Email" defaultValue={settings?.supportEmail} className="bg-[#F8F8F8] rounded-2xl p-6 outline-none font-bold text-lg border-2 border-transparent focus:border-[var(--brand-primary)]" />
              </div>
              <textarea name="footerDesc" defaultValue={settings?.footerDesc} placeholder="Footer description text..." className="w-full bg-[#F8F8F8] rounded-2xl p-6 min-h-[120px] outline-none font-medium text-lg border-2 border-transparent focus:border-[var(--brand-primary)]" />
          </div>
        </section>

        {/* SECTION: HOME PAGE LAYOUT */}
        <section className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-xl border border-gray-100">
          <header className="flex items-center gap-4 mb-10">
            <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl"><Globe size={28} /></div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter">Front Page <span className="text-indigo-600">Layout</span></h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Enable/Disable Storefront Sections</p>
            </div>
          </header>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Toggle name="showHeroCarousel" label="Hero Banner Carousel" defaultChecked={settings?.showHeroCarousel} />
            <Toggle name="showFlashSales" label="Flash Sales Section" defaultChecked={settings?.showFlashSales} />
            <Toggle name="showFeaturedCategories" label="Category Highlights" defaultChecked={settings?.showFeaturedCategories} />
            <Toggle name="showTrendingCarousel" label="Trending Products" defaultChecked={settings?.showTrendingCarousel} />
            <Toggle name="showFeaturedProducts" label="Featured Grid" defaultChecked={settings?.showFeaturedProducts} />
            <Toggle name="showNewArrivals" label="New Arrivals Section" defaultChecked={settings?.showNewArrivals} />
          </div>
        </section>

        {/* SECTION: HEADER ARCHITECTURE */}
        <section className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-xl border border-gray-100">
          <header className="flex items-center gap-4 mb-10">
            <div className="p-4 bg-teal-50 text-teal-600 rounded-2xl"><LayoutPanelTop size={28} /></div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter">Header <span className="text-teal-600">Architecture</span></h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Sticky Behavior & Component Visibility</p>
            </div>
          </header>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Toggle name="stickyHeader" label="Sticky Header (Float)" defaultChecked={settings?.stickyHeader} />
            <Toggle name="showCategoryMenu" label="Show Category Menu" defaultChecked={settings?.showCategoryMenu} />
            <Toggle name="showSearchBar" label="Enable Global Search" defaultChecked={settings?.showSearchBar} />
            <Toggle name="showHelpMenu" label="Mobile Help Icon" defaultChecked={settings?.showHelpMenu} />
            <Toggle name="showCartDrawer" label="Mobile Cart Icon" defaultChecked={settings?.showCartDrawer} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10 border-t pt-10">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Header Height (Desktop - px)</label>
              <input 
                type="number" 
                name="headerHeightDesktop" 
                defaultValue={settings?.headerHeightDesktop || 55} 
                className="w-full bg-[#F8F8F8] rounded-2xl p-6 border-2 border-transparent focus:border-teal-600 outline-none font-bold text-lg" 
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Header Height (Mobile - px)</label>
              <input 
                type="number" 
                name="headerHeightMobile" 
                defaultValue={settings?.headerHeightMobile || 35} 
                className="w-full bg-[#F8F8F8] rounded-2xl p-6 border-2 border-transparent focus:border-teal-600 outline-none font-bold text-lg" 
              />
            </div>
          </div>
        </section>

        <section className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-xl border border-gray-100">
          <header className="flex items-center gap-4 mb-10">
            <div className="p-4 bg-teal-50 text-teal-600 rounded-2xl"><LayoutPanelTop size={28} /></div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter">Zone <span className="text-teal-600">Scales</span></h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Standalone Typography Control</p>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Header Scale */}
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Header Nav Scale</label>
              <div className="flex items-center gap-4">
                <input type="range" name="headerFontScale" min="0.8" max="1.5" step="0.05" 
                      value={headerScale} onChange={(e) => setHeaderScale(parseFloat(e.target.value))}
                      className="w-full accent-teal-600" />
                <span className="font-bold text-sm">{headerScale}x</span>
              </div>
            </div>

            {/* Footer Scale */}
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Footer Text Scale</label>
              <div className="flex items-center gap-4">
                <input type="range" name="footerFontScale" min="0.8" max="1.5" step="0.05" 
                      value={footerScale} onChange={(e) => setFooterScale(parseFloat(e.target.value))}
                      className="w-full accent-gray-600" />
                <span className="font-bold text-sm">{footerScale}x</span>
              </div>
            </div>

            {/* Carousel Scale */}
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Carousel Hero Scale</label>
              <div className="flex items-center gap-4">
                <input type="range" name="carouselFontScale" min="0.8" max="2.0" step="0.1" 
                      value={carouselScale} onChange={(e) => setCarouselScale(parseFloat(e.target.value))}
                      className="w-full accent-orange-600" />
                <span className="font-bold text-sm">{carouselScale}x</span>
              </div>
            </div>
          </div>
        </section>

        <div className="flex justify-center pt-10 sticky bottom-10 z-50">
          <SubmitButton />
        </div>

      </form>
    </div>
  );
}
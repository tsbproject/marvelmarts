// "use client";

// import React, {
//   createContext,
//   useContext,
//   useState,
//   useEffect,
//   ReactNode,
// } from "react";

// // ── Type Definitions ────────────────────────────────────────────────────────
// // Matches your Prisma SiteSettings model exactly
// interface SiteSettings {
//   id: number;

//   // Colors
//   accentNavy?: string;
//   brandPrimary?: string;
//   brandOrangeLight?: string;
//   neutralWhite?: string;
//   neutralLight?: string;
//   neutralGray?: string;
//   neutralDark?: string;

//   // Scales & Typography
//   layoutScale?: number;
//   baseFontSize?: number;
//   bodyFontScale?: number;
//   headingFontScale?: number;
//   headerFontScale?: number;
//   footerFontScale?: number;
//   carouselFontScale?: number;

//   // Header
//   headerBg?: string;
//   headerText?: string;
//   headerBorder?: string;
//   showSearchBar?: boolean;

//   // Footer
//   footerBg?: string;
//   footerText?: string;
//   showSocialIcons?: boolean;

//   // ProductCard
//   productCardRadius?: string;
//   productCardShadow?: string;
//   productPriceColor?: string;
//   addToCartBg?: string;
//   addToCartText?: string;

//   // Frontpage visibility toggles
//   showFeaturedProducts?: boolean;
//   showEcommerceCarousel?: boolean;
//   showFlashSales?: boolean;
//   showFeaturedCategories?: boolean;
//   showTrendingProducts?: boolean;
//   showNewArrivals?: boolean;
//   showTestimonials?: boolean;

//   // Other components
//   cartDrawerPosition?: "left" | "right";
//   cartDrawerWidth?: string;
//   helpMenuPosition?: "bottom-left" | "bottom-right";
// }

// // Default fallback values (matches your globals.css defaults)
// const defaultSettings: SiteSettings = {
//   id: 1,
//   accentNavy: "#002B5B",
//   brandPrimary: "#F7931E",
//   brandOrangeLight: "#FFE8CC",
//   neutralWhite: "#FFFFFF",
//   neutralLight: "#F8F8F8",
//   neutralGray: "#4B4B4B",
//   neutralDark: "#1E1E1E",

//   layoutScale: 1.0,
//   baseFontSize: 16,
//   bodyFontScale: 1.0,
//   headingFontScale: 1.0,
//   headerFontScale: 1.0,
//   footerFontScale: 1.0,
//   carouselFontScale: 1.0,

//   headerBg: "#FFFFFF",
//   headerText: "#000000",
//   headerBorder: "transparent",
//   showSearchBar: true,

//   footerBg: "#F8F8F8",
//   footerText: "#333333",
//   showSocialIcons: true,

//   productCardRadius: "2rem",
//   productCardShadow: "sm",
//   productPriceColor: "#002B5B",
//   addToCartBg: "#002B5B",
//   addToCartText: "#FFFFFF",

//   showFeaturedProducts: true,
//   showEcommerceCarousel: true,
//   showFlashSales: true,
//   showFeaturedCategories: true,
//   showTrendingProducts: true,
//   showNewArrivals: true,
//   showTestimonials: true,

//   cartDrawerPosition: "right",
//   cartDrawerWidth: "400px",
//   helpMenuPosition: "bottom-right",
// };

// // ── Context Type ────────────────────────────────────────────────────────────
// interface GlobalSettingsContextType {
//   settings: SiteSettings;
//   isLoading: boolean;
//   error: string | null;
//   refreshSettings: () => Promise<void>;
// }

// const GlobalSettingsContext = createContext<GlobalSettingsContextType | undefined>(
//   undefined
// );

// // ── Provider Component ──────────────────────────────────────────────────────
// export function GlobalSettingsProvider({ children }: { children: ReactNode }) {
  
//   const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const fetchSettings = async () => {
//     try {
//       setIsLoading(true);
//       setError(null);

//       const res = await fetch("/api/site-settings", {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         cache: "no-store", // Force fresh data – critical for dynamic updates
//       });

//       if (!res.ok) {
//         const errorText = await res.text().catch(() => "");
//         throw new Error(`Failed to fetch settings: ${res.status} ${res.statusText} - ${errorText}`);
//       }

//       const data: SiteSettings = await res.json();

//       // Merge with defaults to ensure no undefined values
//       setSettings((prev) => ({ ...prev, ...data }));
//       setError(null);
//     } catch (err: any) {
//       console.error("Error fetching global settings:", err);
//       setError(err.message || "Failed to load site settings. Using defaults.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Fetch on mount
//   useEffect(() => {
//     fetchSettings();
//   }, []);

//   // Refresh function (called after admin save)
//   const refreshSettings = async () => {
//     await fetchSettings();
//   };

//   const value: GlobalSettingsContextType = {
//     settings,
//     isLoading,
//     error,
//     refreshSettings,
//   };

//   return (
//     <GlobalSettingsContext.Provider value={value}>
//       {children}
//     </GlobalSettingsContext.Provider>
//   );
// }

// // ── Custom Hook ─────────────────────────────────────────────────────────────
// export function useGlobalSettings() {
//   const context = useContext(GlobalSettingsContext);

//   if (context === undefined) {
//     throw new Error(
//       "useGlobalSettings must be used within a GlobalSettingsProvider"
//     );
//   }

//   return context;
  
// }


// export function useDefaultSettings() {
//   const context = useContext(GlobalSettingsContext);

//   if (context === undefined) {
//     throw new Error(
//       "useGlobalSettings must be used within a GlobalSettingsProvider"
//     );
//   }

//   return context;
  
// }



"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// ── Type Definitions ────────────────────────────────────────────────────────
// Matches your Prisma SiteSettings model + new expanded footer fields
interface SiteSettings {
  id: number;

  // Colors
  accentNavy?: string;
  brandPrimary?: string;
  brandOrangeLight?: string;
  neutralWhite?: string;
  neutralLight?: string;
  neutralGray?: string;
  neutralDark?: string;

  // Scales & Typography
  layoutScale?: number;
  baseFontSize?: number;
  bodyFontScale?: number;
  headingFontScale?: number;
  headerFontScale?: number;
  footerFontScale?: number;
  carouselFontScale?: number;

  // Header
  headerBg?: string;
  headerText?: string;
  headerBorder?: string;
  showSearchBar?: boolean;

  // Footer – expanded
  footerBg?: string;
  footerText?: string;
  footerLogo?: string;                     // Cloudinary URL or path
  footerBodyFontSize?: number;             // px
  footerHeadingFontSize?: number;          // px
  showSocialIcons?: boolean;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  whatsappUrl?: string;

  // ProductCard
  productCardRadius?: string;
  productCardShadow?: string;
  productPriceColor?: string;
  addToCartBg?: string;
  addToCartText?: string;

  // Frontpage visibility toggles
  showFeaturedProducts?: boolean;
  showEcommerceCarousel?: boolean;
  showFlashSales?: boolean;
  showFeaturedCategories?: boolean;
  showTrendingProducts?: boolean;
  showNewArrivals?: boolean;
  showTestimonials?: boolean;

  // Other components
  cartDrawerPosition?: "left" | "right";
  cartDrawerWidth?: string;
  helpMenuPosition?: "bottom-left" | "bottom-right";
}

// Default fallback values (matches your globals.css defaults + new fields)
const defaultSettings: SiteSettings = {
  id: 1,
  accentNavy: "#002B5B",
  brandPrimary: "#F7931E",
  brandOrangeLight: "#FFE8CC",
  neutralWhite: "#FFFFFF",
  neutralLight: "#F8F8F8",
  neutralGray: "#4B4B4B",
  neutralDark: "#1E1E1E",

  layoutScale: 1.0,
  baseFontSize: 16,
  bodyFontScale: 1.0,
  headingFontScale: 1.0,
  headerFontScale: 1.0,
  footerFontScale: 1.0,
  carouselFontScale: 1.0,

  headerBg: "#FFFFFF",
  headerText: "#000000",
  headerBorder: "transparent",
  showSearchBar: true,

  footerBg: "#F8F8F8",
  footerText: "#333333",
  footerLogo: "/logo.png",                    // fallback logo
  footerBodyFontSize: 16,                     // px
  footerHeadingFontSize: 20,                  // px
  showSocialIcons: true,
  facebookUrl: "",
  instagramUrl: "",
  twitterUrl: "",
  whatsappUrl: "",

  productCardRadius: "2rem",
  productCardShadow: "sm",
  productPriceColor: "#002B5B",
  addToCartBg: "#002B5B",
  addToCartText: "#FFFFFF",

  showFeaturedProducts: true,
  showEcommerceCarousel: true,
  showFlashSales: true,
  showFeaturedCategories: true,
  showTrendingProducts: true,
  showNewArrivals: true,
  showTestimonials: true,

  cartDrawerPosition: "right",
  cartDrawerWidth: "400px",
  helpMenuPosition: "bottom-right",
};

// ── Context Type ────────────────────────────────────────────────────────────
interface GlobalSettingsContextType {
  settings: SiteSettings;
  isLoading: boolean;
  error: string | null;
  refreshSettings: () => Promise<void>;
}

const GlobalSettingsContext = createContext<GlobalSettingsContextType | undefined>(
  undefined
);

// ── Provider Component ──────────────────────────────────────────────────────
export function GlobalSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await fetch("/api/site-settings", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store", // Force fresh data – critical for dynamic updates
      });

      if (!res.ok) {
        const errorText = await res.text().catch(() => "");
        throw new Error(
          `Failed to fetch settings: ${res.status} ${res.statusText} - ${errorText}`
        );
      }

      const data: SiteSettings = await res.json();

      // Merge with defaults to ensure no undefined values
      setSettings((prev) => ({ ...prev, ...data }));
      setError(null);
    } catch (err: any) {
      console.error("Error fetching global settings:", err);
      setError(err.message || "Failed to load site settings. Using defaults.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  // Refresh function (called after admin saves changes)
  const refreshSettings = async () => {
    await fetchSettings();
  };

  const value: GlobalSettingsContextType = {
    settings,
    isLoading,
    error,
    refreshSettings,
  };

  return (
    <GlobalSettingsContext.Provider value={value}>
      {children}
    </GlobalSettingsContext.Provider>
  );
}

// ── Custom Hook ─────────────────────────────────────────────────────────────
export function useGlobalSettings() {
  const context = useContext(GlobalSettingsContext);

  if (context === undefined) {
    throw new Error(
      "useGlobalSettings must be used within a GlobalSettingsProvider"
    );
  }

  return context;
}



export function useDefaultSettings() {
  const context = useContext(GlobalSettingsContext);

  if (context === undefined) {
    throw new Error(
      "useGlobalSettings must be used within a GlobalSettingsProvider"
    );
  }

  return context;
}
// "use client";

// import { useGlobalSettings } from "@/app/_context/GlobalSettingsContext";
// import { useEffect } from "react";

// export default function DynamicStyles() {
//   const { settings, isLoading } = useGlobalSettings();

//   // Prevent render/hydration issues while loading or settings missing
//   if (isLoading || !settings) {
//     return null;
//   }

//   // Debug: confirm new settings are received
//   useEffect(() => {
//     console.log("DynamicStyles received updated settings:", {
//       headerBg: settings.headerBg,
//       footerBg: settings.footerBg,
//       headerText: settings.headerText,
//       footerText: settings.footerText,
//     });
//   }, [settings]);

//   return (
//     <style jsx global>{`
//       :root {
//         /* ── Colors ──────────────────────────────────────────────── */
//         --accent-navy: ${settings.accentNavy || "#002B5B"};
//         --brand-primary: ${settings.brandPrimary || "#F7931E"};
//         --brand-orange-light: ${settings.brandOrangeLight || "#FFE8CC"};
//         --neutral-white: ${settings.neutralWhite || "#FFFFFF"};
//         --neutral-light: ${settings.neutralLight || "#F8F8F8"};
//         --neutral-gray: ${settings.neutralGray || "#4B4B4B"};
//         --neutral-dark: ${settings.neutralDark || "#1E1E1E"};

//         /* ── Layout & Spacing ────────────────────────────────────── */
//         --layout-scale: ${settings.layoutScale ?? 1.0};

//         /* ── Typography Scales ───────────────────────────────────── */
//         --base-font-size: ${settings.baseFontSize ?? 16}px;
//         --body-font-scale: ${settings.bodyFontScale ?? 1.0};
//         --heading-font-scale: ${settings.headingFontScale ?? 1.0};
//         --header-font-scale: ${settings.headerFontScale ?? 1.0};
//         --footer-font-scale: ${settings.footerFontScale ?? 1.0};
//         --carousel-font-scale: ${settings.carouselFontScale ?? 1.0};

//         /* ── Header ──────────────────────────────────────────────── */
//         --header-bg: ${settings.headerBg || "#FFFFFF"};
//         --header-text: ${settings.headerText || "#000000"};
//         --header-border: ${settings.headerBorder || "transparent"};

//         /* ── Footer ──────────────────────────────────────────────── */
//         --footer-bg: ${settings.footerBg || "#F8F8F8"};
//         --footer-text: ${settings.footerText || "#333333"};

//         /* ── ProductCard ─────────────────────────────────────────── */
//         --product-card-radius: ${settings.productCardRadius || "2rem"};
//         --product-card-shadow: ${settings.productCardShadow || "0 1px 3px rgba(0,0,0,0.1)"};
//         --product-price-color: ${settings.productPriceColor || "var(--accent-navy)"};
//         --add-to-cart-bg: ${settings.addToCartBg || "var(--accent-navy)"};
//         --add-to-cart-text: ${settings.addToCartText || "#FFFFFF"};
//       }

//       /* ── Apply visibility rules (only fields that exist in model) ────── */
//       [data-section="featured-products"][data-visible="false"],
//       [data-section-featured-products] {
//         display: ${settings.showFeaturedProducts ? "block" : "none"} !important;
//       }

//       [data-section="ecommerce-carousel"][data-visible="false"],
//       [data-section-ecommerce-carousel] {
//         display: ${settings.showEcommerceCarousel ? "block" : "none"} !important;
//       }


//       [data-section="featured-products"][data-visible="false"],
//       [data-section-featured-products] {
//         display: ${settings.showFeaturedProducts ? "block" : "none"} !important;
//       }

//        [data-section="featured-categories"][data-visible="false"],
//       [data-section-featured-categories] {
//         display: ${settings.showFeaturedCategories ? "block" : "none"} !important;
//       }


//        [data-section="new-arrivals"][data-visible="false"],
//       [data-section-new-arrivals] {
//         display: ${settings.showNewArrivals ? "block" : "none"} !important;
//       }


//        [data-section="flash-sales"][data-visible="false"],
//       [data-section-flash-sales] {
//         display: ${settings.showFlashSales ? "block" : "none"} !important;
//       }

//        [data-section="trending-products"][data-visible="false"],
//       [data-section-trending-products] {
//         display: ${settings.showTrendingProducts ? "block" : "none"} !important;
//       }

      


//       /* ── Component-specific overrides ────────────────────────── */
//       header,
//       .header {
//         background-color: var(--header-bg);
//         color: var(--header-text);
//         border-bottom: 1px solid var(--header-border);
//       }

//       footer,
//       .footer {
//         background-color: var(--footer-bg);
//         color: var(--footer-text);
//       }

//       .product-card {
//         border-radius: var(--product-card-radius);
//         box-shadow: var(--product-card-shadow);
//         background-color: var(--neutral-white);
//       }

//       .product-price {
//         color: var(--product-price-color) !important;
//       }

//       .add-to-cart-btn {
//         background-color: var(--add-to-cart-bg);
//         color: var(--add-to-cart-text);
//       }

//       /* Typography scaling (applied globally) */
//       body {
//         font-size: calc(var(--base-font-size) * var(--body-font-scale));
//       }

//       h1,
//       h2,
//       h3,
//       h4,
//       h5,
//       h6 {
//         font-size: calc(1em * var(--heading-font-scale));
//       }

//       /* Header-specific font scaling */
//       header {
//         --body-font-scale: var(--header-font-scale) !important;
//         --heading-font-scale: var(--header-font-scale) !important;
//       }

//       /* Footer-specific font scaling */
//       footer {
//         --body-font-scale: var(--footer-font-scale) !important;
//         --heading-font-scale: var(--footer-font-scale) !important;
//       }
//     `}</style>
//   );
// }





"use client";

import { useGlobalSettings } from "@/app/_context/GlobalSettingsContext";
import { useEffect } from "react";

export default function DynamicStyles() {
  const { settings, isLoading } = useGlobalSettings();

  // ALL hooks must come first - before any early return
  useEffect(() => {
    // Debug: confirm new settings are received
    console.log("Injecting CSS with headerBg:", settings.headerBg);
    console.log("DynamicStyles received updated settings:", {
      headerBg: settings?.headerBg,
      footerBg: settings?.footerBg,
      headerText: settings?.headerText,
      footerText: settings?.footerText,
      
    });
  }, [settings]); // ← dependency on settings (re-runs when it changes)

  // Now safe to early return
  if (isLoading || !settings) {
    return null;
  }

  return (
    <style jsx global>{`
      :root {
        /* ── Colors ──────────────────────────────────────────────── */
        --accent-navy: ${settings.accentNavy || "#002B5B"};
        --brand-primary: ${settings.brandPrimary || "#F7931E"};
        --brand-orange-light: ${settings.brandOrangeLight || "#FFE8CC"};
        --neutral-white: ${settings.neutralWhite || "#FFFFFF"};
        --neutral-light: ${settings.neutralLight || "#F8F8F8"};
        --neutral-gray: ${settings.neutralGray || "#4B4B4B"};
        --neutral-dark: ${settings.neutralDark || "#1E1E1E"};

        /* ── Layout & Spacing ────────────────────────────────────── */
        --layout-scale: ${settings.layoutScale ?? 1.0};

        /* ── Typography Scales ───────────────────────────────────── */
        --base-font-size: ${settings.baseFontSize ?? 16}px;
        --body-font-scale: ${settings.bodyFontScale ?? 1.0};
        --heading-font-scale: ${settings.headingFontScale ?? 1.0};
        --header-font-scale: ${settings.headerFontScale ?? 1.0};
        --footer-font-scale: ${settings.footerFontScale ?? 1.0};
        --carousel-font-scale: ${settings.carouselFontScale ?? 1.0};

        /* ── Header ──────────────────────────────────────────────── */
        --header-bg: ${settings.headerBg || "#FFFFFF"};
        --header-text: ${settings.headerText || "#000000"};
        --header-border: ${settings.headerBorder || "transparent"};

        /* ── Footer ──────────────────────────────────────────────── */
        --footer-bg: ${settings.footerBg || "#F8F8F8"};
        --footer-text: ${settings.footerText || "#333333"};

        /* ── ProductCard ─────────────────────────────────────────── */
        --product-card-radius: ${settings.productCardRadius || "2rem"};
        --product-card-shadow: ${settings.productCardShadow || "0 1px 3px rgba(0,0,0,0.1)"};
        --product-price-color: ${settings.productPriceColor || "var(--accent-navy)"};
        --add-to-cart-bg: ${settings.addToCartBg || "var(--accent-navy)"};
        --add-to-cart-text: ${settings.addToCartText || "#FFFFFF"};
        
      }

         [data-section="featured-products"][data-visible="false"],
      [data-section-featured-products] {
        display: ${settings.showFeaturedProducts ? "block" : "none"} !important;
      }

      [data-section="ecommerce-carousel"][data-visible="false"],
      [data-section-ecommerce-carousel] {
        display: ${settings.showEcommerceCarousel ? "block" : "none"} !important;
      }


      [data-section="featured-products"][data-visible="false"],
      [data-section-featured-products] {
        display: ${settings.showFeaturedProducts ? "block" : "none"} !important;
      }

       [data-section="featured-categories"][data-visible="false"],
      [data-section-featured-categories] {
        display: ${settings.showFeaturedCategories ? "block" : "none"} !important;
      }


       [data-section="new-arrivals"][data-visible="false"],
      [data-section-new-arrivals] {
        display: ${settings.showNewArrivals ? "block" : "none"} !important;
      }


       [data-section="flash-sales"][data-visible="false"],
      [data-section-flash-sales] {
        display: ${settings.showFlashSales ? "block" : "none"} !important;
      }

       [data-section="trending-products"][data-visible="false"],
      [data-section-trending-products] {
        display: ${settings.showTrendingProducts ? "block" : "none"} !important;
      }

      

      /* ── Component-specific overrides ────────────────────────── */
      header,
      .header {
        background-color: var(--header-bg);
        color: var(--header-text);
        border-bottom: 1px solid var(--header-border);
      }

      footer,
      .footer {
        background-color: var(--footer-bg);
        color: var(--footer-text);
      }

      .product-card {
        border-radius: var(--product-card-radius);
        box-shadow: var(--product-card-shadow);
        background-color: var(--neutral-white);
      }

      .product-price {
        color: var(--product-price-color) !important;
      }

      .add-to-cart-btn {
        background-color: var(--add-to-cart-bg);
        color: var(--add-to-cart-text);
      }

      /* Typography scaling (applied globally) */
      body {
        font-size: calc(var(--base-font-size) * var(--body-font-scale));
      }

      h1,
      h2,
      h3,
      h4,
      h5,
      h6 {
        font-size: calc(1em * var(--heading-font-scale));
      }

      /* Header-specific font scaling */
      header {
        --body-font-scale: var(--header-font-scale) !important;
        --heading-font-scale: var(--header-font-scale) !important;
      }

      /* Footer-specific font scaling */
      footer {
        --body-font-scale: var(--footer-font-scale) !important;
        --heading-font-scale: var(--footer-font-scale) !important;
      }
    `}</style>
  );
}
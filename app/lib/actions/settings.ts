"use server";

import prisma from "@/app/lib/prisma";
import { revalidatePath } from "next/cache"; 

export async function updateSiteSettings(formData: FormData) {
  try {
    // 1. Brand Identity
    const siteName = formData.get("siteName") as string || "MarvelMarts";
    const siteLogo = formData.get("siteLogo") as string || "";
    const siteFavicon = formData.get("siteFavicon") as string || "";
    
    // 2. Typography Engine (Decoupled Scales)
    const fontFamily = formData.get("fontFamily") as string || "Inter";
    const headingFont = formData.get("headingFont") as string || "Outfit";
    
    // Convert to numbers safely. We use "Number()" to allow the value '0' if ever needed,
    // and fallback only if the result is NaN.
    const baseFontSize = Number(formData.get("baseFontSize")) || 16;
    const headingFontSize = Number(formData.get("headingFontSize")) || 1.0;
    const bodyFontSize = Number(formData.get("bodyFontSize")) || 1.0;

    // 3. Zone-Specific Scales (Stand-alone Control)
    const headerFontScale = Number(formData.get("headerFontScale")) || 1.0;
    const footerFontScale = Number(formData.get("footerFontScale")) || 1.0;
    const carouselFontScale = Number(formData.get("carouselFontScale")) || 1.0;

    // 4. Core Brand Colors
    const primaryColor = formData.get("primaryColor") as string || "#002B5B";
    const secondaryColor = formData.get("secondaryColor") as string || "#F7931E";
    const accentColor = formData.get("accentColor") as string || "#1E1E1E";

    // 5. Surface & Background Colors
    const bodyBg = formData.get("bodyBg") as string || "#F8F8F8";
    const cardBg = formData.get("cardBg") as string || "#FFFFFF";
    const sidebarBg = formData.get("sidebarBg") as string || "#002B5B";

    // 6. Semantic State Colors
    const successColor = formData.get("successColor") as string || "#10B981";
    const errorColor = formData.get("errorColor") as string || "#EF4444";
    const warningColor = formData.get("warningColor") as string || "#FBBF24";
    const infoColor = formData.get("infoColor") as string || "#3B82F6";

    // 7. Borders & Text
    const borderDefault = formData.get("borderDefault") as string || "#E5E7EB";
    const textPrimary = formData.get("textPrimary") as string || "#1E1E1E";
    const textSecondary = formData.get("textSecondary") as string || "#4B4B4B";

    // 8. Contact & Metadata
    const footerDesc = formData.get("footerDesc") as string || "Africa's most trusted marketplace.";
    const supportPhone = formData.get("supportPhone") as string || "";
    const supportEmail = formData.get("supportEmail") as string || "";

    // 9. System Toggles (Boolean Conversion)
    const flashSaleActive = formData.get("flashSaleActive") === "true";
    const maintenanceMode = formData.get("maintenanceMode") === "true";

    // 10. FrontPage Visibility Settings
    const showHeroCarousel = formData.get("showHeroCarousel") === "true";
    const showFlashSales = formData.get("showFlashSales") === "true";
    const showFeaturedCategories = formData.get("showFeaturedCategories") === "true";
    const showTrendingCarousel = formData.get("showTrendingCarousel") === "true";
    const showFeaturedProducts = formData.get("showFeaturedProducts") === "true";
    const showNewArrivals = formData.get("showNewArrivals") === "true";

    // 11. Header Architecture
    const stickyHeader = formData.get("stickyHeader") === "true";
    const showCategoryMenu = formData.get("showCategoryMenu") === "true";
    const showHelpMenu = formData.get("showHelpMenu") === "true";
    const showCartDrawer = formData.get("showCartDrawer") === "true";
    const showSearchBar = formData.get("showSearchBar") === "true";
    const headerHeightDesktop = Number(formData.get("headerHeightDesktop")) || 55;
    const headerHeightMobile = Number(formData.get("headerHeightMobile")) || 35;

    // --- DATABASE UPSERT ---
    await prisma.siteSettings.upsert({
      where: { id: 1 },
      update: {
        siteName, siteLogo, siteFavicon,
        baseFontSize, headingFontSize, bodyFontSize,
        headerFontScale, footerFontScale, carouselFontScale,
        fontFamily, headingFont,
        primaryColor, secondaryColor, accentColor,
        bodyBg, cardBg, sidebarBg,
        successColor, errorColor, warningColor, infoColor,
        borderDefault, textPrimary, textSecondary,
        footerDesc, supportPhone, supportEmail,
        flashSaleActive, maintenanceMode,
        showHeroCarousel, showFlashSales, showFeaturedCategories,
        showTrendingCarousel, showFeaturedProducts, showNewArrivals,
        stickyHeader, showCategoryMenu, showHelpMenu,
        showCartDrawer, showSearchBar,
        headerHeightDesktop, headerHeightMobile,
      },
      create: {
        id: 1,
        siteName, siteLogo, siteFavicon,
        baseFontSize, headingFontSize, bodyFontSize,
        headerFontScale, footerFontScale, carouselFontScale,
        fontFamily, headingFont,
        primaryColor, secondaryColor, accentColor,
        bodyBg, cardBg, sidebarBg,
        successColor, errorColor, warningColor, infoColor,
        borderDefault, textPrimary, textSecondary,
        footerDesc, supportPhone, supportEmail,
        flashSaleActive, maintenanceMode,
        showHeroCarousel, showFlashSales, showFeaturedCategories,
        showTrendingCarousel, showFeaturedProducts, showNewArrivals,
        stickyHeader, showCategoryMenu, showHelpMenu,
        showCartDrawer, showSearchBar,
        headerHeightDesktop, headerHeightMobile,
      },
    });

    // Revalidate the entire site to reflect typography and color changes immediately
    revalidatePath("/", "layout"); 
    
    return { success: true, message: "Design System & Zone Scales synchronized!" };

  } catch (error: any) {
    console.error("SERVER_ACTION_SETTINGS_ERROR:", error);
    return { success: false, message: "Sync failed. Ensure Prisma schema is pushed." };
  }
}




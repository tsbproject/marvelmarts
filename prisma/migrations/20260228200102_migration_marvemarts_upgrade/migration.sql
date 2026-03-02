/*
  Warnings:

  - You are about to drop the `SiteSettings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "SiteSettings";

-- CreateTable
CREATE TABLE "site_settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "accentNavy" TEXT DEFAULT '#002B5B',
    "brandPrimary" TEXT DEFAULT '#F7931E',
    "brandOrangeLight" TEXT DEFAULT '#FFE8CC',
    "neutralWhite" TEXT DEFAULT '#FFFFFF',
    "neutralLight" TEXT DEFAULT '#F8F8F8',
    "neutralGray" TEXT DEFAULT '#4B4B4B',
    "neutralDark" TEXT DEFAULT '#1E1E1E',
    "layoutScale" DOUBLE PRECISION DEFAULT 1.0,
    "baseFontSize" INTEGER DEFAULT 16,
    "bodyFontScale" DOUBLE PRECISION DEFAULT 1.0,
    "headingFontScale" DOUBLE PRECISION DEFAULT 1.0,
    "headerFontScale" DOUBLE PRECISION DEFAULT 1.0,
    "footerFontScale" DOUBLE PRECISION DEFAULT 1.0,
    "carouselFontScale" DOUBLE PRECISION DEFAULT 1.0,
    "headerBg" TEXT DEFAULT '#FFFFFF',
    "headerText" TEXT DEFAULT '#000000',
    "headerBorder" TEXT DEFAULT 'transparent',
    "showSearchBar" BOOLEAN NOT NULL DEFAULT true,
    "footerBg" TEXT DEFAULT '#F8F8F8',
    "footerText" TEXT DEFAULT '#333333',
    "showSocialIcons" BOOLEAN NOT NULL DEFAULT true,
    "productCardRadius" TEXT DEFAULT '2rem',
    "productCardShadow" TEXT DEFAULT 'sm',
    "productPriceColor" TEXT DEFAULT '#002B5B',
    "addToCartBg" TEXT DEFAULT '#002B5B',
    "addToCartText" TEXT DEFAULT '#FFFFFF',
    "showHero" BOOLEAN NOT NULL DEFAULT true,
    "showFeaturedProducts" BOOLEAN NOT NULL DEFAULT true,
    "showCategories" BOOLEAN NOT NULL DEFAULT true,
    "showHeroCarousel" BOOLEAN NOT NULL DEFAULT true,
    "showFlashSales" BOOLEAN NOT NULL DEFAULT true,
    "showFeaturedCategories" BOOLEAN NOT NULL DEFAULT true,
    "showTrendingCarousel" BOOLEAN NOT NULL DEFAULT true,
    "showNewArrivals" BOOLEAN NOT NULL DEFAULT true,
    "showTestimonials" BOOLEAN NOT NULL DEFAULT true,
    "cartDrawerPosition" TEXT DEFAULT 'right',
    "cartDrawerWidth" TEXT DEFAULT '400px',
    "helpMenuPosition" TEXT DEFAULT 'bottom-right',

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "showFeaturedCategories" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showFeaturedProducts" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showFlashSales" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showHeroCarousel" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showNewArrivals" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showTrendingCarousel" BOOLEAN NOT NULL DEFAULT true;

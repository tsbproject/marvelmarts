/*
  Warnings:

  - You are about to drop the column `showTrendingCarousel` on the `site_settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "site_settings" DROP COLUMN "showTrendingCarousel",
ADD COLUMN     "showTrendingProducts" BOOLEAN NOT NULL DEFAULT true;

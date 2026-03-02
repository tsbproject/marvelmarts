/*
  Warnings:

  - You are about to drop the column `showHeroCarousel` on the `site_settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "site_settings" DROP COLUMN "showHeroCarousel",
ADD COLUMN     "showEcommerceCarousel" BOOLEAN NOT NULL DEFAULT true;

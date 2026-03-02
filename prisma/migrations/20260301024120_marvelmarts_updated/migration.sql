/*
  Warnings:

  - You are about to drop the column `showCategories` on the `site_settings` table. All the data in the column will be lost.
  - You are about to drop the column `showHero` on the `site_settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "site_settings" DROP COLUMN "showCategories",
DROP COLUMN "showHero";

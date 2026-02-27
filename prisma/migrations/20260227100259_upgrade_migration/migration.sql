/*
  Warnings:

  - You are about to drop the `NewsletterSubscriber` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "accentColor" TEXT NOT NULL DEFAULT '#1E1E1E',
ADD COLUMN     "baseFontSize" INTEGER NOT NULL DEFAULT 16,
ADD COLUMN     "bodyBg" TEXT NOT NULL DEFAULT '#F8F8F8',
ADD COLUMN     "borderDefault" TEXT NOT NULL DEFAULT '#E5E7EB',
ADD COLUMN     "cardBg" TEXT NOT NULL DEFAULT '#FFFFFF',
ADD COLUMN     "errorColor" TEXT NOT NULL DEFAULT '#EF4444',
ADD COLUMN     "fontFamily" TEXT NOT NULL DEFAULT 'Inter',
ADD COLUMN     "headingFont" TEXT NOT NULL DEFAULT 'Outfit',
ADD COLUMN     "infoColor" TEXT NOT NULL DEFAULT '#3B82F6',
ADD COLUMN     "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "primaryColor" TEXT NOT NULL DEFAULT '#002B5B',
ADD COLUMN     "secondaryColor" TEXT NOT NULL DEFAULT '#F7931E',
ADD COLUMN     "sidebarBg" TEXT NOT NULL DEFAULT '#002B5B',
ADD COLUMN     "siteFavicon" TEXT,
ADD COLUMN     "siteLogo" TEXT,
ADD COLUMN     "siteName" TEXT NOT NULL DEFAULT 'MarvelMarts',
ADD COLUMN     "successColor" TEXT NOT NULL DEFAULT '#10B981',
ADD COLUMN     "textPrimary" TEXT NOT NULL DEFAULT '#1E1E1E',
ADD COLUMN     "textSecondary" TEXT NOT NULL DEFAULT '#4B4B4B',
ADD COLUMN     "warningColor" TEXT NOT NULL DEFAULT '#FBBF24';

-- DropTable
DROP TABLE "NewsletterSubscriber";

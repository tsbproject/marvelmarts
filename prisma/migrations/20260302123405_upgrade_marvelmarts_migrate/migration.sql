-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN     "facebookUrl" TEXT,
ADD COLUMN     "footerBodyFontSize" INTEGER DEFAULT 16,
ADD COLUMN     "footerHeadingFontSize" INTEGER DEFAULT 20,
ADD COLUMN     "footerLogo" TEXT,
ADD COLUMN     "instagramUrl" TEXT,
ADD COLUMN     "twitterUrl" TEXT,
ADD COLUMN     "whatsappUrl" TEXT;

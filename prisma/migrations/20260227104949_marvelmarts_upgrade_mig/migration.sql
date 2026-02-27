-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "headerHeightDesktop" INTEGER NOT NULL DEFAULT 55,
ADD COLUMN     "headerHeightMobile" INTEGER NOT NULL DEFAULT 35,
ADD COLUMN     "showCartDrawer" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showCategoryMenu" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showHelpMenu" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showSearchBar" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "stickyHeader" BOOLEAN NOT NULL DEFAULT true;

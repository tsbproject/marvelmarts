/*
  Warnings:

  - You are about to drop the column `permissions` on the `AdminProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AdminProfile" DROP COLUMN "permissions",
ADD COLUMN     "manageActivity" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "manageAdmins" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "manageBlogs" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "manageCategories" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "manageMessages" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "manageOrders" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "managePayout" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "manageProducts" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "manageReviews" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "manageSettings" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "manageSubscribers" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "manageSupport" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "manageTrending" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "manageUsers" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "manageVendors" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "manageVerifivations" BOOLEAN NOT NULL DEFAULT false;

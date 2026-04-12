/*
  Warnings:

  - You are about to drop the column `score` on the `VendorScore` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `VendorScore` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "VendorScore" DROP CONSTRAINT "VendorScore_vendorProfileId_fkey";

-- AlterTable
ALTER TABLE "VendorScore" DROP COLUMN "score",
ADD COLUMN     "fulfillmentRate" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "rating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "reviewsCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AddForeignKey
ALTER TABLE "VendorScore" ADD CONSTRAINT "VendorScore_vendorProfileId_fkey" FOREIGN KEY ("vendorProfileId") REFERENCES "VendorProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

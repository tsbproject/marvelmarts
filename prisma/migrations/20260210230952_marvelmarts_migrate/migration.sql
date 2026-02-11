/*
  Warnings:

  - Made the column `vendorProfileId` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `vendorProfileId` on table `Product` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "vendorProfileId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "vendorProfileId" SET NOT NULL;

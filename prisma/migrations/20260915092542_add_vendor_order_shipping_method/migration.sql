/*
  Warnings:

  - Added the required column `shippingMethod` to the `VendorOrder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "VendorOrder" ADD COLUMN     "shippingMethod" TEXT NOT NULL;

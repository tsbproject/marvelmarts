/*
  Warnings:

  - Made the column `phoneNumber` on table `VendorProfile` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "VendorProfile" ALTER COLUMN "phoneNumber" SET NOT NULL;

/*
  Warnings:

  - Added the required column `vendorProfileId` to the `Payout` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PayoutStatus" ADD VALUE 'COMPLETED';
ALTER TYPE "PayoutStatus" ADD VALUE 'FAILED';

-- AlterTable
ALTER TABLE "Payout" ADD COLUMN     "accountName" TEXT,
ADD COLUMN     "accountNumber" TEXT,
ADD COLUMN     "bankName" TEXT,
ADD COLUMN     "vendorProfileId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Payout_vendorProfileId_idx" ON "Payout"("vendorProfileId");

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_vendorProfileId_fkey" FOREIGN KEY ("vendorProfileId") REFERENCES "VendorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

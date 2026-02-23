-- DropForeignKey
ALTER TABLE "Payout" DROP CONSTRAINT "Payout_vendorProfileId_fkey";

-- AlterTable
ALTER TABLE "Payout" ADD COLUMN     "adminRemarks" TEXT,
ADD COLUMN     "processedAt" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_vendorProfileId_fkey" FOREIGN KEY ("vendorProfileId") REFERENCES "VendorProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

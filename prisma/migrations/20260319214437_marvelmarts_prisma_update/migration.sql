-- DropForeignKey
ALTER TABLE "CreditTransaction" DROP CONSTRAINT "CreditTransaction_vendorProfileId_fkey";

-- AlterTable
ALTER TABLE "CreditTransaction" ADD COLUMN     "emailSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "emailSentAt" TIMESTAMP(3),
ALTER COLUMN "status" DROP DEFAULT;

-- AlterTable
ALTER TABLE "VendorBoost" ADD COLUMN     "exhaustedAlertSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lowCreditAlertSent" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "CreditTransaction" ADD CONSTRAINT "CreditTransaction_vendorProfileId_fkey" FOREIGN KEY ("vendorProfileId") REFERENCES "VendorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "vendorId" TEXT;

-- AlterTable
ALTER TABLE "VendorProfile" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "coverUrl" TEXT,
ADD COLUMN     "logoUrl" TEXT;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

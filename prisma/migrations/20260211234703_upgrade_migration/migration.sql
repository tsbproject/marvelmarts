-- CreateEnum
CREATE TYPE "VendorStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "VendorProfile" ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "status" "VendorStatus" NOT NULL DEFAULT 'PENDING';

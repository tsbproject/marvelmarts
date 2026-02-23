-- AlterTable
ALTER TABLE "VendorProfile" ADD COLUMN     "productDone" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "profileDone" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "storeDone" BOOLEAN NOT NULL DEFAULT false;

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "refundStatus" TEXT,
ADD COLUMN     "trackingNumber" TEXT;

-- CreateTable
CREATE TABLE "Coupon" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "discountValue" DECIMAL(10,2) NOT NULL,
    "isPercentage" BOOLEAN NOT NULL DEFAULT true,
    "limit" INTEGER NOT NULL DEFAULT 1,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlashSale" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "FlashSale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProductToFlashSale" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProductToFlashSale_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");

-- CreateIndex
CREATE INDEX "_ProductToFlashSale_B_index" ON "_ProductToFlashSale"("B");

-- AddForeignKey
ALTER TABLE "_ProductToFlashSale" ADD CONSTRAINT "_ProductToFlashSale_A_fkey" FOREIGN KEY ("A") REFERENCES "FlashSale"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductToFlashSale" ADD CONSTRAINT "_ProductToFlashSale_B_fkey" FOREIGN KEY ("B") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

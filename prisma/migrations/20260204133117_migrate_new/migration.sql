/*
  Warnings:

  - A unique constraint covering the columns `[refundReference]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "refundReason" TEXT,
ADD COLUMN     "refundReference" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Order_refundReference_key" ON "Order"("refundReference");

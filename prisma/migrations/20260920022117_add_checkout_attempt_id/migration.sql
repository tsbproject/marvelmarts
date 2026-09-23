/*
  Warnings:

  - A unique constraint covering the columns `[checkoutAttemptId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "checkoutAttemptId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Order_checkoutAttemptId_key" ON "Order"("checkoutAttemptId");

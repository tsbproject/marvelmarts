/*
  Warnings:

  - You are about to drop the column `paymentType` on the `Order` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PaymentTypes" AS ENUM ('CARD', 'BANK_TRANSFER', 'WALLET', 'CASH_ON_DELIVERY');

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "paymentType",
ADD COLUMN     "paymentTypes" "PaymentTypes";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "paymentTypes" "PaymentTypes"[];

-- DropEnum
DROP TYPE "PaymentType";

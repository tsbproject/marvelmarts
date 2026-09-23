-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "paymentInitializationAt" TIMESTAMP(3),
ADD COLUMN     "paymentInitializationStatus" TEXT;

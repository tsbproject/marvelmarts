-- CreateEnum
CREATE TYPE "NotificationContext" AS ENUM ('CUSTOMER', 'VENDOR', 'ADMIN');

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "context" "NotificationContext";

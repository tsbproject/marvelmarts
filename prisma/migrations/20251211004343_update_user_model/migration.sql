/*
  Warnings:

  - You are about to drop the column `verificationCode` on the `VendorProfile` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "VerificationType" AS ENUM ('CUSTOMER_REGISTRATION', 'VENDOR_REGISTRATION');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "IsVerified" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "VendorProfile" DROP COLUMN "verificationCode";

-- CreateTable
CREATE TABLE "VerificationCode" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT NOT NULL,
    "hashedPassword" TEXT NOT NULL,
    "name" TEXT,
    "code" TEXT NOT NULL,
    "type" "VerificationType" NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vendorData" JSONB,

    CONSTRAINT "VerificationCode_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "VerificationCode" ADD CONSTRAINT "VerificationCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

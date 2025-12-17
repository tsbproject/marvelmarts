-- AlterTable
ALTER TABLE "User" ALTER COLUMN "passwordHash" DROP NOT NULL;

-- AlterTable
ALTER TABLE "VerificationCode" ALTER COLUMN "hashedPassword" DROP NOT NULL;

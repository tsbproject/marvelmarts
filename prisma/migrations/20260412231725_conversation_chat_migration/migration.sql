/*
  Warnings:

  - A unique constraint covering the columns `[guestAccessToken]` on the table `Conversation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ConversationStatus" AS ENUM ('OPEN', 'CLOSED');

-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "endedAt" TIMESTAMP(3),
ADD COLUMN     "endedById" TEXT,
ADD COLUMN     "endedByRole" TEXT,
ADD COLUMN     "guestAccessToken" TEXT,
ADD COLUMN     "isGuest" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status" "ConversationStatus" NOT NULL DEFAULT 'OPEN',
ADD COLUMN     "visitorEmail" TEXT,
ADD COLUMN     "visitorName" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_guestAccessToken_key" ON "Conversation"("guestAccessToken");

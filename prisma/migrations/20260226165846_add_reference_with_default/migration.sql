/*
  Warnings:

  - A unique constraint covering the columns `[reference]` on the table `Payout` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Payout" ADD COLUMN     "reference" TEXT NOT NULL DEFAULT 'PENDING_REF';

-- CreateIndex
CREATE UNIQUE INDEX "Payout_reference_key" ON "Payout"("reference");

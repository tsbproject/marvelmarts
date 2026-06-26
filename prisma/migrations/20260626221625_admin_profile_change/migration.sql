/*
  Warnings:

  - You are about to drop the column `manageVerifivations` on the `AdminProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AdminProfile" DROP COLUMN "manageVerifivations",
ADD COLUMN     "manageVerifications" BOOLEAN NOT NULL DEFAULT false;

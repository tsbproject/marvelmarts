-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "deletedForUserIds" TEXT[] DEFAULT ARRAY[]::TEXT[];

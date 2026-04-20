-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "deletedByParticipantIds" TEXT[] DEFAULT ARRAY[]::TEXT[];

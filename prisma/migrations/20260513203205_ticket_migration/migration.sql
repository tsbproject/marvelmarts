-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "attachment" TEXT,
ADD COLUMN     "category" TEXT,
ADD COLUMN     "priority" TEXT DEFAULT 'MEDIUM';

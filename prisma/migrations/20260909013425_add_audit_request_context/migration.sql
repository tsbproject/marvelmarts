-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "requestMethod" TEXT,
ADD COLUMN     "requestPath" TEXT;

-- CreateIndex
CREATE INDEX "AuditLog_requestPath_idx" ON "AuditLog"("requestPath");

-- Convert AuditLog.actorRole from the admin-only Role enum
-- to the full UserRole enum without losing existing values.

ALTER TABLE "AuditLog"
ADD COLUMN "actorRole_new" "UserRole";

UPDATE "AuditLog"
SET "actorRole_new" =
  CASE
    WHEN "actorRole"::text = 'SUPER_ADMIN'
      THEN 'SUPER_ADMIN'::"UserRole"
    WHEN "actorRole"::text = 'ADMIN'
      THEN 'ADMIN'::"UserRole"
    ELSE NULL
  END;

ALTER TABLE "AuditLog"
DROP COLUMN "actorRole";

ALTER TABLE "AuditLog"
RENAME COLUMN "actorRole_new" TO "actorRole";

CREATE INDEX "AuditLog_actorRole_idx"
ON "AuditLog"("actorRole");

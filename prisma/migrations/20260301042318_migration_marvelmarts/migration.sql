-- AlterTable
CREATE SEQUENCE site_settings_id_seq;
ALTER TABLE "site_settings" ALTER COLUMN "id" SET DEFAULT nextval('site_settings_id_seq');
ALTER SEQUENCE site_settings_id_seq OWNED BY "site_settings"."id";

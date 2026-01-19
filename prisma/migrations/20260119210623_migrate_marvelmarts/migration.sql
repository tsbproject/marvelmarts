-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "footerDesc" TEXT NOT NULL DEFAULT 'Africa''s most trusted marketplace.',
    "supportPhone" TEXT NOT NULL DEFAULT '+234 800-MARVEL',
    "supportEmail" TEXT NOT NULL DEFAULT 'help@marvelmarts.com',
    "flashSaleActive" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

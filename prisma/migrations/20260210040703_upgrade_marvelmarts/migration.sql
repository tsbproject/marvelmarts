-- CreateEnum
CREATE TYPE "VendorTier" AS ENUM ('BRONZE', 'SILVER', 'GOLD');

-- CreateEnum
CREATE TYPE "DisputeStatus" AS ENUM ('OPEN', 'RESOLVED', 'REJECTED');

-- CreateTable
CREATE TABLE "VendorOnboarding" (
    "id" TEXT NOT NULL,
    "vendorProfileId" TEXT NOT NULL,
    "profileDone" BOOLEAN NOT NULL DEFAULT false,
    "storeDone" BOOLEAN NOT NULL DEFAULT false,
    "productDone" BOOLEAN NOT NULL DEFAULT false,
    "completed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "VendorOnboarding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorStore" (
    "id" TEXT NOT NULL,
    "vendorProfileId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logo" TEXT,
    "banner" TEXT,
    "description" TEXT,
    "followers" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "VendorStore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorBoost" (
    "id" TEXT NOT NULL,
    "vendorProfileId" TEXT NOT NULL,
    "credits" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "VendorBoost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorScore" (
    "id" TEXT NOT NULL,
    "vendorProfileId" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "tier" "VendorTier" NOT NULL DEFAULT 'BRONZE',

    CONSTRAINT "VendorScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dispute" (
    "id" TEXT NOT NULL,
    "vendorProfileId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "DisputeStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Dispute_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VendorOnboarding_vendorProfileId_key" ON "VendorOnboarding"("vendorProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "VendorStore_vendorProfileId_key" ON "VendorStore"("vendorProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "VendorStore_slug_key" ON "VendorStore"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "VendorBoost_vendorProfileId_key" ON "VendorBoost"("vendorProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "VendorScore_vendorProfileId_key" ON "VendorScore"("vendorProfileId");

-- AddForeignKey
ALTER TABLE "VendorOnboarding" ADD CONSTRAINT "VendorOnboarding_vendorProfileId_fkey" FOREIGN KEY ("vendorProfileId") REFERENCES "VendorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorStore" ADD CONSTRAINT "VendorStore_vendorProfileId_fkey" FOREIGN KEY ("vendorProfileId") REFERENCES "VendorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorBoost" ADD CONSTRAINT "VendorBoost_vendorProfileId_fkey" FOREIGN KEY ("vendorProfileId") REFERENCES "VendorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorScore" ADD CONSTRAINT "VendorScore_vendorProfileId_fkey" FOREIGN KEY ("vendorProfileId") REFERENCES "VendorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_vendorProfileId_fkey" FOREIGN KEY ("vendorProfileId") REFERENCES "VendorProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

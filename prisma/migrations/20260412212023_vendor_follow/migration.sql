-- CreateTable
CREATE TABLE "VendorFollow" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vendorProfileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VendorFollow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VendorFollow_userId_vendorProfileId_key" ON "VendorFollow"("userId", "vendorProfileId");

-- AddForeignKey
ALTER TABLE "VendorFollow" ADD CONSTRAINT "VendorFollow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorFollow" ADD CONSTRAINT "VendorFollow_vendorProfileId_fkey" FOREIGN KEY ("vendorProfileId") REFERENCES "VendorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

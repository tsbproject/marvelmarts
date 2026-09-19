-- CreateTable
CREATE TABLE "VendorOrder" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "vendorProfileId" TEXT NOT NULL,
    "merchandiseSubtotal" DECIMAL(10,2) NOT NULL,
    "shipping" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(10,2) NOT NULL,
    "commissionRate" DECIMAL(5,2),
    "commissionAmount" DECIMAL(10,2),
    "vendorNet" DECIMAL(10,2),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "refundStatus" TEXT,
    "refundReason" TEXT,
    "cancelReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorOrderItem" (
    "id" TEXT NOT NULL,
    "vendorOrderId" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,

    CONSTRAINT "VendorOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VendorOrder_orderId_idx"
ON "VendorOrder"("orderId");

-- CreateIndex
CREATE INDEX "VendorOrder_vendorProfileId_idx"
ON "VendorOrder"("vendorProfileId");

-- CreateIndex
CREATE INDEX "VendorOrder_vendorProfileId_status_idx"
ON "VendorOrder"("vendorProfileId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "VendorOrder_orderId_vendorProfileId_key"
ON "VendorOrder"("orderId", "vendorProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "VendorOrderItem_orderItemId_key"
ON "VendorOrderItem"("orderItemId");

-- CreateIndex
CREATE INDEX "VendorOrderItem_vendorOrderId_idx"
ON "VendorOrderItem"("vendorOrderId");

-- AddForeignKey
ALTER TABLE "VendorOrder"
ADD CONSTRAINT "VendorOrder_orderId_fkey"
FOREIGN KEY ("orderId")
REFERENCES "Order"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorOrder"
ADD CONSTRAINT "VendorOrder_vendorProfileId_fkey"
FOREIGN KEY ("vendorProfileId")
REFERENCES "VendorProfile"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorOrderItem"
ADD CONSTRAINT "VendorOrderItem_vendorOrderId_fkey"
FOREIGN KEY ("vendorOrderId")
REFERENCES "VendorOrder"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorOrderItem"
ADD CONSTRAINT "VendorOrderItem_orderItemId_fkey"
FOREIGN KEY ("orderItemId")
REFERENCES "OrderItem"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;